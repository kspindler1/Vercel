import {
  applySuggestionContext,
  decisionDetailSuggestions,
  followUpSuggestions,
  stepAnswerSuggestions
} from "./discoverySuggestions.js";

export const discoverySteps = [
  {
    key: "problem",
    title: "Business problem",
    prompt: "What process needs improvement? What part of it is done by hand today?",
    followUps: [
      "What is a lengthy or repetitive task you currently perform manually at work? Give examples.",
      "What sets the task off, and how often does it happen?",
      "How long does one round take, and how many people do it? How many rounds are in the complete task? What are the supporting functional groups?",
      "What goes wrong today (errors, rework, delays, gaps in knowledge)?",
      "What happens downstream if it is wrong, missing, or late?",
      "What would success look like, and how would you measure it?"
    ],
    placeholder: "Describe the workflow, pain point, trigger, frequency, effort, impact, and measurable outcome."
  },
  {
    key: "users",
    title: "Users",
    prompt: "Who will use this agent, and who benefits from it?",
    followUps: [
      "What are the users' roles (for example, data steward, data manager, or programmer)?",
      "How many people would use it, and how often?",
      "How technical are the users?",
      "Who reviews or approves what the agent produces?"
    ],
    placeholder: "List the users, beneficiaries, usage frequency, technical comfort, reviewers, and approvers."
  },
  {
    key: "interaction",
    title: "User interaction boundaries",
    prompt: "How should the agent interact with users before it takes action?",
    followUps: [
      "What is the maximum number of clarifying questions allowed in sequence?",
      "When information is missing, should the agent ask for it, make reasonable assumptions, use approved defaults, or abort the workflow?",
    ],
    decisions: [
      { id: "askClarifyingQuestions", question: "Should the agent ask clarifying questions before taking action?" },
      { id: "summarizeBeforeExecution", question: "Should the agent summarize its understanding before executing?" }
    ],
    placeholder: "Define clarification limits, missing-information behavior, approved defaults, and whether the agent must confirm its understanding."
  },
  {
    key: "inputs",
    title: "Inputs",
    prompt: "What information does the agent need to start?",
    followUps: [
      "What repetitive manual task do you want to hand off? Give a real example.",
      "What does the user provide to start (files, study ID, a question)?",
      "Which documents or systems does the agent need? Where do they live, and who owns them?",
      "How often do you do it, and how long does it take each time?",
      "How many steps does this take? List each step from start to finish",
      "What goes wrong today (errors, rework, delays, gaps in knowledge)?",
      "What happens downstream when it is wrong, missing, or late?",
      "What would success look like, and how would you measure it?"
    ],
    placeholder: "Describe the task, required user inputs, needed documents and locations, task frequency, steps from start to finish, current problems, downstream impact, any rules the agent must follow, and measurable success."
  },
  {
    key: "processing",
    title: "Processing",
    prompt: "What steps does a person follow today?",
    followUps: [
      "How many people or functional groups are part of this process? Name all steps and the owner of each step.",
      "What are the steps, in order, and who owns each one?",
      "Which steps follow fixed rules, and which need judgment?",
      "When should the agent stop and hand off to a person?",
      "What should the agent do when data is missing, unclear, or conflicting?",
      "What should the agent never do?"
    ],
    placeholder: "List the current steps in order, including rules, judgment points, exceptions, and missing-data handling."
  },
  {
    key: "troubleshooting",
    title: "Troubleshooting behavior",
    prompt: "How should the agent diagnose and resolve problems?",
    followUps: [
      "Should the agent troubleshoot interactively or provide all possible fixes at once?",
      "What is the maximum troubleshooting depth before escalation?",
    ],
    decisions: [
      { id: "validateTroubleshootingStep", question: "Must the agent validate the result of each troubleshooting step before moving on?" },
      { id: "adaptTroubleshooting", question: "Should the agent adapt the next step based on the user's response?" },
      { id: "maintainHypotheses", question: "Should the agent maintain a hypothesis list of possible root causes?" },
      { id: "explainTroubleshooting", question: "Should the agent explain why each troubleshooting step is being performed?" }
    ],
    exampleRule: "Never provide more than one high-confidence troubleshooting action per turn. Validate the outcome before moving to the next diagnostic step.",
    placeholder: "Define the diagnostic sequence, validation behavior, hypothesis tracking, explanation level, and escalation depth."
  },
  {
    key: "tools",
    title: "Tools & plugins",
    prompt: "Which tools and plugins may the agent use, and under what restrictions?",
    followUps: [
      "Which platform's catalog will you build from: Microsoft (Copilot Studio actions, Power Platform connectors, Graph connectors) or Dify (built-in tools, marketplace plugins, custom OpenAPI/MCP tools)?",
      "Which tools, plugins, and connectors can the agent invoke (for example, SharePoint, Outlook, Veeva, Databricks, Excel, or Power Automate)?",
      "Which tools are read-only?",
      "Which tools can modify external systems?",
      "What approval is required before write actions?",
      "Which plugins send data outside your tenant or to a third party, and is that allowed for this data classification?"
    ],
    decisions: [
      { id: "allowAutomaticToolCalls", question: "Should approved tools be called automatically when needed?" },
      { id: "requireCostValidation", question: "Are there cost-sensitive tools that require additional validation?" }
    ],
    exampleRule: "Use search tools automatically for fact verification. Require user confirmation before any external write action.",
    placeholder: "List allowed tools and plugins, their catalog/source, read/write scope, automatic-use rules, approval requirements, identities, data-egress limits, and cost controls."
  },
  {
    key: "risks",
    title: "Risk assessment",
    prompt: "What could go wrong, and how serious would it be?",
    followUps: [
      "Does the task involve patient data, PII, or confidential data?",
      "Are there GxP, validation, or audit-trail requirements?",
      "What happens if the agent is wrong? Is the risk low, medium, or high?",
      "Could a wrong output reach a regulator, patient, or decision-maker?"
    ],
    placeholder: "Describe sensitive data, regulated context, failure impact, severity, and affected people or decisions."
  },
  {
    key: "knowledge",
    title: "Knowledge & skills",
    prompt: "What does the agent need to know to do this well?",
    followUps: [
      "Which SOPs, guidelines, data dictionaries, or standards apply? Where are they stored? Do you need to maintain them where they are stored?",
      "What domain terms or business rules does it need to understand?",
      "Are there past examples, including edge cases, it can learn from?",
      "Who is the subject-matter expert who checks its accuracy?",
      "Are there public websites that this agent needs to go to for information or knowledge? Which ones?"
    ],
    placeholder: "List approved knowledge sources, storage locations, maintenance requirements, public websites, business rules, examples, edge cases, owners, and subject-matter experts."
  },
  {
    key: "grounding",
    title: "Hallucination prevention",
    prompt: "How should the agent verify claims and communicate uncertainty?",
    followUps: [
      "What confidence threshold is required before making recommendations?",
      "What topics require external verification?"
    ],
    decisions: [
      { id: "distinguishFactsAssumptions", question: "Must the agent distinguish facts from assumptions?" },
      { id: "citeSources", question: "Should sources be cited?" },
      { id: "admitUncertainty", question: "Should the agent admit uncertainty?" }
    ],
    exampleRule: "If confidence is less than 80%, present findings as possibilities rather than facts.",
    placeholder: "Define evidence requirements, citation rules, confidence thresholds, uncertainty language, and topics requiring verification."
  },
  {
    key: "guardrails",
    title: "Guardrails & forbidden actions",
    prompt: "What should the agent absolutely never do, even if doing so appears to help complete the user's request?",
    followUps: [
      "What actions are off-limits (for example, never change master data)?",
      "When must a human review or approve before anything moves forward?",
      "What should the agent do when it is not sure: flag it, escalate it, or stop?",
      "What data must it never expose, retain, or share?",
      "Which scope, policy, authorization, or safety boundaries can never be bypassed?"
    ],
    placeholder: "Define hard prohibitions, approval gates, uncertainty handling, escalation, sensitive-data boundaries, and non-bypassable controls."
  },
  {
    key: "autonomy",
    title: "Agent autonomy level",
    prompt: "Which workflow decisions may the agent make on its own?",
    followUps: [],
    decisions: [
      { id: "decideWorkflowOrder", question: "Can the agent decide workflow order?" },
      { id: "skipUnnecessarySteps", question: "Can the agent skip unnecessary steps?" },
      { id: "selectToolsDynamically", question: "Can the agent dynamically select tools?" },
      { id: "createSubtasks", question: "Can the agent create sub-tasks?" },
      { id: "terminateEarly", question: "Can the agent terminate workflows early?" }
    ],
    exampleRule: "The agent may reorder workflow steps when doing so improves efficiency but must preserve required controls and outputs.",
    placeholder: "Define permitted reordering, skipped steps, dynamic tool selection, sub-tasks, early termination, and controls that always remain mandatory."
  },
  {
    key: "memory",
    title: "Memory management",
    prompt: "What may the agent remember, and for how long?",
    followUps: [
      "What information should be remembered?",
      "What information should never be remembered?",
      "How long should context remain active?",
    ],
    decisions: [
      { id: "usePreviousConversations", question: "Can previous conversations influence future outputs?" },
      { id: "memoryVisibleCorrectable", question: "Should memory be user-visible and correctable?" }
    ],
    exampleRule: "Remember approved user preferences, but never persist temporary workflow state or sensitive data without an explicit retention policy.",
    placeholder: "Define allowed and forbidden memory, retention duration, cross-conversation use, visibility, correction, and deletion."
  },
  {
    key: "recovery",
    title: "Error recovery",
    prompt: "How should the agent recover when a tool, model, or data source fails?",
    followUps: [
      "How should it handle tool failures?",
      "How many retries are allowed?",
      "What should happen if data sources disagree?",
    ],
    decisions: [
      { id: "useApprovedFallbacks", question: "Should approved fallback models or tools be used?" },
      { id: "allowPartialCompletion", question: "Should partial completion be allowed, and how must it be labeled?" }
    ],
    exampleRule: "When a tool fails, return a clearly labeled partial result when useful; never present missing work or an unverified fallback as complete.",
    placeholder: "Define retries, fallbacks, conflicting-source behavior, partial results, failure notices, rollback, and escalation."
  },
  {
    key: "instructionExport",
    title: "Agent instruction export",
    prompt: "What controls must every generated agent instruction package include?",
    followUps: [
      "Must the export include role, mission, scope, objective, inputs, outputs, constraints, allowed and forbidden actions, tool rules, escalation rules, memory rules, error handling, and success criteria?",
      "Should instructions be platform-agnostic or tailored to a platform such as Dify, LangGraph, Copilot Studio, or OpenAI Agents?",
      "Should generated instructions be executable, conceptual, or both?"
    ],
    decisions: [
      { id: "separateRequirementsAssumptions", question: "Must requirements be separated from assumptions and inferred requirements explicitly labeled?" },
      { id: "includeInstructionExamples", question: "Should generated instructions include examples?" },
      { id: "includeMeasurableOutcomes", question: "Must every instruction have a measurable outcome?" },
      { id: "includeDependencies", question: "Should instruction exports contain dependency lists?" },
      { id: "allowInferredRequirements", question: "Are inferred requirements allowed when they are explicitly labeled?" },
      { id: "requireExportGuardrails", question: "Must every exported agent definition contain explicit guardrails?" }
    ],
    exampleRule: "Never generate implementation instructions solely from inferred requirements. Label assumptions and include mission, scope, allowed actions, forbidden actions, tool policies, escalation policies, dependencies, and success metrics.",
    placeholder: "Define export detail, required sections, assumptions policy, examples, dependencies, measurable outcomes, platform specificity, and mandatory guardrails."
  },
  {
    key: "outputs",
    title: "Outputs & quality controls",
    prompt: "What should the agent produce, and how will output quality be controlled?",
    followUps: [
      "What format do you need? (summary, table, Excel, email, report, or your template)",
      "Who receives it, and where does it go (inbox, SharePoint, Veeva, ticket)?",
      "Who reviews or approves it before it is used?",
      "How will you know it worked? (time saved, fewer errors, percent accepted without edits)",
      "When something fails, what should the agent report for human review?",
    ],
    decisions: [
      { id: "conformToOutputTemplate", question: "Should outputs conform to a required template?" },
      { id: "requireOutputExplanations", question: "Are explanations mandatory, with a concise rationale rather than hidden chain-of-thought?" },
      { id: "requireOutputEvidence", question: "Does the output need citations or evidence for each conclusion?" }
    ],
    exampleRule: "Outputs must be actionable, structured, evidence-linked, and immediately usable without additional interpretation.",
    placeholder: "Describe the final format, destination, recipients, template, explanation level, brevity/completeness preference, evidence, and measurable quality criteria."
  },
  {
    key: "environment",
    title: "Platform & environment",
    prompt: "Where will the agent be built and run?",
    optional: true,
    followUps: [
      "Which platform will you use (Copilot Studio, Apollo/Dify, or Microsoft 365 Copilot)?",
      "Will it start in development or test before production?",
      "Who maintains the agent and handles changes?",
      "Who else could reuse it (other studies, therapeutic areas, or teams)?"
    ],
    placeholder: "Optional: describe the platform, environments, deployment path, maintainers, approved models, identity, and reuse opportunities."
  }
];

export const discoveryStepKeys = discoverySteps.map(({ key }) => key);
export const requiredDiscoveryStepKeys = discoverySteps.filter(({ optional }) => !optional).map(({ key }) => key);
export const discoveryDecisionQuestions = discoverySteps.flatMap((step) =>
  (step.decisions || []).map((decision) => ({ ...decision, stepKey: step.key, stepTitle: step.title }))
);
export const discoveryDecisionIds = discoveryDecisionQuestions.map(({ id }) => id);
export const discoveryQuestionResponseDefinitions = discoverySteps.flatMap((step) => [
  ...step.followUps.map((question, index) => ({
    id: `${step.key}.followUp.${index}`,
    question,
    stepKey: step.key,
    stepTitle: step.title,
    suggestion: followUpSuggestions[step.key]?.[index] || ""
  })),
  ...(step.decisions || []).map((decision) => ({
    id: `${step.key}.decision.${decision.id}.details`,
    question: `${decision.question} — Details`,
    stepKey: step.key,
    stepTitle: step.title,
    suggestion: decisionDetailSuggestions[decision.id] || ""
  }))
]);
export const discoveryQuestionResponseIds = discoveryQuestionResponseDefinitions.map(({ id }) => id);

const guardrailPattern = /\b(?:never|must not|do not|don't|without (?:changing|writing|updating|sending|sharing|submitting|deleting|approving|publishing|exposing)|human (?:review|approval)|requires? approval|draft[- ]only|read[- ]only)\b/i;

export function extractGuardrails(problem) {
  return problem
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && guardrailPattern.test(sentence));
}

export function createEmptyAnswers() {
  return Object.fromEntries(discoveryStepKeys.map((key) => [key, ""]));
}

export function createEmptyDecisions() {
  return {};
}

export function createEmptyQuestionResponses() {
  return {};
}

export function getFollowUpResponseId(stepKey, index) {
  return `${stepKey}.followUp.${index}`;
}

export function getDecisionDetailId(stepKey, decisionId) {
  return `${stepKey}.decision.${decisionId}.details`;
}

export function createTemplateDecisions() {
  return {
    askClarifyingQuestions: "Yes",
    summarizeBeforeExecution: "Yes",
    validateTroubleshootingStep: "Yes",
    adaptTroubleshooting: "Yes",
    maintainHypotheses: "Yes",
    explainTroubleshooting: "Yes",
    allowAutomaticToolCalls: "No",
    requireCostValidation: "Yes",
    distinguishFactsAssumptions: "Yes",
    citeSources: "Yes",
    admitUncertainty: "Yes",
    decideWorkflowOrder: "No",
    skipUnnecessarySteps: "No",
    selectToolsDynamically: "No",
    createSubtasks: "No",
    terminateEarly: "Yes",
    usePreviousConversations: "No",
    memoryVisibleCorrectable: "Yes",
    useApprovedFallbacks: "Yes",
    allowPartialCompletion: "Yes",
    separateRequirementsAssumptions: "Yes",
    includeInstructionExamples: "Yes",
    includeMeasurableOutcomes: "Yes",
    includeDependencies: "Yes",
    allowInferredRequirements: "No",
    requireExportGuardrails: "Yes",
    conformToOutputTemplate: "Yes",
    requireOutputExplanations: "Yes",
    requireOutputEvidence: "Yes"
  };
}

export function formatDiscoveryDecisions(decisions) {
  const selected = discoveryDecisionQuestions.filter(({ id }) => decisions[id]);
  if (!selected.length) return "- No structured Yes/No decisions were selected.";
  return selected
    .map(({ id, question, stepTitle }) => `- **${stepTitle} — ${question}:** ${decisions[id]}`)
    .join("\n");
}

export function formatQuestionResponses(responses) {
  const completed = discoveryQuestionResponseDefinitions.filter(({ id }) => responses[id]?.trim());
  if (!completed.length) return "- No additional question-level details were provided.";
  return completed
    .map(({ id, question, stepTitle }) => `- **${stepTitle} — ${question}:** ${responses[id].trim()}`)
    .join("\n");
}

export function normalizeTemplateAnswers(answers) {
  const defaults = {
    interaction: "Ask one focused clarification question at a time when required information is missing. Use no more than three questions in sequence, do not invent missing facts, and summarize the understood scope before any tool call or proposed action.",
    troubleshooting: "Troubleshoot interactively. Maintain a short hypothesis list, explain the reason for each diagnostic, provide one high-confidence action at a time, validate its result, adapt to the response, and escalate after five unsuccessful diagnostic steps.",
    grounding: `Separate sourced facts from assumptions, cite approved evidence for material claims, admit uncertainty, and externally verify high-impact claims. Treat recommendations below 80% confidence as possibilities. Applicable knowledge: ${answers.knowledge || "confirm approved sources with their owners."}`,
    autonomy: "The agent may choose the next read-only diagnostic or analysis step within the approved workflow, but may not bypass required validation, approvals, or outputs. It may create bounded sub-tasks and stop early when the goal is met or safe progress is impossible.",
    memory: "Keep context only for the active workflow unless an approved retention policy says otherwise. Do not persist sensitive data, credentials, temporary workflow state, or user content by default. Any retained preference must be visible, correctable, and deletable by the user.",
    recovery: "Use bounded retries only for safe, transient failures; never retry consequential writes without idempotency. Label partial results, report failed tools and missing evidence, do not silently switch models or sources, and escalate unresolved conflicts or unavailable required systems.",
    instructionExport: "Produce executable, platform-tailored instructions plus a platform-agnostic requirements summary. Separate confirmed requirements, assumptions, and inferred items. Include role, mission, scope, objective, inputs, outputs, constraints, dependencies, examples, allowed and forbidden actions, tool policies, escalation, memory, error handling, guardrails, and measurable success criteria."
  };
  return Object.fromEntries(
    discoveryStepKeys.map((key) => [key, answers[key] || defaults[key] || ""])
  );
}

export const recommendedDecisions = createTemplateDecisions();

export function getStepAnswerSuggestion(stepKey, teamName) {
  return applySuggestionContext(stepAnswerSuggestions[stepKey] || "", teamName);
}

export function getQuestionSuggestion(responseId, teamName) {
  const definition = discoveryQuestionResponseDefinitions.find(({ id }) => id === responseId);
  return applySuggestionContext(definition?.suggestion || "", teamName);
}

export function getRecommendedDecision(decisionId) {
  return recommendedDecisions[decisionId] || "";
}

export function buildStepDraft(stepKey, teamName) {
  const step = discoverySteps.find((item) => item.key === stepKey);
  if (!step) return "";
  const intro = getStepAnswerSuggestion(stepKey, teamName);
  const details = step.followUps
    .map((question, index) => {
      const suggestion = getQuestionSuggestion(getFollowUpResponseId(stepKey, index), teamName);
      return suggestion ? `- ${question} ${suggestion}` : "";
    })
    .filter(Boolean);
  const decisionNotes = (step.decisions || [])
    .map((decision) => {
      const suggestion = getQuestionSuggestion(getDecisionDetailId(stepKey, decision.id), teamName);
      return suggestion ? `- ${decision.question} ${suggestion}` : "";
    })
    .filter(Boolean);
  return [intro, details.join("\n"), decisionNotes.join("\n")].filter(Boolean).join("\n\n");
}

export function getRecommendedDecisionsForStep(stepKey) {
  const step = discoverySteps.find((item) => item.key === stepKey);
  if (!step) return {};
  return Object.fromEntries(
    (step.decisions || [])
      .map((decision) => [decision.id, getRecommendedDecision(decision.id)])
      .filter(([, value]) => value)
  );
}

export function buildAllStepDrafts(teamName) {
  return Object.fromEntries(discoveryStepKeys.map((key) => [key, buildStepDraft(key, teamName)]));
}