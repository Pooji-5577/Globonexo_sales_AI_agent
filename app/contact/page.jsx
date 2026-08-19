export const metadata = {
  title: "Contact GNX Sales support",
  description: "Reach the GNX sales team for product support, billing questions, sales, and security reports.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const channels = [
  {
    icon: "chat",
    title: "Product support",
    body: "Trouble with campaigns, agents, inbox, or integrations. The fastest route is an in-app ticket, which reaches us with your account context attached.",
    action: { label: "Open a support ticket", href: "/support" },
    note: "Signed-in users · replies within 1 business day",
  },
  {
    icon: "mail",
    title: "Email us",
    body: "Not signed in, or prefer email? Write to us directly and include your organization name so we can find your account.",
    action: { label: "support@globonexo.com", href: "mailto:support@globonexo.com" },
    note: "Replies within 1 business day",
  },
  {
    icon: "building",
    title: "Sales and plans",
    body: "Questions about pricing, credit usage, campaign limits, or moving to the Scale plan. We can walk through your outbound motion first.",
    action: { label: "sales@globonexo.com", href: "mailto:sales@globonexo.com" },
    note: "Replies within 1 business day",
  },
  {
    icon: "lock",
    title: "Billing and refunds",
    body: "Invoices, payment methods, plan changes, duplicate charges, and refund requests handled under our Refund Policy.",
    action: { label: "billing@globonexo.com", href: "mailto:billing@globonexo.com" },
    note: "Refund requests reviewed within 3 business days",
  },
  {
    icon: "alertCircle",
    title: "Security and privacy",
    body: "Report a vulnerability, ask about data handling, or make a data deletion request. Please do not include credentials in your message.",
    action: { label: "security@globonexo.com", href: "mailto:security@globonexo.com" },
    note: "Acknowledged within 24 hours",
  },
  {
    icon: "doc",
    title: "Help yourself first",
    body: "Setup guides, deliverability tips, and answers to the questions we get most often are already written up.",
    action: { label: "Browse the Help Center", href: "/help" },
    note: "Available any time",
  },
];

const speedTips = [
  "Your organization name and the email address on the account.",
  "The campaign, agent, or lead the issue involves.",
  "What you expected to happen and what happened instead.",
  "The time it occurred and a screenshot if you have one.",
];

export default function ContactPage() {
  return (
    <div className="public-page contact-page">
      <PublicNav />

      <main>
        <section className="content-hero public-section">
          <span className="eyebrow">Contact support</span>
          <h1 className="display">Talk to a person who knows the product.</h1>
          <p>
            Support is handled by the team that builds GNX sales. Pick the channel that matches your question
            and we will get back to you quickly.
          </p>
          <p className="content-hero-meta">
            <Icon name="clock" size={16} color="var(--g-700)" />
            Monday to Friday, 9am–6pm ET · Priority support included on Growth and Scale plans
          </p>
        </section>

        <section className="content-section public-section">
          <div className="card-grid contact-card-grid">
            {channels.map((channel) => (
              <article key={channel.title} className="content-card">
                <span className="content-card-icon"><Icon name={channel.icon} size={20} color="var(--g-700)" /></span>
                <h3>{channel.title}</h3>
                <p>{channel.body}</p>
                {channel.action.href.startsWith("mailto:") ? (
                  <a className="content-card-link" href={channel.action.href}>
                    {channel.action.label} <Icon name="arrow" size={15} color="currentColor" />
                  </a>
                ) : (
                  <Link className="content-card-link" href={channel.action.href}>
                    {channel.action.label} <Icon name="arrow" size={15} color="currentColor" />
                  </Link>
                )}
                <span className="content-card-note">{channel.note}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section public-section">
          <div className="contact-split">
            <div>
              <h2>Help us answer on the first reply</h2>
              <p>Including these details usually saves a full round trip:</p>
              <ul className="content-list">
                {speedTips.map((tip) => (
                  <li key={tip}><Icon name="checkCircle" size={18} color="var(--g-600)" />{tip}</li>
                ))}
              </ul>
            </div>
            <aside className="contact-aside">
              <h3>Already have an account?</h3>
              <p>In-app tickets are tracked, threaded, and keep the full history of your conversation with support.</p>
              <Link className="btn btn-primary btn-block" href="/support">
                Go to support tickets <Icon name="arrow" size={16} color="#06231a" />
              </Link>
              <Link className="btn btn-ghost btn-block" href="/login">Sign in</Link>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
