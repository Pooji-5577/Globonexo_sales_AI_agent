export const metadata = {
  title: "Terms of Service — GNX sales",
  description: "Terms of Service for GNX sales.",
};

import LegalPage from "../../components/layout/LegalPage";

const sections = [
  {
    title: "1. Agreement",
    body: "These Terms govern access to GNX sales, a SaaS platform for AI-assisted outbound sales, reply drafting, voice campaigns, and meeting workflows. By creating an account or using the service, you agree to these Terms.",
  },
  {
    title: "2. Accounts and Eligibility",
    body: "You must provide accurate account information, keep credentials secure, and use the service only for lawful business purposes. GNX sales is intended for US business users during the v0.1 launch.",
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
    body: "Paid plans are billed through Stripe. Fees are non-refundable except where required by law or stated in a written agreement. Plan limits may include users, agents, emails, calls, lead enrichment, and support level.",
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
  return <LegalPage title="Terms of Service" updated="June 19, 2026" sections={sections} />;
}
