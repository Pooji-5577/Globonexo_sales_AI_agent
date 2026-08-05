/**
 * The guided product tour.
 *
 * Each step names the `route` it should be viewed on and a `target` selector
 * that exists on that page. The overlay navigates to the route first, waits for
 * the page to finish rendering, then spotlights the real element — so a step
 * about Prospects is read while standing on Prospects, looking at the actual
 * controls, rather than pointing at a nav item from somewhere else.
 *
 * When a target never appears (slow data, an empty state that renders
 * differently, a narrow viewport) the step degrades to a centred card so the
 * explanation still lands.
 */

export const TOUR_STEPS = [
  {
    id: "welcome",
    route: "/dashboard",
    target: null,
    placement: "center",
    title: "Welcome to GNX sales",
    body:
      "This is your outbound sales workspace. An AI agent researches leads, writes and sends the emails, " +
      "makes the calls, handles replies, and books meetings on your calendar. I'll walk you through each " +
      "screen — about two minutes.",
    footnote: "You can leave at any time and pick up where you stopped.",
  },
  {
    id: "dashboard",
    route: "/dashboard",
    target: '[data-tour="dashboard-kpis"]',
    placement: "bottom",
    title: "Dashboard overview",
    body:
      "Your five headline numbers: emails sent, replies received, meetings booked, hot leads needing attention, " +
      "and saved leads. They stay at zero until a campaign starts running — that is expected on a new account.",
  },
  {
    id: "dashboard-work",
    route: "/dashboard",
    target: '[data-tour="dashboard-activity"]',
    placement: "top",
    title: "Activity and tasks",
    body:
      "The activity feed is every send, reply, and booking as it happens. Tasks on the right is the short list of " +
      "things only you can do — approving a reply draft, reconnecting a mailbox, fixing a stalled campaign.",
  },
  {
    id: "agent",
    route: "/agent",
    target: '[data-tour="agent-overview"]',
    placement: "left",
    title: "AI Agent settings",
    body:
      "This is the agent itself. Ask it to find leads, draft messaging, or explain a result, and watch its live " +
      "numbers on the right. Its brief — what you sell, your value proposition, tone, and expected objections — " +
      "is what every email and call is built from. If outreach ever sounds generic, this is where you fix it.",
  },
  {
    id: "prospects",
    route: "/prospects",
    target: '[data-tour="prospects-sources"]',
    placement: "bottom",
    title: "Prospects and Apollo enrichment",
    body:
      "Four ways to build your lead list, right here: browse the lead table, add someone manually, search Apollo " +
      "against your ideal customer profile, or upload a CSV. Apollo enrichment fills in title, company size, " +
      "technologies, and hiring signals so messages can reference something real rather than a template.",
    footnote: "Enrichment findings are treated as signals to ask about, never as claims about someone's problems.",
  },
  {
    id: "pipeline",
    route: "/pipeline",
    target: '[data-tour="pipeline-metrics"]',
    placement: "bottom",
    title: "Pipeline",
    body:
      "Every lead currently in play: how many are visible, which are hot, who is mid-conversation, and how many " +
      "meetings are set. Filter to hot leads only when you want the short list worth acting on today.",
  },
  {
    id: "campaigns",
    route: "/campaigns",
    target: '[data-tour="campaigns-metrics"]',
    placement: "bottom",
    title: "Campaign creation",
    body:
      "A campaign bundles an audience, a channel, and the rules for contacting them. These counters track every " +
      "campaign you run. Campaigns always start as drafts — nothing goes out until you explicitly launch.",
  },
  {
    id: "sequences",
    route: "/campaigns/new",
    target: '[data-tour="campaign-sequence"]',
    placement: "left",
    title: "Email sequences",
    body:
      "This is the real sequence builder. Add up to ten steps with a delay between each; you give a subject line " +
      "and a prompt for the body, and the agent writes each message personalised to the individual lead. The " +
      "sequence stops automatically on a reply, a bounce, an unsubscribe, or a booked meeting.",
    footnote: "Nothing here is saved until you create the campaign — feel free to look around.",
  },
  {
    id: "voice",
    route: "/campaigns/new",
    target: '[data-tour="campaign-channel"]',
    placement: "right",
    title: "AI voice campaigns",
    body:
      "Pick Email, Voice, or both from these cards. The AI caller discloses that it is an AI at the start of every " +
      "call, asks before recording, respects do-not-call, and hands off cleanly. On a dual-channel campaign, leads " +
      "with an email get the sequence and leads with a phone number get called.",
  },
  {
    id: "inbox",
    route: "/inbox",
    target: '[data-tour="inbox-threads"]',
    placement: "right",
    title: "Inbox and replies",
    body:
      "Every reply lands here as a conversation, classified as interested, a question, an objection, out-of-office, " +
      "or an unsubscribe. The agent drafts a response for each one. Early on you approve drafts yourself; you can " +
      "let it send automatically once you trust the output.",
  },
  {
    id: "meetings",
    route: "/meetings",
    target: '[data-tour="meetings-booking"]',
    placement: "bottom",
    title: "Meetings and Google Calendar",
    body:
      "Connect Google Calendar and the agent reads your real availability, offers only free slots, and creates a " +
      "native event when a prospect agrees. Meetings show here either way — without a connection you'll see the " +
      "record, but the agent cannot book on your behalf.",
  },
  {
    id: "analytics",
    route: "/analytics",
    target: '[data-tour="analytics-header"]',
    placement: "bottom",
    title: "Analytics",
    body:
      "Reply rates, meeting conversion, and campaign performance over the last 30 days. This is where you find out " +
      "which audience and which messaging are actually working, so the next campaign is better than the last.",
  },
  {
    id: "billing",
    route: "/billing",
    target: '[data-tour="billing-usage"]',
    placement: "bottom",
    title: "Billing and usage",
    body:
      "Your plan, what you've used this billing period, and your included phone number. If an action is ever " +
      "unavailable, this page usually explains why.",
  },
  {
    id: "settings",
    route: "/settings",
    target: '[data-tour="settings-tour"]',
    placement: "left",
    title: "Settings",
    body:
      "Connect Gmail, manage the voice agent, and set send caps and reply-approval rules. This card is also where " +
      "you restart this tour — handy when someone new joins your team.",
  },
  {
    id: "finish",
    route: "/setup",
    target: '[data-tour="setup-checklist"]',
    placement: "bottom",
    title: "Your setup checklist",
    body:
      "This is what's left before your first campaign can go live. It reflects your real account state — a tool " +
      "only shows as connected once it genuinely is. When you're ready, the Setup Copilot walks you through " +
      "building that first campaign end to end.",
    footnote: "Reopen this tour any time from Settings.",
  },
];

export const TOUR_STEP_IDS = TOUR_STEPS.map(step => step.id);
