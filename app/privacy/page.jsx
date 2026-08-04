export const metadata = {
  title: "Privacy Policy — GNX sales",
  description: "Privacy Policy for GNX sales.",
};

import LegalPage from "../../components/layout/LegalPage";

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
  return <LegalPage title="Privacy Policy" updated="June 19, 2026" sections={sections} />;
}
