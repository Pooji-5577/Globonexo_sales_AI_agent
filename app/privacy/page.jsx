export const metadata = {
  title: "Privacy Policy — Globonexo Sales AI",
  description: "Privacy Policy for Globonexo Sales AI.",
};

import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect account details, organization details, onboarding responses, campaign settings, lead data you upload or source through connected providers, support messages, and usage analytics.",
  },
  {
    title: "2. Connected Services",
    body: "If you connect Gmail, Stripe, Apollo, Retell, Supabase, PostHog, or other providers, we process the information needed to provide the requested workflow, such as sending emails, reading campaign replies, processing payments, enriching leads, and logging product events.",
  },
  {
    title: "3. How We Use Information",
    body: "We use information to operate the product, authenticate users, create AI agent configurations, generate outbound content, send and track campaign activity, provide support, improve reliability, prevent abuse, and comply with legal obligations.",
  },
  {
    title: "4. AI Processing",
    body: "Campaign context, lead details, message history, and onboarding inputs may be sent to AI model providers to generate emails, replies, voice prompts, summaries, and recommendations.",
  },
  {
    title: "5. Sharing",
    body: "We share data with service providers that help us run the product, including hosting, database, authentication, payments, analytics, email, voice, and AI infrastructure. We do not sell personal information.",
  },
  {
    title: "6. Security and Retention",
    body: "We use reasonable technical and organizational safeguards. We retain information while your account is active and as needed for product, legal, security, and operational purposes.",
  },
  {
    title: "7. Your Choices",
    body: "You can update account information, disconnect integrations, request deletion, and opt out of non-essential communications. Campaign recipients should use unsubscribe or reply instructions in outbound messages.",
  },
  {
    title: "8. Contact",
    body: "Privacy questions can be sent to support@globonexo.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="public-page">
      <main className="legal-page public-section">
        <header className="legal-hero">
          <div>
            <Link className="legal-back" href="/">Back to home</Link>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="display">Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 19, 2026</p>
        </header>

        <div className="legal-layout">
          <aside className="legal-toc" aria-label="Privacy sections">
            <span>On this page</span>
            {sections.map((section) => (
              <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {section.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </aside>

          <article className="legal-card">
            {sections.map((section) => (
              <section key={section.title} id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  );
}
