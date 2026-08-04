export const metadata = {
  title: "FAQs — GNX sales",
  description: "Answers to common questions about GNX sales pricing, trials, AI replies, deliverability, integrations, and data handling.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const groups = [
  {
    title: "Getting started",
    items: [
      {
        q: "What exactly does GNX sales do?",
        a: "It runs the outbound loop for you. The agent sources and qualifies leads, writes personalized emails, sends and follows up on a schedule, drafts replies to responses, and books qualified meetings on your calendar.",
      },
      {
        q: "How long does setup take?",
        a: "Most teams are live in under an hour. You complete onboarding so the agent learns your offer and ideal customer, connect Gmail for sending, build a lead list, and launch a campaign. First meetings typically land within two to four weeks.",
      },
      {
        q: "Do I need a technical person to set it up?",
        a: "No. Onboarding is a guided set of questions and the integrations are one-click OAuth connections. No code or engineering work is required.",
      },
      {
        q: "Can I import my existing leads?",
        a: "Yes. Upload a CSV and map your columns, or search Apollo directly inside the product to build a new list against your ideal customer profile.",
      },
    ],
  },
  {
    title: "AI and quality control",
    items: [
      {
        q: "Do AI replies send automatically?",
        a: "Not unless you turn that on. By default every AI-drafted reply waits in your inbox for review, and you can approve, edit, or reject it before anything goes out.",
      },
      {
        q: "How personalized are the messages?",
        a: "The agent writes from your onboarding answers, the campaign context, and what it knows about each lead, so messages reference the specific company and role rather than reusing one template.",
      },
      {
        q: "What if the AI writes something wrong?",
        a: "AI output can be inaccurate, which is why human review is the default. You stay responsible for what is sent, and you can edit any draft or adjust the campaign instructions to correct the pattern.",
      },
      {
        q: "Can I control tone and messaging?",
        a: "Yes. You set the offer, tone, and call to action per campaign, and you can edit any generated step directly before launching.",
      },
    ],
  },
  {
    title: "Deliverability and compliance",
    items: [
      {
        q: "Will this hurt my domain reputation?",
        a: "Sending is throttled and spread across sending windows rather than blasted. You still control volume, and we recommend warming a new domain and keeping lists targeted rather than broad.",
      },
      {
        q: "Who is responsible for compliance?",
        a: "You are. You are responsible for your lead lists, consent, unsubscribe handling, and call disclosure requirements under applicable email, telemarketing, and privacy rules. See our Terms of Service for the full detail.",
      },
      {
        q: "How are unsubscribes handled?",
        a: "Outbound messages carry unsubscribe or reply instructions, and opt-outs are recorded so the lead is excluded from further sending.",
      },
    ],
  },
  {
    title: "Integrations",
    items: [
      {
        q: "Which email providers are supported?",
        a: "Gmail is supported today through a secure OAuth connection used for sending campaign email and reading campaign replies.",
      },
      {
        q: "What does the product integrate with?",
        a: "Gmail for email, Apollo for lead sourcing and enrichment, Retell for AI voice calls, Stripe for billing, Supabase for authentication and data, and PostHog for product analytics.",
      },
      {
        q: "Do voice campaigns come with every plan?",
        a: "AI voice campaigns are included from the Growth plan upward. The Starter plan covers email outbound, lead sourcing, and human-approved AI replies.",
      },
    ],
  },
  {
    title: "Plans and billing",
    items: [
      {
        q: "Is there a free trial?",
        a: "Yes, paid plans start with a free trial and you are not charged until it ends. Cancel before the trial ends and no charge is made.",
      },
      {
        q: "Can I change or cancel my plan?",
        a: "You can change or cancel at any time from Billing in your settings. Cancelling stops future renewals and your plan stays active through the end of the current billing period.",
      },
      {
        q: "Do you offer refunds?",
        a: "Fees are generally non-refundable, but we review requests made within 14 days for duplicate charges, charges after a confirmed cancellation, or a sustained outage. Our Refund Policy has the full terms.",
      },
      {
        q: "What happens if I exceed my plan limits?",
        a: "You will be prompted to upgrade before sending beyond your plan's email, call, or enrichment limits. Usage already consumed is billed as used.",
      },
    ],
  },
  {
    title: "Data and security",
    items: [
      {
        q: "Do you sell my data?",
        a: "No. We do not sell personal information. Data is shared only with the service providers needed to run the product, such as hosting, email, payments, and AI infrastructure.",
      },
      {
        q: "Is my lead data used to train AI models?",
        a: "Campaign context and lead details are sent to AI providers to generate content for your account. We do not sell your data or use it to build products for other customers.",
      },
      {
        q: "Can I delete my data?",
        a: "Yes. You can disconnect integrations at any time and request account deletion by writing to support@globonexo.com. See the Privacy Policy for retention detail.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="public-page">
      <PublicNav />

      <main>
        <section className="content-hero public-section">
          <span className="eyebrow">FAQs</span>
          <h1 className="display">Questions we get asked most.</h1>
          <p>
            Straight answers on setup, AI quality, deliverability, integrations, billing, and how we handle your data.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Start free trial <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/help">Browse the Help Center</Link>
          </div>
        </section>

        <section className="content-section public-section">
          <div className="faq-groups-grid">
            {groups.map((group) => (
              <div key={group.title} className="faq-group">
                <h2>{group.title}</h2>
                <div className="faq-list">
                  {group.items.map((item) => (
                    <details key={item.q} className="faq-item">
                      <summary>
                        <span>{item.q}</span>
                        <Icon name="plus" size={18} color="var(--muted)" />
                      </summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-cta public-section">
          <div>
            <h2>Did not find your answer?</h2>
            <p>Ask us directly. We reply within one business day.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-dark" href="/contact">Contact support</Link>
            <Link className="btn btn-ghost" href="/help">Help Center</Link>
          </div>
        </section>
      </main>

      <PublicFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
