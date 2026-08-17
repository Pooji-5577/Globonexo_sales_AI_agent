/**
 * Pure state rules for the Setup Copilot wizard.
 *
 * The backend re-checks everything here before it creates anything — this
 * module exists so the wizard can disable Next and explain why, rather than
 * letting someone reach the confirmation screen on an impossible campaign.
 */

export const COPILOT_STEPS = [
  { id: "channel", title: "Choose your channel" },
  { id: "connections", title: "Check your connections" },
  { id: "audience", title: "Define the audience" },
  { id: "voice", title: "Confirm calling settings" },
  { id: "leads", title: "Pick your leads" },
  { id: "campaign", title: "Campaign details" },
  { id: "preview", title: "Preview the messaging" },
  { id: "confirm", title: "Review and confirm" },
];

export const DEFAULT_COPILOT_DRAFT = {
  channel: "email",
  audience: "",
  campaignName: "",
  offer: "",
  tone: "consultative",
  timezone: "America/New_York",
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  maxLeads: 25,
  dailySendCap: 75,
  callCadencePerHour: 5,
  voiceMode: "ai",
  followUps: [
    { delayDays: 0, subjectTemplate: "", bodyPromptContext: "" },
    { delayDays: 3, subjectTemplate: "", bodyPromptContext: "" },
  ],
  selectedLeadIds: [],
};

export const usesEmail = channel => channel === "email";
export const usesVoice = channel => channel === "voice";

/** Steps that don't apply to the chosen channel are dropped from the flow. */
export function visibleSteps(draft) {
  const channel = draft?.channel ?? "email";
  return COPILOT_STEPS.filter(step => {
    if (step.id === "voice") return usesVoice(channel);
    return true;
  });
}

/**
 * Why the customer cannot move past the current step. An empty array means
 * Next is allowed. These are advisory — the backend is the real gate.
 */
export function blockersForStep(stepId, { draft, integrations, leadCount }) {
  const channel = draft?.channel ?? "email";
  const blockers = [];

  if (stepId === "connections") {
    if (usesEmail(channel) && !integrations?.gmail?.connected) {
      blockers.push("Connect an email account before building an email campaign — use Gmail OAuth or custom SMTP + IMAP.");
    }
    if (usesVoice(channel) && !integrations?.retell?.connected) {
      blockers.push(
        integrations?.retell?.detail || "AI calling is not ready yet, so this campaign cannot place calls.",
      );
    }
  }

  if (stepId === "leads" && (draft?.selectedLeadIds?.length ?? 0) === 0) {
    blockers.push(
      leadCount === 0
        ? "You have no leads yet. Add leads from Prospects, then come back."
        : "Select at least one lead for this campaign.",
    );
  }

  if (stepId === "campaign") {
    if (!draft?.campaignName || draft.campaignName.trim().length < 3) {
      blockers.push("Give the campaign a name of at least 3 characters.");
    }
    if (draft?.businessHoursStart && draft?.businessHoursEnd && draft.businessHoursStart >= draft.businessHoursEnd) {
      blockers.push("The end of your sending window must be after the start.");
    }
  }

  return blockers;
}

/** Non-blocking things the customer should still see before confirming. */
export function warningsForDraft({ draft, integrations }) {
  const warnings = [];
  const channel = draft?.channel ?? "email";

  if (usesEmail(channel) && (draft?.followUps ?? []).every(step => !step.subjectTemplate?.trim() && !step.bodyPromptContext?.trim())) {
    warnings.push("No sequence steps are filled in. The agent will write from your product context alone.");
  }
  if (integrations?.apollo?.status === "not_configured") {
    warnings.push("Lead enrichment is not enabled, so messages will use only the lead data you already have.");
  }

  return warnings;
}

export function canConfirm({ draft, integrations, leadCount, confirmed }) {
  if (!confirmed) return false;
  const relevant = ["connections", "leads", "campaign"];
  return relevant.every(stepId => blockersForStep(stepId, { draft, integrations, leadCount }).length === 0);
}

/** Turns the wizard draft into the exact body POST /setup/copilot/campaign expects. */
export function buildLaunchPayload(draft, { launch = false } = {}) {
  const channel = draft?.channel ?? "email";

  return {
    confirm: true,
    launch: Boolean(launch),
    name: (draft?.campaignName ?? "").trim(),
    channel,
    audience: (draft?.audience ?? "").trim(),
    offer: (draft?.offer ?? "").trim(),
    maxLeads: Math.min(25, Math.max(1, Number(draft?.maxLeads) || 25)),
    dailySendCap: Number(draft?.dailySendCap) || 75,
    callCadencePerHour: Number(draft?.callCadencePerHour) || 5,
    voiceMode: draft?.voiceMode === "manual" ? "manual" : "ai",
    businessHoursStart: draft?.businessHoursStart ?? "09:00",
    businessHoursEnd: draft?.businessHoursEnd ?? "17:00",
    timezone: draft?.timezone ?? "America/New_York",
    steps: usesEmail(channel)
      ? (draft?.followUps ?? [])
          .filter(step => step.subjectTemplate?.trim() || step.bodyPromptContext?.trim())
          .map(step => ({
            delayDays: Number(step.delayDays) || 0,
            subjectTemplate: (step.subjectTemplate ?? "").trim(),
            bodyPromptContext: (step.bodyPromptContext ?? "").trim(),
          }))
      : [],
    leadIds: Array.isArray(draft?.selectedLeadIds) ? draft.selectedLeadIds.slice(0, 500) : [],
  };
}

/** Merges a persisted server draft over the defaults, ignoring junk values. */
export function hydrateDraft(saved) {
  if (!saved || typeof saved !== "object") return { ...DEFAULT_COPILOT_DRAFT };

  const draft = { ...DEFAULT_COPILOT_DRAFT };
  for (const key of Object.keys(DEFAULT_COPILOT_DRAFT)) {
    const value = saved[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(DEFAULT_COPILOT_DRAFT[key]) && !Array.isArray(value)) continue;
    draft[key] = value;
  }

  if (!["email", "voice"].includes(draft.channel)) draft.channel = "email";
  return draft;
}

/** Human summary of what confirming will actually do. */
export function confirmationSummary(draft, { launch }) {
  const channel = draft?.channel ?? "email";
  const leadCount = draft?.selectedLeadIds?.length ?? 0;
  const channelLabel = channel === "voice" ? "AI calls" : "email";

  return launch
    ? `Create “${(draft?.campaignName ?? "").trim()}” and start ${channelLabel} to ${leadCount} lead${leadCount === 1 ? "" : "s"} within your sending window.`
    : `Create “${(draft?.campaignName ?? "").trim()}” as a draft with ${leadCount} lead${leadCount === 1 ? "" : "s"} assigned. Nothing will send until you launch it.`;
}
