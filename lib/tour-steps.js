/**
 * The guided product tour, anchored to real elements in the running app.
 *
 * Each step names a `target` selector that exists in the live UI (see the
 * `data-tour` attributes in AppShell and the dashboard). When a target is not
 * on screen — a collapsed mobile sidebar, a section that hasn't rendered — the
 * overlay falls back to a centred card so the explanation still lands.
 */

export const TOUR_STEPS = [
  {
    id: "welcome",
    target: null,
    placement: "center",
    title: "Welcome to GNX sales",
    body:
      "This is your outbound sales workspace. An AI agent researches leads, writes and sends the emails, " +
      "makes the calls, handles replies, and books meetings on your calendar. Let's walk through it — about a minute.",
    footnote: "You can leave at any time and pick up where you stopped.",
  },
  {
    id: "dashboard",
    target: '[data-tour="dashboard-kpis"]',
    placement: "bottom",
    title: "Dashboard overview",
    body:
      "Your five headline numbers: emails sent, replies received, meetings booked, hot leads needing attention, " +
      "and saved leads. They stay at zero until a campaign starts running — that is expected on a new account.",
  },
  {
    id: "dashboard-work",
    target: '[data-tour="dashboard-activity"]',
    placement: "top",
    title: "Activity and tasks",
    body:
      "The activity feed is every send, reply, and booking as it happens. Tasks on the right is the short list of " +
      "things only you can do — approving a reply draft, reconnecting a mailbox, fixing a stalled campaign.",
  },
  {
    id: "agent",
    target: '[data-tour="nav-agent"]',
    placement: "right",
    title: "AI Agent settings",
    body:
      "The agent's brief lives here: what you sell, your value proposition, tone, and the objections it should expect. " +
      "Everything it writes or says comes from this. If outreach sounds generic, this is where you fix it.",
  },
  {
    id: "prospects",
    target: '[data-tour="nav-prospects"]',
    placement: "right",
    title: "Prospects and Apollo enrichment",
    body:
      "Build your lead list here — add people manually, upload a CSV, or search Apollo against your ideal customer profile. " +
      "Apollo enrichment fills in title, company size, technologies, and hiring signals so messages can reference " +
      "something real rather than a template.",
    footnote: "Enrichment findings are treated as signals to ask about, never as claims about someone's problems.",
  },
  {
    id: "pipeline",
    target: '[data-tour="nav-pipeline"]',
    placement: "right",
    title: "Pipeline",
    body:
      "Every lead currently in play, with the hot ones surfaced first. Use it to see who is engaged, who has gone quiet, " +
      "and where each conversation stands.",
  },
  {
    id: "campaigns",
    target: '[data-tour="nav-campaigns"]',
    placement: "right",
    title: "Campaign creation",
    body:
      "A campaign bundles an audience, a channel, and the rules for contacting them: how many leads, daily send caps, " +
      "calls per hour, business hours, and timezone. Campaigns start as drafts — nothing goes out until you launch.",
  },
  {
    id: "sequences",
    target: '[data-tour="nav-campaigns"]',
    placement: "right",
    title: "Email sequences",
    body:
      "Inside a campaign you set up to ten steps with a delay between each. You give a subject line and a prompt for " +
      "the body; the agent writes each message personalised to the individual lead. The sequence stops automatically " +
      "on a reply, a bounce, an unsubscribe, or a booked meeting.",
  },
  {
    id: "voice",
    target: '[data-tour="nav-campaigns"]',
    placement: "right",
    title: "AI voice campaigns",
    body:
      "Campaigns can call as well as email. The AI caller discloses that it is an AI at the start of every call, asks " +
      "before recording, respects do-not-call, and hands off cleanly. It needs a voice agent and a phone number, which " +
      "your plan includes.",
  },
  {
    id: "inbox",
    target: '[data-tour="nav-inbox"]',
    placement: "right",
    title: "Inbox and replies",
    body:
      "Replies land here, classified as interested, a question, an objection, out-of-office, or an unsubscribe. " +
      "The agent drafts a response for each one. Early on you approve drafts yourself; you can let it send " +
      "automatically once you trust the output.",
  },
  {
    id: "meetings",
    target: '[data-tour="nav-meetings"]',
    placement: "right",
    title: "Meetings and Google Calendar",
    body:
      "Connect Google Calendar and the agent reads your real availability, offers only free slots, and creates a " +
      "native calendar event when a prospect agrees. Meetings show here either way — without a connection you'll " +
      "see the record but the agent cannot book for you.",
  },
  {
    id: "analytics",
    target: '[data-tour="nav-analytics"]',
    placement: "right",
    title: "Analytics",
    body:
      "Reply rates, meeting conversion, and campaign performance over the last 30 days. This is where you find out " +
      "which audience and which messaging are actually working.",
  },
  {
    id: "billing",
    target: '[data-tour="nav-billing"]',
    placement: "right",
    title: "Billing and Settings",
    body:
      "Billing holds your plan, usage, and included phone number. Settings is where you connect Gmail, manage the " +
      "voice agent, set send caps, and restart this tour whenever you want.",
  },
  {
    id: "finish",
    target: '[data-tour="setup-checklist"]',
    placement: "left",
    title: "Your setup checklist",
    body:
      "This checklist tracks what's left before your first campaign can go live. It reflects your real account state — " +
      "a tool only shows as connected once it genuinely is. When you're ready, the Setup Copilot walks you through " +
      "building the first campaign end to end.",
    footnote: "Reopen this tour any time from Settings.",
  },
];

export const TOUR_STEP_IDS = TOUR_STEPS.map(step => step.id);
