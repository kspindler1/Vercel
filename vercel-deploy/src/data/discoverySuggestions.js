const TEAM_TOKEN = /\{\{team\}\}/g;

export function applySuggestionContext(text, teamName) {
  if (!text) return "";
  return text.replace(TEAM_TOKEN, teamName || "your team");
}

export const stepAnswerSuggestions = {
  problem:
    "Today {{team}} builds a recurring status/reconciliation report by hand: a coordinator opens 8-12 source files, copies key fields into a spreadsheet, chases mismatches by email, then formats a summary. It is triggered every Monday and after each source refresh, takes 3-4 hours per round across 2 people, and runs roughly 45 times a year with support from Data Management and QA. Typical failures are transcription errors, stale extracts, missed late updates, and knowledge held by one experienced person. When it is wrong or late, downstream meetings and decisions use stale numbers and a documented rework cycle is required. Success is a reviewed draft in under 15 minutes, every figure traceable to its source, and a 90% reduction in manual compilation time.",
  users:
    "Primary users are the {{team}} staff who run this process today; beneficiaries are the downstream reviewers and decision-makers who consume the output. Expect 10-25 regular users running it weekly, with mixed technical comfort (confident in Excel, SharePoint, and Teams, not in code). A named functional lead reviews every draft, and QA approves anything used for regulated or external purposes.",
  interaction:
    "Ask before acting whenever a required input is missing or ambiguous. Limit to a maximum of 3 clarifying questions in sequence, asked one at a time, and never interrogate the user for details already present in the inputs. If information is still missing, apply documented approved defaults and label them clearly; stop and escalate instead of guessing when the missing item affects safety, privacy, or compliance. Always restate the understood scope, inputs, and planned actions in a few lines and get confirmation before anything that writes, sends, or changes data.",
  inputs:
    "Task: [name a lengthy or repetitive manual task and give examples]. User inputs: [list what the user must provide for the agent to work]. Documents and locations: [name the required documents and where they are stored]. Frequency: [state how often the task occurs]. Steps: [count and list each step from start to finish]. Current problems: [describe errors, rework, delays, or knowledge gaps]. Downstream impact: [explain what happens if the task is wrong, missing, or late]. Agent rules: [state whether rules are needed and list the business rules or approved policies to follow]. Success: [name measurable outcomes, with a baseline and target when known]. Use de-identified examples and never include credentials or confidential details.",
  processing:
    "1) Collect the latest approved extracts. 2) Validate completeness and freshness. 3) Normalize fields and terminology. 4) Apply the documented business rules and thresholds. 5) Compare with the prior version and flag changes. 6) Draft the output with sources attached. 7) Route to the named reviewer. Process owners: [list each person or functional group, each step, and its owner]. Steps 1-5 follow fixed rules; exception triage, root-cause interpretation, and final wording for external audiences require human judgment. When data is missing or unclear, the agent must not guess: flag the record, exclude it from computed totals, state what is missing, and list it under \"Needs review.\" Never invent answers. If an output is not supported by approved knowledge sources or the agent's instructions, state what is missing and flag it for human review.",
  troubleshooting:
    "Troubleshoot interactively with one high-confidence action per turn. Maintain a short ranked hypothesis list of likely root causes, explain in one sentence why each check is being run and what each outcome would mean, validate the observed result before moving on, and re-rank the hypotheses based on the user's response rather than following a fixed script. Escalate to the named owner after 5 unsuccessful diagnostic steps, and immediately for anything affecting production, safety, or regulated data.",
  tools:
    "Build from the approved catalog for the chosen platform and keep everything read-only by default. Allowed tools are the approved read connectors to SharePoint, Outlook, the system of record, and Excel export. Any write, send, or update action requires explicit in-session user confirmation showing the exact target and payload, runs under the requesting user's own permissions rather than a shared privileged account, and is logged. No plugin may send confidential data, PHI, or PII to a third party; public web lookups are restricted to an approved allowlist of non-sensitive sources. Large extracts, full-corpus scans, and bulk model calls require a scoped preview and approval before running, and tools outside the approved list may not be used.",
  risks:
    "The workflow touches confidential business data and may touch personal data, so it operates under privacy controls and, where applicable, GxP expectations with a retained audit trail of inputs, outputs, and approvals. A wrong output would cause incorrect reporting, rework, and delayed decisions. Residual risk is medium because a human reviewer approves every output before use, and would be high if unreviewed output could reach a regulator, patient, or external decision-maker.",
  knowledge:
    "Ground every answer in the applicable SOPs, work instructions, data dictionaries, and standards held in the controlled document system and the team SharePoint. Keep them maintained in place and always read the current controlled version instead of creating a parallel copy. Load the domain glossary and business rules (status definitions, aging thresholds, naming conventions, completeness criteria), 5-10 previously approved examples including edge cases such as missing data, duplicates, and conflicting sources, and name the SME who validates accuracy on a quarterly cycle. Public web access, if needed at all, is limited to an approved allowlist.",
  grounding:
    "Every material claim must be traceable to an approved source with a citation naming the document and version or the system, report, and extract date. Anything not sourced is labeled an assumption. Below 80% confidence, present findings as possibilities together with what evidence would confirm them. Say plainly when something is not found in the approved sources instead of producing a plausible answer. Regulatory, safety, financial, contractual, and externally facing claims always require verification against the controlled source before being stated.",
  guardrails:
    "Never change, delete, or overwrite master data or source-of-truth records. Never send external communications, submit regulatory content, or approve anything on a person's behalf. Never expose PII, patient data, credentials, or confidential content to unapproved tools or recipients. Never bypass access permissions, privacy and consent rules, segregation of duties, approval gates, or audit logging, even if the user asks or it would finish the task faster. When uncertain, stop and escalate with what is known and what is missing rather than proceeding.",
  autonomy:
    "The agent may sequence and skip read-only analysis steps inside the approved workflow when that reaches the goal faster, and may create bounded sub-tasks that roll up into the same final output. It may not skip validation, approval, logging, or required outputs, and it may not use tools outside the approved list. It should stop and report when the objective is met, blocked, unsafe, or out of scope rather than continuing.",
  memory:
    "Remember only what is needed to finish the active task plus explicitly approved preferences such as output format, default report scope, and reporting cadence. Never remember confidential or personally identifiable information, patient or subject identifiers, health data, credentials, API keys, financial account details, or sensitive free text. Context expires at the end of the session or task unless an approved, documented retention policy applies, and anything retained must be visible, correctable, and deletable by the user.",
  recovery:
    "On tool failure, retry only safe idempotent reads up to 2 times with backoff, then report the failing tool and error plainly while keeping completed work. Never retry a write without an idempotency guarantee. Approved fallback tools or models may be used only when they meet the same data and compliance controls, and the substitution must be stated in the output. If data sources disagree, never average or silently pick one: surface both values with their sources and timestamps, prefer the system of record, and escalate to the data owner. Partial results are allowed but must be labeled \"Partial result - missing [item].\"",
  instructionExport:
    "Export executable, platform-tailored instructions plus a platform-agnostic requirements summary for reviewers. Every package includes role, mission, scope, objective, inputs, outputs, constraints, allowed actions, forbidden actions, tool policies, escalation rules, memory rules, error handling, dependencies, worked examples, and measurable success criteria. Confirmed requirements, assumptions, and inferred items are listed in separate sections, and no implementation instruction is generated from inference alone.",
  environment:
    "Build on the approved platform for this use case (Copilot Studio for Microsoft-native workflows, Apollo/Dify for custom orchestration, or Microsoft 365 Copilot for in-app assistance) using approved models and the organization's identity and data controls. Start in development, promote to test with documented validation evidence, then to production under change control. The owning functional team maintains content and prompts with a named owner and backup; the platform team maintains connectors. Keep team- and study-specific values configurable so other teams can reuse it.",
  outputs:
    "Produce a structured result: a short executive summary, a table of items with their sources, an \"Exceptions / needs review\" section, and a brief rationale of the rules applied. Deliver it in the approved template to the functional lead and downstream reviewers, stored in the team SharePoint with version history and an email notification. Favor completeness for the record with the 5-line summary on top. A good output is immediately usable, fully traceable to sources, free of PII, and requires no reformatting or rework by the reviewer. When an error occurs, show a concise, redacted error log with the failed step, observed error, expected behavior, relevant source, and resolution. Route it to an authorized human to review and update instructions; never change instructions automatically.",
};

export const followUpSuggestions = {
  problem: [
    "Weekly status reporting, monthly reconciliation of the tracker against the source system, and manual triage of inbound request emails into the right queue.",
    "Triggered by the Monday reporting deadline and by every source-data refresh; weekly as routine, plus ad hoc after major updates.",
    "One round takes 3-4 hours and is done by 2 people. A full cycle is 3 rounds (draft, review, finalize). Supporting groups: Data Management, QA, and the business or study lead.",
    "Transcription errors, stale or duplicated extracts, missed late updates, inconsistent terminology, and process knowledge concentrated in one experienced person.",
    "Decisions get made on stale numbers, downstream reports and meetings slip, and corrections require a documented rework and re-review cycle.",
    "Success is a reviewed draft in under 15 minutes, zero transcription errors, every figure traceable to a source, and 90% less manual effort. Measured by cycle time, error and rework rate, and reviewer edits per draft."
  ],
  users: [
    "Data steward, data manager, clinical programmer or analyst, coordinator, and the functional line manager.",
    "10-25 regular users; weekly for routine runs and more often during peak reporting periods.",
    "Mostly non-technical business users comfortable with Excel, SharePoint, and Teams, plus a small power-user group that can handle structured queries.",
    "The functional lead or designated SME reviews each draft; QA approves anything used for regulated, external, or regulatory purposes."
  ],
  interaction: [
    "A maximum of 3 sequential clarifying questions, asked one at a time; after that, proceed with clearly labeled assumptions or stop and escalate.",
    "Ask for business-critical inputs, use approved documented defaults for low-risk formatting choices, never invent identifiers, dates, or values, and abort when a safety, privacy, or compliance input is missing."
  ],
  inputs: [
    "Examples: manually reconciling two reports, copying information between systems, preparing a recurring status update, or sorting incoming requests.",
    "List what the user must provide for the agent to work, such as required fields, identifiers, dates, or choices. Exclude sensitive data.",
    "Name the required documents, their approved locations, and their owners.",
    "State how often the task occurs and how long one run takes.",
    "List each step in order from the start of the task to its completion.",
    "Examples include data-entry mistakes, missed handoffs, repeated checks, long waits for approval, or relying on one person's knowledge.",
    "Describe the downstream impact if the task is incorrect, missing, or late.",
    "Choose measures such as time saved, fewer errors or rework, faster completion, fewer missed deadlines, or reviewer acceptance. Include a baseline and target when known."
  ],
  processing: [
    "List each person or functional group, the step they perform, and who owns that step. For example: Operations receives the request; Finance checks the figures; a team lead approves the result.",
    "List the steps in order and name the owner responsible for each one.",
    "Rule-based: collection, validation, normalization, threshold checks, and change detection. Judgment: exception triage, root-cause interpretation, and wording for external audiences.",
    "Stop when required information is missing, approved sources conflict, or a decision needs human judgment. State what is unresolved, who should review it, and what is needed to continue.",
    "Do not guess. Flag the record, exclude it from computed totals, state exactly what is missing, and list it under \"Needs review\" for the SME.",
    "Never invent answers. If an output is not supported by approved knowledge sources or the agent's instructions, identify the gap and flag it for human review."
  ],
  troubleshooting: [
    "Interactively, one step at a time. A list of all possible fixes hides which change actually resolved the issue and makes the result untraceable.",
    "A maximum of 5 diagnostic steps, or 15 minutes, before escalating to the named owner with a summary of what was tried and what was ruled out."
  ],
  tools: [
    "Microsoft: Copilot Studio actions over Power Platform connectors for SharePoint, Outlook, and Teams, plus Microsoft Graph connectors for enterprise search. Dify is the alternative when the workflow needs custom orchestration or a self-hosted deployment.",
    "SharePoint, Outlook, Teams, the system of record (for example Veeva), Databricks, Excel, and Power Automate - only the connectors explicitly approved for this use case.",
    "All search, retrieval, reporting, and analysis connectors are read-only.",
    "Only the approved write connectors used to draft documents or create tracked records. Never master data, never direct database updates, never production configuration.",
    "Explicit in-session user confirmation showing the exact target, the payload, and whether the action is reversible; a second approver for regulated or externally visible actions.",
    "No plugin may send confidential data, PHI, or PII outside the tenant. Public web-search and third-party marketplace plugins are limited to non-sensitive lookups on an approved allowlist, and anything else needs privacy and security review first."
  ],
  risks: [
    "Yes - it may touch PII and confidential business data. Patient data only in de-identified form unless explicitly approved under the applicable privacy controls.",
    "Yes - GxP-adjacent use requires documented validation, change control, versioned instructions, and a retained audit trail of inputs, outputs, and approvals.",
    "Incorrect or incomplete reporting leading to rework and delayed decisions. Residual risk is medium with mandatory human review and high without it.",
    "Not without human approval. Anything regulator-facing, patient-facing, or externally visible must be reviewed and approved by the accountable owner first."
  ],
  knowledge: [
    "The applicable SOPs, work instructions, data dictionaries, and standards stored in the controlled document system and the team SharePoint. Yes - maintain them where they live and always read the current controlled version; do not create a parallel copy that can drift.",
    "The domain glossary, status definitions, aging thresholds, naming conventions, and the rules for what counts as complete, overdue, or an exception.",
    "Yes - 5-10 previously approved outputs plus edge cases: missing data, duplicates, late amendments, and conflicting sources.",
    "The named functional SME or process owner, with a quarterly accuracy review and documented sign-off.",
    "Only an approved allowlist - for example regulator and standards sites such as fda.gov, ema.europa.eu, ich.org, and cdisc.org. No open web browsing beyond the allowlist."
  ],
  grounding: [
    "80% or higher for a direct recommendation. Below that, present options together with the evidence needed to decide.",
    "Regulatory and compliance requirements, safety information, financial figures, contractual terms, and anything that will leave the organization."
  ],
  guardrails: [
    "No changes to master data, no deletions, no production configuration changes, no direct database writes, no bulk email, and no regulatory submissions.",
    "Before anything leaves the system or reaches an external party, and before any write, status change, or financial or regulated action.",
    "Flag it, state what is uncertain and why, and escalate to the named owner. Stop entirely when the uncertainty involves safety, privacy, or compliance.",
    "Patient data, PII, credentials and API keys, unpublished results, legal or contractual content, and anything outside the requesting user's access rights.",
    "Access permissions, privacy and consent rules, segregation of duties, approval gates, audit logging, and data residency. None of these may be bypassed or simulated."
  ],
  autonomy: [],
  memory: [
    "Approved preferences such as output format, default report scope, time zone, and reporting cadence, plus the task context needed to finish the current request.",
    "Any confidential or personally identifiable information: names, contact details, patient or subject identifiers, dates of birth, health data, credentials and API keys, financial account details, and sensitive free text. Also no retained copies of restricted documents.",
    "Only for the active session or task. Purge at completion unless an approved, documented retention policy states otherwise."
  ],
  recovery: [
    "Report the exact failing tool and error, keep the work already completed, never fabricate the missing result, and offer a manual fallback path.",
    "Up to 2 retries with exponential backoff for transient read failures, and no automatic retries for writes without an idempotency guarantee.",
    "Surface the conflict with both values, their sources, and timestamps. Prefer the system of record and escalate to the data owner instead of resolving it silently."
  ],
  instructionExport: [
    "Yes - all of them. An export missing allowed and forbidden actions, escalation rules, or success criteria is not releasable.",
    "Both: a platform-agnostic requirements core plus a tailored build for the chosen platform, such as Copilot Studio or Dify.",
    "Both: executable instructions for the builder and a conceptual summary for reviewers and approvers."
  ],
  environment: [
    "Copilot Studio for Microsoft-native workflows, Apollo/Dify for custom orchestration, or Microsoft 365 Copilot for in-app assistance. Confirm the approved platform with IT before building.",
    "Yes - development first, then a test environment with documented validation evidence, then production under change control.",
    "A named business owner maintains content and prompts, the platform team maintains connectors and infrastructure, and all changes go through review with version history.",
    "Other studies, therapeutic areas, or functional teams running the same process. Keep team- and study-specific values configurable rather than hard-coded."
  ],
  outputs: [
    "A structured summary plus a detail table, exported to the approved Excel or Word template and posted to SharePoint with an email notification.",
    "The functional lead and the downstream reviewers, stored in the team SharePoint folder with version history.",
    "Name the person who reviews or approves the output before use, and state any required approval gate.",
    "Choose a measure such as time saved, fewer errors, or the percentage accepted without edits. Compare it with a baseline when possible.",
    "Yes. Show a concise, redacted error log describing the failed step, observed error, expected behavior, relevant source, and resolution. Route it to an authorized human to review and update instructions; do not modify instructions automatically."
  ]
};

export const decisionDetailSuggestions = {
  askClarifyingQuestions:
    "Yes - ask only when the missing information changes the outcome, and never re-ask for details already available in the inputs.",
  summarizeBeforeExecution:
    "Yes - restate scope, inputs, planned steps, and any assumption in 3-5 lines and get confirmation before any write action.",
  validateTroubleshootingStep:
    "Yes - confirm the observed result (error text, record count, status) before the next step so cause and effect stay traceable.",
  adaptTroubleshooting:
    "Yes - re-rank the hypothesis list after each result instead of continuing a fixed script.",
  maintainHypotheses:
    "Yes - keep a ranked list of 2-5 candidate root causes and mark each as confirmed, ruled out, or untested.",
  explainTroubleshooting:
    "Yes - one sentence stating what is being tested and what each possible outcome would mean.",
  allowAutomaticToolCalls:
    "No for anything that writes, sends, or changes an external system. Read-only retrieval and verification may run automatically within the approved tool list.",
  requireCostValidation:
    "Yes - large extracts, full-corpus scans, and bulk model calls require a scoped preview and user approval before running.",
  distinguishFactsAssumptions:
    "Yes - label each material statement as a sourced fact, an inference, or an assumption.",
  citeSources:
    "Yes - cite the document name, version, and section, or the system, report, and extract date.",
  admitUncertainty:
    "Yes - say \"not found in the approved sources\" rather than producing a plausible-sounding answer.",
  decideWorkflowOrder:
    "No by default - follow the documented workflow. Reordering is acceptable only inside the approved read-only analysis steps and only when every required control and output is still produced.",
  skipUnnecessarySteps:
    "No for validation, approval, logging, or audit steps. Steps that are demonstrably not applicable may be skipped only with a stated reason.",
  selectToolsDynamically:
    "No - choose only from the approved tool list for this task. Adding a new tool requires review and approval.",
  createSubtasks:
    "No by default. If enabled, sub-tasks must be bounded, visible to the user, and roll up into the same final output.",
  terminateEarly:
    "Yes - stop and report when the objective is met, blocked, unsafe, or out of scope instead of continuing to act.",
  usePreviousConversations:
    "No by default - each task starts clean. Enable only for explicitly approved, non-sensitive preferences.",
  memoryVisibleCorrectable:
    "Yes - the user can view, edit, and delete anything retained, and deletion takes effect immediately.",
  useApprovedFallbacks:
    "Yes - only pre-approved fallbacks with equivalent data handling and compliance controls, and the substitution must be stated in the output.",
  allowPartialCompletion:
    "Yes - label it \"Partial result - missing [item]\" with a list of what failed and what is still required to complete it.",
  separateRequirementsAssumptions:
    "Yes - use distinct sections: Confirmed, Assumed, and Inferred (needs confirmation).",
  includeInstructionExamples:
    "Yes - at least one positive example and one edge case for every critical behavior.",
  includeMeasurableOutcomes:
    "Yes - each instruction states an observable, testable result rather than an intention.",
  includeDependencies:
    "Yes - list systems, connectors, permissions, data sources, owners, and approvals needed before go-live.",
  allowInferredRequirements:
    "No for implementation. Inferred items may appear only as clearly labeled open questions awaiting confirmation.",
  requireExportGuardrails:
    "Yes - mission, scope, allowed actions, forbidden actions, tool policy, escalation policy, and success metrics are mandatory in every export.",
  conformToOutputTemplate:
    "Yes - use the approved template so reviewers and downstream systems can consume it without reformatting.",
  requireOutputExplanations:
    "Yes - a concise rationale and the rules applied, not internal step-by-step reasoning.",
  requireOutputEvidence:
    "Yes - cite the source document and version, or the system extract and date, for each conclusion."
};