export const metadata = {
  title: "The agent — GNX Sales",
  description:
    "Everything in GNX Sales: campaigns, lead sourcing and enrichment, email sequences, AI voice calling, inbox and replies, meetings, and analytics.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const areas = [
  {
    icon: "spark",
    eyebrow: "Getting started",
    title: "Setup copilot",
    body: "A guided flow that builds your agent configuration — what you sell, who buys it, your value proposition, pain points, and tone — and can draft your first campaign for you to confirm.",
    points: [
      "Nothing is created without your explicit confirmation",
      "A campaign is only reported as launched if the launch actually succeeded",
      "You are let into the dashboard immediately while lead preparation runs in the background",
    ],
  },
  {
    icon: "target",
    eyebrow: "Targeting",
    title: "Campaigns and qualification",
    body: "You define an ideal customer profile once — industries, titles, seniority, geography, company size. Candidates are then checked against an explicit, editable rubric before anything is spent on them.",
    points: [
      "Qualification runs before enrichment is paid for",
      "Rules are readable and editable, not a hidden score",
      "Each campaign freezes its own brief, so later changes never rewrite past outreach",
    ],
  },
  {
    icon: "users",
    eyebrow: "Prospects",
    title: "Lead sourcing and enrichment",
    body: "Find companies and people through a lead sourcing and enrichment provider, upload a CSV, or add leads by hand. Enrichment runs in batches with retry and backoff so one rate limit does not sink an import.",
    points: [
      "A person existing in a database is not treated as proof they are contactable",
      "Rejections are shown with reasons — no email, unverified address, shared inbox, duplicate, suppressed, do-not-call",
      "A shortfall is reported as a targeting insight instead of a silent gap",
    ],
  },
  {
    icon: "mail",
    eyebrow: "Outreach",
    title: "Email sequences",
    body: "First touch, follow-up, and breakup are generated together as one coherent sequence, so later steps build on earlier ones instead of repeating the same pitch three times.",
    points: [
      "Steps already sent, approved, or queued are locked and never overwritten",
      "If one step of three comes back malformed, only that step is retried",
      "Approve individually, edit inline, regenerate, or approve in batch",
    ],
  },
  {
    icon: "phone",
    eyebrow: "Outreach",
    title: "AI voice calling",
    body: "Voice campaigns get their own agent and conversation flow, built from that campaign's positioning. The agent is simulation-tested against adversarial scenarios before it is allowed to dial.",
    points: [
      "Do-not-call is checked before dialing, separately from email suppression",
      "Calendar availability and meeting booking are live tools the agent can call mid-conversation",
      "Calls outside your configured business hours are rescheduled, not executed",
    ],
    link: { href: "/voice", label: "How voice calling works" },
  },
  {
    icon: "inbox",
    eyebrow: "Conversations",
    title: "Inbox and replies",
    body: "Replies are polled from your connected mailbox, threaded, and drafted for you. A reply from a prospect stops the rest of their sequence automatically.",
    points: [
      "Follow-ups stop for engaged, meeting-booked, not-interested, and unsubscribed leads",
      "Quoted text is stripped before opt-out detection, so your own footer is never read as an unsubscribe",
      "The same inbox event polled twice is a safe no-op",
    ],
  },
  {
    icon: "calendar",
    eyebrow: "Conversions",
    title: "Meetings",
    body: "Set your timezone, working days, hours, meeting length, buffer, and minimum notice. The agent books against real availability computed on the server.",
    points: [
      "The model never invents a time — it offers server-computed slots and collects a choice",
      "A database constraint makes double booking impossible",
      "Reschedule and cancel are supported as first-class actions",
    ],
  },
  {
    icon: "trend",
    eyebrow: "Visibility",
    title: "Dashboard and analytics",
    body: "Emails sent, replies and reply rate, meetings booked, leads needing attention, an activity feed, and a weekly meeting goal — plus campaign and voice-call performance breakdowns.",
    points: [
      "Per-campaign and per-call performance",
      "Credit usage metered per provider and reconciled against actual reported cost",
      "Partial runs report exactly which leads succeeded and why the rest did not",
    ],
  },
  {
    icon: "chat",
    eyebrow: "Control",
    title: "Talk to the agent",
    body: "A chat interface to the system itself. Ask it to find accounts matching your profile, summarize the leads worth attention, draft early follow-ups, or pause every active campaign.",
    points: [
      "Operate the system by asking instead of clicking through screens",
      "Autopilot can be turned on per campaign when you are ready",
      "Autopilot changes who approves a message, never whether it was validated",
    ],
    link: { href: "/accuracy", label: "How it avoids guessing" },
  },
];

export default function PlatformPage() {
  return (
    <div className="public-page story-page">
      <div className="story-hero-band">
        <PublicNav variant="dark" />
        <section className="story-hero public-section">
          <span className="eyebrow">The agent</span>
          <h1 className="display">One agent, the whole outbound motion.</h1>
          <p>
            Not a sending tool with an AI label bolted on. Targeting, research, writing, sending, calling, replies,
            and meetings run as one system with one shared understanding of every prospect.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/pricing">View pricing</Link>
          </div>
        </section>
      </div>

      <main>
        <section className="story-body public-section">
          <ol className="story-capabilities">
            {areas.map((area, index) => (
              <li key={area.title} className="story-capability">
                <div className="story-capability-index">
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="content-card-icon"><Icon name={area.icon} size={20} color="var(--g-700)" /></span>
                  <span className="eyebrow">{area.eyebrow}</span>
                </div>
                <div className="story-capability-copy">
                  <h2>{area.title}</h2>
                  <p>{area.body}</p>
                  {area.link && (
                    <Link className="landing-text-link" href={area.link.href}>
                      {area.link.label} <Icon name="arrow" size={15} color="var(--g-700)" />
                    </Link>
                  )}
                </div>
                <ul className="platform-points">
                  {area.points.map((point) => (
                    <li key={point}>
                      <Icon name="check" size={15} color="var(--g-700)" stroke={2.4} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="solutions-cta">
          <div>
            <h2>See the whole thing running.</h2>
            <p>Choose a plan, connect your inbox, and launch your first campaign.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={16} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/solutions">See it by use case</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
