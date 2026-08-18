export const metadata = {
  title: "Help Center — GNX sales",
  description: "Guides for setting up agents, sourcing leads, running campaigns, handling replies, and managing billing in GNX sales.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const categories = [
  {
    icon: "spark",
    title: "Getting started",
    body: "Create your account, complete onboarding, and get your first agent live.",
    topics: [
      "Setting up your organization and inviting teammates",
      "Answering onboarding so the agent understands your offer",
      "Connecting Gmail or custom SMTP + IMAP for sending and reply tracking",
      "Launching your first campaign end to end",
    ],
  },
  {
    icon: "users",
    title: "Leads and prospecting",
    body: "Build target lists from a lead database search or your own data.",
    topics: [
      "Searching the lead database for your ideal customer profile",
      "Uploading and mapping a CSV of leads",
      "Deduplicating and cleaning imported lists",
      "Moving qualified prospects into a campaign",
    ],
  },
  {
    icon: "send",
    title: "Campaigns and outreach",
    body: "Write, schedule, and monitor AI-generated email sequences.",
    topics: [
      "Building a sequence with AI-generated steps",
      "Editing tone, offer, and call to action",
      "Sending windows, throttling, and follow-up timing",
      "Pausing, resuming, and cloning a campaign",
    ],
  },
  {
    icon: "inbox",
    title: "Replies and inbox",
    body: "Review AI-drafted replies and keep conversations moving.",
    topics: [
      "How AI drafts replies from conversation history",
      "Approving, editing, or rejecting a draft",
      "Spotting hot leads and routing them to a rep",
      "Handling unsubscribes and out-of-office replies",
    ],
  },
  {
    icon: "phone",
    title: "Voice campaigns",
    body: "Run outbound campaigns and an optional inbound AI receptionist.",
    topics: [
      "Configuring a voice agent and call script",
      "Call disclosure and consent requirements",
      "Reviewing transcripts and call outcomes",
      "Following up by email after a call",
      "Enabling inbound calls, caller identification, and daily minute caps",
    ],
  },
  {
    icon: "calendar",
    title: "Meetings",
    body: "Turn interest into booked time on the calendar.",
    topics: [
      "Connecting your calendar and availability",
      "How the agent qualifies before booking",
      "Rescheduling and no-show handling",
      "Meeting reminders and follow-ups",
    ],
  },
  {
    icon: "trend",
    title: "Analytics",
    body: "Understand what is working across channels.",
    topics: [
      "Reading the dashboard metrics",
      "Open, reply, and meeting conversion rates",
      "Comparing campaign performance",
      "Deliverability signals to watch",
    ],
  },
  {
    icon: "cog",
    title: "Account and billing",
    body: "Manage plans, credits, campaign limits, integrations, and security.",
    topics: [
      "Changing or cancelling your plan",
      "Updating payment methods and invoices",
      "Managing integrations and API access",
      "Password resets and account recovery",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="public-page">
      <PublicNav />

      <main>
        <section className="content-hero public-section">
          <span className="eyebrow">Help Center</span>
          <h1 className="display">Everything you need to run your AI sales agent.</h1>
          <p>
            Guides for setup, prospecting, campaigns, replies, voice, and billing. If you cannot find an answer here,
            support is one message away.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/faq">
              Read the FAQs <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/contact">Contact support</Link>
          </div>
        </section>

        <section className="content-section public-section">
          <div className="card-grid help-card-grid">
            {categories.map((category) => (
              <article key={category.title} className="content-card">
                <span className="content-card-icon"><Icon name={category.icon} size={20} color="var(--g-700)" /></span>
                <h3>{category.title}</h3>
                <p>{category.body}</p>
                <ul className="help-topics">
                  {category.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="content-cta public-section">
          <div>
            <h2>Still stuck?</h2>
            <p>Send us the details and we will work through it with you, usually within one business day.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-dark" href="/contact">Contact support</Link>
            <a className="btn btn-ghost" href="mailto:support@globonexo.com">Email us</a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
