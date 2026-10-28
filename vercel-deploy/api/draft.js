import { generateSectionDraft } from "../server/handlers.js";

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  try {
    return response.status(200).json(await generateSectionDraft(request.body));
  } catch (error) {
    console.error("draft failed:", error.message);
    const status = ["must be", "Unknown", "too long"].some((text) => error.message.includes(text)) ? 400 : 502;
    return response.status(status).json({ error: error.message });
  }
}
