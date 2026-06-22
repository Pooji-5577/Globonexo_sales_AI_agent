export const metadata = {
  title: "Privacy Policy — Globonexo Sales AI",
  description: "Privacy Policy for Globonexo Sales AI.",
};

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="public-page">
      <main className="legal-page public-section">
        <Link className="legal-back" href="/">Back to home</Link>
        <span className="eyebrow">Legal</span>
        <h1 className="display">Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 19, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect account details, organization details, onboarding responses, campaign settings, lead data you upload or source through connected providers, support messages, and usage analytics.</p>
        </section>

        <section>
          <h2>2. Connected Services</h2>
          <p>If you connect Gmail, Stripe, Apollo, Retell, Supabase, PostHog, or other providers, we process the information needed to provide the requested workflow, such as sending emails, reading campaign replies, processing payments, enriching leads, and logging product events.</p>
        </section>

        <section>
          <h2>3. How We Use Information</h2>
          <p>We use information to operate the product, authenticate users, create AI agent configurations, generate outbound content, send and track campaign activity, provide support, improve reliability, prevent abuse, and comply with legal obligations.</p>
        </section>

        <section>
          <h2>4. AI Processing</h2>
          <p>Campaign context, lead details, message history, and onboarding inputs may be sent to AI model providers to generate emails, replies, voice prompts, summaries, and recommendations.</p>
        </section>

        <section>
          <h2>5. Sharing</h2>
          <p>We share data with service providers that help us run the product, including hosting, database, authentication, payments, analytics, email, voice, and AI infrastructure. We do not sell personal information.</p>
        </section>

        <section>
          <h2>6. Security and Retention</h2>
          <p>We use reasonable technical and organizational safeguards. We retain information while your account is active and as needed for product, legal, security, and operational purposes.</p>
        </section>

        <section>
          <h2>7. Your Choices</h2>
          <p>You can update account information, disconnect integrations, request deletion, and opt out of non-essential communications. Campaign recipients should use unsubscribe or reply instructions in outbound messages.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>Privacy questions can be sent to support@globonexo.com.</p>
        </section>
      </main>
    </div>
  );
}
