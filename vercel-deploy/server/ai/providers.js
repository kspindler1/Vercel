// Provider order comes from AI_PROVIDERS (comma list); only providers with a real key are used.
const PLACEHOLDER = /^(your_|changeme|xxx|<)/i;
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || (process.env.VERCEL ? 50000 : 120000);
// Time left in the overall budget, so retries never outlast the host's function limit.
const budget = (started) => Math.max(1000, TIMEOUT_MS - (Date.now() - started));
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const WAF_MARKERS = ['"incidentid"', '"proxyid"', "blocked by our security service", "fault:messageblocked"];
const APOLLO_TOKEN_URL = process.env.APOLLO_TOKEN_URL || "https://api-mgmt.boehringer-ingelheim.com:8065/api/oauth/token";
const APOLLO_BASE_URL = process.env.APOLLO_BASE_URL || "https://gateway-apollo-prod.apps.eu-prod.ocp.aws.boehringer.com";

function env(name) {
  const value = (process.env[name] || "").trim();
  return value && !PLACEHOLDER.test(value) ? value : "";
}

async function readError(response) {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body);
    return parsed.error?.message || parsed.message || body.slice(0, 300);
  } catch {
    return body.slice(0, 300);
  }
}

function abortableDelay(ms, signal) {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/* ---------------- Apollo (internal gateway) ---------------- */

const apolloState = { token: "", expiresAt: 0, cookies: new Map() };

function cookieHeader() {
  return [...apolloState.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
}

function absorbCookies(response) {
  const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const line of setCookies) {
    const [pair] = line.split(";");
    const index = pair.indexOf("=");
    if (index > 0) apolloState.cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

async function fetchApolloToken(signal) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env("APOLLO_CLIENT_ID"),
    client_secret: env("APOLLO_CLIENT_SECRET")
  });
  let url = APOLLO_TOKEN_URL;
  // The token endpoint can answer with an Imperva challenge redirect; keep its cookies and retry.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, {
      method: "POST",
      body,
      redirect: "manual",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": BROWSER_UA,
        ...(apolloState.cookies.size ? { Cookie: cookieHeader() } : {})
      },
      signal
    });
    absorbCookies(response);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) url = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Apollo token request failed (${response.status}): ${await readError(response)}`);
    const data = await response.json();
    if (!data.access_token) throw new Error("Apollo token response had no access_token.");
    apolloState.token = data.access_token;
    apolloState.expiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000 - 30000;
    return apolloState.token;
  }
  throw new Error("Apollo token endpoint kept answering with a security challenge.");
}

async function apolloToken(signal, force = false) {
  if (!force && apolloState.token && Date.now() < apolloState.expiresAt) return apolloState.token;
  return fetchApolloToken(signal);
}

function apolloEndpoint(anthropic = false) {
  const base = APOLLO_BASE_URL.replace(/\/+$/, "");
  const path = env(anthropic ? "APOLLO_ANTHROPIC_PATH" : "APOLLO_CHAT_PATH") ||
    (anthropic ? "/llm-api/v1/messages" : "/llm-api/chat/completions");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Backticks trip the Apollo web firewall, and Bedrock rejects null content.
function cleanForApollo(text) {
  return String(text ?? "").replace(/`/g, "");
}

async function callApollo(prompt, systemInstruction, signal) {
  const model = env("APOLLO_MODEL") || "gpt-5.4";
  const anthropic = /^claude[-_]/i.test(model);
  const body = JSON.stringify({
    model,
    temperature: 0.25,
    ...(anthropic
      ? {
          max_tokens: 8192,
          system: cleanForApollo(systemInstruction),
          messages: [{ role: "user", content: cleanForApollo(prompt) }]
        }
      : {
          messages: [
            { role: "system", content: cleanForApollo(systemInstruction) },
            { role: "user", content: cleanForApollo(prompt) }
          ]
        })
  });
  let lastError = "";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const token = await apolloToken(signal, attempt > 0 && /^40[13]/.test(lastError));
    const response = await fetch(apolloEndpoint(anthropic), {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(anthropic ? { "anthropic-version": "2023-06-01", "x-api-key": "APOLLO_OAUTH" } : {}),
        "User-Agent": BROWSER_UA,
        ...(apolloState.cookies.size ? { Cookie: cookieHeader() } : {})
      },
      signal
    });
    absorbCookies(response);
    if (response.ok) {
      const data = await response.json();
      const content = anthropic
        ? data.content?.filter((part) => part.type === "text").map((part) => part.text).join("")
        : data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Apollo returned an empty response.");
      return content;
    }
    const detail = await readError(response);
    lastError = `${response.status} ${detail}`;
    const lower = lastError.toLowerCase();
    if (WAF_MARKERS.some((marker) => lower.includes(marker))) {
      throw new Error(`Apollo firewall blocked the request: ${detail}`);
    }
    const transient = response.status === 429 || response.status >= 500 || ((response.status === 401 || response.status === 403) && lower.includes("internal error"));
    if (!transient && response.status !== 401) break;
    await abortableDelay(800 * (attempt + 1), signal);
  }
  throw new Error(`Apollo request failed: ${lastError}`);
}

/* ---------------- Public providers (optional fallbacks) ---------------- */

async function callGemini(prompt, systemInstruction, signal) {
  const model = env("GEMINI_MODEL") || "gemini-flash-latest";
  const base = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 8192 }
  });
  let lastError = "";
  const started = Date.now();
  // Gemini often answers 429/503 ("high demand") briefly; retry a few times before giving up.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env("GEMINI_API_KEY") },
      body,
      signal
    });
    if (response.ok) {
      const data = await response.json();
      const content = (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("");
      if (!content) throw new Error(`Gemini returned an empty response${data.promptFeedback?.blockReason ? ` (blocked: ${data.promptFeedback.blockReason})` : ""}.`);
      return content;
    }
    lastError = `${response.status}: ${await readError(response)}`;
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    const wait = 1500 * (attempt + 1);
    if (Date.now() - started + wait >= TIMEOUT_MS) break;
    await abortableDelay(wait, signal);
  }
  throw new Error(`Gemini request failed (${lastError})`);
}

async function callOpenAI(prompt, systemInstruction, signal) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env("OPENAI_API_KEY")}` },
    body: JSON.stringify({
      model: env("OPENAI_MODEL") || "gpt-4o-mini",
      temperature: 0.25,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ]
    }),
    signal
  });
  if (!response.ok) throw new Error(`OpenAI request failed (${response.status}): ${await readError(response)}`);
  const content = (await response.json()).choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");
  return content;
}

async function callClaude(prompt, systemInstruction, signal) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: env("ANTHROPIC_MODEL") || "claude-3-5-haiku-latest",
      max_tokens: 8192,
      temperature: 0.25,
      system: systemInstruction,
      messages: [{ role: "user", content: prompt }]
    }),
    signal
  });
  if (!response.ok) throw new Error(`Claude request failed (${response.status}): ${await readError(response)}`);
  const data = await response.json();
  const content = data.content?.filter((part) => part.type === "text").map((part) => part.text).join("");
  if (!content) throw new Error("Claude returned an empty response.");
  return content;
}

async function callGateway(prompt, systemInstruction, signal) {
  const base = (process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1").replace(/\/+$/, "");
  const body = JSON.stringify({
    model: env("AI_GATEWAY_MODEL"),
    temperature: 0.25,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ]
  });
  let lastError = "";
  const started = Date.now();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env("AI_GATEWAY_API_KEY")}` },
      body,
      signal
    });
    if (response.ok) {
      const content = (await response.json()).choices?.[0]?.message?.content;
      if (!content) throw new Error("AI Gateway returned an empty response.");
      return content;
    }
    lastError = `${response.status}: ${await readError(response)}`;
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    const wait = 1500 * (attempt + 1);
    if (Date.now() - started + wait >= TIMEOUT_MS) break;
    await abortableDelay(wait, signal);
  }
  throw new Error(`AI Gateway request failed (${lastError})`);
}

const providers = {
  gateway: { call: callGateway, ready: () => Boolean(env("AI_GATEWAY_API_KEY") && env("AI_GATEWAY_MODEL")) },
  apollo: { call: callApollo, ready: () => Boolean(env("APOLLO_CLIENT_ID") && env("APOLLO_CLIENT_SECRET")) },
  gemini: { call: callGemini, ready: () => Boolean(env("GEMINI_API_KEY")) },
  openai: { call: callOpenAI, ready: () => Boolean(env("OPENAI_API_KEY")) },
  claude: { call: callClaude, ready: () => Boolean(env("ANTHROPIC_API_KEY")) }
};

// Only providers named in AI_PROVIDERS may receive user text; the default is Gemini alone.
export function allowedProviders() {
  const listed = (process.env.AI_PROVIDERS || process.env.AI_PROVIDER || "gemini")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter((name, index, all) => providers[name] && all.indexOf(name) === index);
  return listed.filter((name) => providers[name].ready());
}

export async function generateResponse(provider, prompt, systemInstruction, timeoutMs = TIMEOUT_MS) {
  if (!providers[provider]) throw new Error(`Unsupported AI provider: ${provider}`);
  const boundedTimeout = Math.max(1000, Math.floor(timeoutMs));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), boundedTimeout);
  try {
    return await providers[provider].call(prompt, systemInstruction, controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`${provider} did not respond within ${Math.ceil(boundedTimeout / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWithFallback(prompt, systemInstruction) {
  const names = allowedProviders();
  if (!names.length) {
    throw new Error("No AI provider is configured. Check AI_PROVIDERS and the matching keys in the server .env file.");
  }
  const failures = [];
  const deadline = Date.now() + Math.max(1000, TIMEOUT_MS - (process.env.VERCEL ? 5000 : 0));
  for (let index = 0; index < names.length; index += 1) {
    const provider = names[index];
    const providersRemaining = names.length - index;
    const timeoutMs = Math.floor((deadline - Date.now()) / providersRemaining);
    if (timeoutMs < 1000) break;
    try {
      return { content: await generateResponse(provider, prompt, systemInstruction, timeoutMs), provider };
    } catch (error) {
      console.error(`AI provider ${provider} failed:`, {
        message: error.message,
        causeMessage: error.cause?.message,
        causeCode: error.cause?.code
      });
      failures.push(`${provider}: ${error.message}`);
    }
  }
  throw new Error(`All configured AI providers failed. ${failures.join(" | ")}`);
}
