export const metadata = {
  title: "Terms of Service — Globonexo Sales AI",
  description: "Terms of Service for Globonexo Sales AI.",
};

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="public-page">
      <main className="legal-page public-section">
        <Link className="legal-back" href="/">Back to home</Link>
        <span className="eyebrow">Legal</span>
        <h1 className="display">Terms of Service</h1>
        <p className="legal-updated">Last updated: June 19, 2026</p>

        <section>
          <h2>1. Agreement</h2>
          <p>These Terms govern access to Globonexo Sales AI, a SaaS platform for AI-assisted outbound sales, reply drafting, voice campaigns, and meeting workflows. By creating an account or using the service, you agree to these Terms.</p>
        </section>

        <section>
          <h2>2. Accounts and Eligibility</h2>
          <p>You must provide accurate account information, keep credentials secure, and use the service only for lawful business purposes. Globonexo Sales AI is intended for US business users during the v0.1 launch.</p>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>
          <p>You may not use the service to send unlawful, deceptive, abusive, or unsolicited messages that violate applicable email, telemarketing, privacy, or platform rules. You are responsible for campaign content, lead lists, consent, unsubscribe handling, and call disclosure requirements.</p>
        </section>

        <section>
          <h2>4. AI Output</h2>
          <p>AI-generated emails, replies, prompts, and call content may be inaccurate or incomplete. You are responsible for reviewing AI output before use unless you enable auto-approval features.</p>
        </section>

        <section>
          <h2>5. Payments</h2>
          <p>Paid plans are billed through Stripe. Fees are non-refundable except where required by law or stated in a written agreement. Plan limits may include users, agents, emails, calls, lead enrichment, and support level.</p>
        </section>

        <section>
          <h2>6. Suspension and Termination</h2>
          <p>We may suspend or terminate access if usage creates security, deliverability, legal, platform, or operational risk. You may stop using the service at any time.</p>
        </section>

        <section>
          <h2>7. Disclaimers and Liability</h2>
          <p>The service is provided as-is to the maximum extent permitted by law. Globonexo is not liable for lost revenue, lost data, deliverability outcomes, campaign performance, or indirect damages.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>Questions about these Terms can be sent to support@globonexo.com.</p>
        </section>
      </main>
    </div>
  );
}
