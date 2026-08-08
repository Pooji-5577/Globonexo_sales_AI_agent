/**
 * The guided product tour.
 *
 * This is no longer a screen-by-screen narration. The first six steps are a
 * setup arc: they take the customer through the real actions that get a first
 * campaign live (connect email, set availability, review the campaign that
 * onboarding already built, launch it), gated on the same server-derived
 * completion the Setup Checklist reads — a step's Next does not unlock until
 * the underlying record actually says done. Everything after launch is a
 * shortened orientation to the rest of the app, since by then the customer is
 * live and just needs to know where things are.
 *
 * Each step names the `route` it should be viewed on and a `target` selector
 * that exists on that page. The overlay navigates to the route first, waits
 * for the page to finish rendering, then spotlights the real element. A step
 * can set `dynamicRoute: "onboardingCampaign"` to instead open the actual
 * campaign onboarding built (falling back to `route` if that campaign can't
 * be resolved yet). `requiresStepId` names a Setup Checklist step id — Next
 * stays disabled until that step's server-derived status is "complete".
 * `skippable` steps offer a "Skip for now" action that marks the underlying
 * checklist step skipped instead of forcing it.
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
    title: "Let's get your first campaign live",
    body:
      "An AI agent researches leads, writes and sends the emails, makes the calls, handles replies, and books " +
      "meetings on your calendar. Over the next few minutes you'll actually connect your mailbox, set your " +
      "availability, and review the campaign we've already started building from what you told us — not just " +
      "watch a demo of it.",
    footnote: "You can leave at any time and pick up where you stopped.",
  },
  {
    id: "email",
    route: "/settings",
    target: '[data-tour="settings-email"]',
    placement: "right",
    title: "Connect your email",
    body:
      "This is the mailbox your outreach sends from and replies land in. For Gmail: open " +
      "myaccount.google.com/apppasswords, generate a 16-character app password (your normal Google password " +
      "won't work here), and paste it into the SMTP password field along with smtp.gmail.com / imap.gmail.com. " +
      "Go ahead and connect it now — I'll wait.",
    footnote: "Required before any email can send. Your credentials are encrypted before storage.",
    requiresStepId: "gmail",
  },
  {
    id: "calendar",
    route: "/calendar",
    target: '[data-tour="calendar-hero"]',
    placement: "bottom",
    title: "Set your availability",
    body:
      "Working hours, meeting length, and how much notice you need. When a prospect agrees to a meeting on a " +
      "call, the agent checks this live and locks in a real open slot — no external calendar connection " +
      "required. Set it now, or skip it and come back later.",
    requiresStepId: "calendar",
    skippable: true,
  },
  {
    id: "leads",
    route: "/dashboard",
    target: '[data-tour="dashboard-preparation"]',
    placement: "bottom",
    title: "Finding your first leads",
    body:
      "While you were filling in your product and ideal customer, GNX started searching Apollo in the " +
      "background and enriching matching leads — title, company size, technologies, hiring signals. Only " +
      "verified work emails make the cut, so anything unreachable or shared like info@ is filtered out and " +
      "shown with a reason. This card tracks that progress, and keeps running even if you close this tour.",
  },
  {
    id: "review",
    route: "/campaigns",
    dynamicRoute: "onboardingCampaign",
    target: '[data-tour="campaign-drafts"]',
    placement: "top",
    title: "Read the first email, then approve it",
    body:
      "The agent has already written the whole sequence — every email shows the person it's addressed to, their " +
      "title, and their company, so you can check the recipient without leaving this screen. Nothing has been " +
      "sent. Read the first one and approve it. Just one is enough to continue.",
    requiresStepId: "review_drafts",
  },
  {
    id: "autopilot",
    route: "/campaigns",
    dynamicRoute: "onboardingCampaign",
    target: '[data-tour="campaign-autopilot"]',
    placement: "top",
    title: "Let autopilot handle the rest",
    body:
      "Now that you've seen what it writes, you don't have to read all of them. Turn on autopilot and every " +
      "remaining draft is approved at once, along with anything written from here on. You can switch it off " +
      "for any campaign whenever you want to go back to approving by hand.",
  },
  {
    id: "launch",
    route: "/campaigns",
    dynamicRoute: "onboardingCampaign",
    target: '[data-tour="campaign-launch"]',
    placement: "top",
    title: "Launch it",
    body:
      "Hit Launch and your approved emails start going out. Sending respects the business hours and daily cap " +
      "already set on this campaign, and the sequence stops automatically on a reply, a bounce, an unsubscribe, " +
      "or a booked meeting.",
    requiresStepId: "launch",
  },
  {
    id: "dashboard",
    route: "/dashboard",
    target: '[data-tour="dashboard-kpis"]',
    placement: "bottom",
    title: "You're live — here's the dashboard",
    body:
      "Emails sent, replies received, meetings booked, hot leads needing attention, and saved leads, all in one " +
      "place. The activity feed below tracks every send and reply as it happens.",
  },
  {
    id: "agent",
    route: "/agent",
    target: '[data-tour="agent-overview"]',
    placement: "left",
    title: "AI Agent settings",
    body:
      "This is the agent itself. Ask it to find leads, draft messaging, or explain a result. Its brief — what " +
      "you sell, your value proposition, tone, and expected objections — is what every email and call is built " +
      "from. If outreach ever sounds generic, this is where you fix it.",
  },
  {
    id: "prospects",
    route: "/prospects",
    target: '[data-tour="prospects-sources"]',
    placement: "bottom",
    title: "Prospects and Apollo enrichment",
    body:
      "Four ways to build your lead list: browse the lead table, add someone manually, search Apollo against " +
      "your ideal customer profile, or upload a CSV — beyond what the automatic search already found you.",
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
    id: "inbox",
    route: "/inbox",
    target: '[data-tour="inbox-threads"]',
    placement: "right",
    title: "Inbox and replies",
    body:
      "Every reply lands here as a conversation, classified as interested, a question, an objection, " +
      "out-of-office, or an unsubscribe. The agent drafts a response for each one — you approve drafts yourself " +
      "at first, and can let it send automatically once you trust the output.",
  },
  {
    id: "analytics",
    route: "/analytics",
    target: '[data-tour="analytics-header"]',
    placement: "bottom",
    title: "Analytics",
    body:
      "Reply rates, meeting conversion, and campaign performance over the last 30 days — where you find out " +
      "which audience and which messaging are actually working.",
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
      "Manage your mailbox, the voice agent, and send caps and reply-approval rules. This card is also where " +
      "you restart this tour — handy when someone new joins your team.",
  },
];

export const TOUR_STEP_IDS = TOUR_STEPS.map(step => step.id);
