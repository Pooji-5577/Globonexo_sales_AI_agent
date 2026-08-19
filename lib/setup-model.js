/**
 * Pure helpers for the guided setup checklist.
 *
 * The backend owns every status (it derives them from real records). This
 * module only owns presentation: the copy for each step, where its action
 * lives, and the small amount of maths the UI needs. Keeping it free of React
 * and network calls makes it directly testable.
 */

export const SETUP_STEP_META = {
  profile: {
    title: "Your profile",
    summary: "Who the agent is, and which company it speaks for.",
    why: "Every email signature and call introduction uses this.",
    cta: "Edit profile",
    href: "/settings",
    icon: "user",
    group: "Tell the agent about you",
  },
  product: {
    title: "Your product",
    summary: "What you sell and how it works.",
    why: "The agent explains your product from this description. Vague input produces vague outreach.",
    cta: "Edit product details",
    href: "/onboarding",
    icon: "bolt",
    group: "Tell the agent about you",
  },
  icp: {
    title: "Ideal customer",
    summary: "Titles, company sizes, industries, and regions worth contacting.",
    why: "Lead database searches and lead scoring both filter on this.",
    cta: "Define your ICP",
    href: "/onboarding",
    icon: "target",
    group: "Tell the agent about you",
  },
  outreach: {
    title: "Outreach strategy",
    summary: "Value proposition, tone, hook style, and follow-up cadence.",
    why: "This sets how messages read and how persistently the agent follows up.",
    cta: "Set your strategy",
    href: "/onboarding",
    icon: "spark",
    group: "Tell the agent about you",
  },
  gmail: {
    title: "Connect an email account",
    summary: "The mailbox your outreach sends from and replies land in.",
    why: "Required for email campaigns. Use Gmail OAuth or a custom SMTP + IMAP mailbox.",
    cta: "Connect email account",
    href: "/settings",
    icon: "mail",
    group: "Connect your tools",
  },
  calendar: {
    title: "Set your availability",
    summary: "Working hours, meeting length, and notice window for the agent to book against.",
    why: "The agent checks this live on calls to offer and lock real open slots.",
    cta: "Set availability",
    href: "/calendar",
    icon: "calendar",
    group: "Connect your tools",
  },
  apollo: {
    title: "Lead database prospecting",
    summary: "Search and enrich people and companies that match your ICP.",
    why: "Enrichment is what lets messages reference something real about the account.",
    cta: "Open lead database search",
    href: "/prospects",
    icon: "search",
    group: "Connect your tools",
  },
  retell: {
    title: "AI voice calling",
    summary: "Your voice agent and the number it calls from.",
    why: "Required for call campaigns. Email campaigns work without it.",
    cta: "Set up calling",
    href: "/settings",
    icon: "phone",
    group: "Connect your tools",
  },
  leads: {
    title: "Import or select leads",
    summary: "Add people by CSV, manually, or from a lead database search.",
    why: "A campaign needs someone to contact.",
    cta: "Add leads",
    href: "/prospects",
    icon: "users",
    group: "Launch your first campaign",
  },
  campaign: {
    title: "Create your first campaign",
    summary: "Channel, audience, sequence, and sending windows.",
    why: "This is the thing that actually runs your outreach.",
    cta: "Open Setup Copilot",
    href: "/campaigns/new",
    icon: "send",
    group: "Launch your first campaign",
  },
  review_drafts: {
    title: "Review your emails",
    summary: "Read what the agent wrote, then approve.",
    why: "Nothing sends until you approve it. Approve one to see the quality, then let autopilot handle the rest.",
    cta: "Review drafts",
    href: "/campaigns",
    icon: "mail",
    group: "Launch your first campaign",
  },
  launch: {
    title: "Launch",
    summary: "Go live with your approved emails.",
    why: "Sending respects your business hours and daily cap, and stops on a reply.",
    cta: "Review campaigns",
    href: "/campaigns",
    icon: "play",
    group: "Launch your first campaign",
  },
};

export const SETUP_GROUP_ORDER = [
  "Tell the agent about you",
  "Connect your tools",
  "Launch your first campaign",
];

export const SKIPPABLE_STEP_IDS = ["calendar", "apollo", "retell"];

/** Statuses that mean "there is nothing for the customer to do here". */
export function isStepResolved(step) {
  if (!step) return false;
  return step.status === "complete" || step.status === "unavailable" || Boolean(step.skipped);
}

export function isStepActionable(step) {
  if (!step) return false;
  return !isStepResolved(step);
}

/** The step the "Continue setup" button should take the customer to. */
export function nextIncompleteStep(steps) {
  if (!Array.isArray(steps)) return null;
  return steps.find(isStepActionable) ?? null;
}

export function progressSummary(steps) {
  const list = Array.isArray(steps) ? steps : [];
  const countable = list.filter(step => step.status !== "unavailable");
  const completed = countable.filter(step => step.status === "complete").length;
  const resolved = countable.filter(step => step.status === "complete" || step.skipped).length;

  return {
    completed,
    resolved,
    total: countable.length,
    percent: countable.length === 0 ? 0 : Math.round((resolved / countable.length) * 100),
    allDone: countable.length > 0 && resolved === countable.length,
  };
}

/** Groups steps for rendering while preserving backend order within a group. */
export function groupSteps(steps) {
  const list = Array.isArray(steps) ? steps : [];
  return SETUP_GROUP_ORDER.map(group => ({
    group,
    steps: list.filter(step => SETUP_STEP_META[step.id]?.group === group),
  })).filter(section => section.steps.length > 0);
}

export function stepMeta(stepId) {
  return SETUP_STEP_META[stepId] ?? {
    title: stepId,
    summary: "",
    why: "",
    cta: "Open",
    href: "/dashboard",
    icon: "check",
    group: SETUP_GROUP_ORDER[0],
  };
}

/** Badge wording for a step. Never asserts a connection the backend didn't confirm. */
export function stepBadge(step) {
  if (!step) return { label: "", tone: "neutral" };
  if (step.status === "complete") return { label: "Done", tone: "good" };
  if (step.status === "unavailable") return { label: "Not available", tone: "neutral" };
  if (step.skipped) return { label: "Skipped", tone: "neutral" };
  if (step.status === "blocked") return { label: "Needs attention", tone: "warn" };
  return { label: "To do", tone: "todo" };
}

export function canSkipStep(step) {
  return Boolean(step) && SKIPPABLE_STEP_IDS.includes(step.id) && step.status !== "complete" && !step.skipped;
}
