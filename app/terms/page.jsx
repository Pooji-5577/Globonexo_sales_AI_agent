export const metadata = {
  title: "Terms of Service — Globonexo Sales AI",
  description: "Terms of Service for Globonexo Sales AI.",
};

import Link from "next/link";

const sections = [
  {
    title: "1. Agreement",
    body: "These Terms govern access to Globonexo Sales AI, a SaaS platform for AI-assisted outbound sales, reply drafting, voice campaigns, and meeting workflows. By creating an account or using the service, you agree to these Terms.",
  },
  {
    title: "2. Accounts and Eligibility",
    body: "You must provide accurate account information, keep credentials secure, and use the service only for lawful business purposes. Globonexo Sales AI is intended for US business users during the v0.1 launch.",
  },
  {
    title: "3. Acceptable Use",
    body: "You may not use the service to send unlawful, deceptive, abusive, or unsolicited messages that violate applicable email, telemarketing, privacy, or platform rules. You are responsible for campaign content, lead lists, consent, unsubscribe handling, and call disclosure requirements.",
  },
  {
    title: "4. AI Output",
    body: "AI-generated emails, replies, prompts, and call content may be inaccurate or incomplete. You are responsible for reviewing AI output before use unless you enable auto-approval features.",
  },
  {
    title: "5. Payments",
    body: "Paid plans are billed through Razorpay. Fees are non-refundable except where required by law or stated in a written agreement. Plan limits may include users, agents, emails, calls, lead enrichment, and support level.",
  },
  {
    title: "6. Suspension and Termination",
    body: "We may suspend or terminate access if usage creates security, deliverability, legal, platform, or operational risk. You may stop using the service at any time.",
  },
  {
    title: "7. Disclaimers and Liability",
    body: "The service is provided as-is to the maximum extent permitted by law. Globonexo is not liable for lost revenue, lost data, deliverability outcomes, campaign performance, or indirect damages.",
  },
  {
    title: "8. Contact",
    body: "Questions about these Terms can be sent to support@globonexo.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="public-page">
      <main className="legal-page public-section">
        <header className="legal-hero">
          <div>
            <Link className="legal-back" href="/">Back to home</Link>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="display">Terms of Service</h1>
          <p className="legal-updated">Last updated: June 19, 2026</p>
        </header>

        <div className="legal-layout">
          <aside className="legal-toc" aria-label="Terms sections">
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
