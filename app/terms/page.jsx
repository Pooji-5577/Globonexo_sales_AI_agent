export const metadata = {
  title: "Terms of Service — GNX sales",
  description: "Terms of Service for GNX sales.",
};

import LegalPage from "../../components/layout/LegalPage";

const sections = [
  {
    title: "1. Agreement and Scope",
    body: "These Terms govern access to GNX Sales, a SaaS platform for AI-assisted lead sourcing, enrichment, outbound email, voice campaigns, reply handling, and meeting workflows. By creating an account, accepting an order, or using the service, you agree to these Terms on behalf of yourself and the organization you represent.",
  },
  {
    title: "2. Accounts and Authority",
    body: "You must provide accurate information, keep credentials secure, and have authority to bind your organization. You are responsible for activity under your account, the users you invite, the integrations you connect, and the campaign settings and budgets they approve.",
  },
  {
    title: "3. Lead Targets Are Not Guaranteed",
    body: "A campaign's Maximum Leads, target prospects, weekly target, or similar setting is an upper limit or requested target—not a promise, minimum commitment, service level, or guarantee that GNX Sales will find, enrich, qualify, enroll, contact, or convert that number of leads. Actual results may be lower because of audience size, duplicate or suppressed records, missing or inaccurate provider data, unavailable email addresses or phone numbers, Do Not Call and opt-out checks, campaign qualification rules, provider outages, account limits, and the campaign's approved credit budget.",
  },
  {
    title: "4. Candidate, Lead, and Progress Measurements",
    body: "Search candidates, enrichment attempts, enriched records, qualified leads, enrolled leads, ready leads, messages sent, calls placed, replies, and meetings are different measurements and must not be treated as equivalent. A campaign may search or enrich more candidates than the number ultimately accepted as usable leads. A preparation progress value of 100% means the configured workflow has reached a terminal outcome; it does not mean the requested lead target was achieved. When a budget, audience, or provider limit is reached, the campaign may complete at 100% with a clearly reported partial result, such as 12 of 25 leads fetched.",
  },
  {
    title: "5. Enrichment Credits and Campaign Budgets",
    body: "Email and phone enrichment can use different numbers of third-party credits, and provider pricing may change. A campaign credit limit is a customer-authorized spending ceiling for paid enrichment requests, not a guarantee of any number of leads. Pending reservations count against the limit. The service stops new paid enrichment when the remaining campaign budget is insufficient and preserves any usable leads already obtained. Credits may be consumed when a provider returns chargeable data even if the record is later rejected by campaign rules, is a duplicate, is suppressed, is not contactable, or does not become a customer. Consumed enrichment credits are non-refundable except where required by law or expressly stated in a written agreement.",
  },
  {
    title: "6. Third-Party Data and Services",
    body: "GNX Sales depends on third-party services for lead data, enrichment, email, calling, AI generation, hosting, analytics, authentication, and payments. We do not control and do not guarantee their data coverage, accuracy, freshness, pricing, deliverability, uptime, policies, or continued availability. Provider identifiers, job titles, company details, email addresses, phone numbers, locations, and compliance indicators may be incomplete or incorrect and should be independently reviewed where material.",
  },
  {
    title: "7. Customer Compliance Responsibilities",
    body: "You are solely responsible for having a lawful basis and all required permissions to collect, upload, enrich, email, or call each contact. You must comply with applicable marketing, privacy, telemarketing, recording, artificial or prerecorded voice, caller identification, suppression, Do Not Call, and opt-out requirements. You must honor unsubscribe and do-not-call requests promptly and must not rely on GNX Sales or a data provider as legal advice or as your only compliance check.",
  },
  {
    title: "8. Acceptable Use",
    body: "You may not use the service for unlawful, deceptive, fraudulent, abusive, discriminatory, harassing, or misleading activity; to contact people who have opted out; to conceal caller or sender identity; to misrepresent AI as a human where disclosure is required; to compromise systems or accounts; or to violate provider rules. We may block a lead, campaign, integration, or account when reasonably necessary to manage legal, security, deliverability, provider, or operational risk.",
  },
  {
    title: "9. AI-Generated Output and Automation",
    body: "AI-generated emails, replies, summaries, research, prompts, recommendations, and call content may be inaccurate, incomplete, outdated, or unsuitable. You are responsible for reviewing outputs and campaign settings before use. If you enable auto-approval, automatic acquisition, automatic sending, or AI calling, you authorize the service to act within the controls and budgets you configured, but you remain responsible for the resulting communications and legal compliance.",
  },
  {
    title: "10. Campaign Outcomes",
    body: "We do not guarantee delivery, inbox placement, opens, replies, phone connection rates, conversations, qualified opportunities, meetings, revenue, or any other sales outcome. Results depend on factors outside our control, including your offer, targeting, sender reputation, connected accounts, provider coverage, recipient behavior, market conditions, and compliance restrictions.",
  },
  {
    title: "11. Fees, Billing, and Refunds",
    body: "Paid plans are billed through Razorpay or another disclosed payment provider. Plan limits may include users, campaigns, leads, email activity, calling, AI usage, enrichment, and support. Subscription fees and consumed usage are non-refundable except where required by law, stated in our Refund Policy, or agreed in writing. Cancelling a subscription stops future renewal but does not reverse usage already incurred.",
  },
  {
    title: "12. Service Changes and Availability",
    body: "We may modify features, provider integrations, limits, safety controls, and pricing with reasonable notice where practicable. The service may be interrupted for maintenance, provider failures, emergencies, security incidents, or events beyond our reasonable control. Beta or preview functionality may change or be discontinued and may contain defects.",
  },
  {
    title: "13. Suspension and Termination",
    body: "We may suspend or terminate access if usage creates legal, security, deliverability, provider, payment, abuse, or operational risk, or if you materially breach these Terms. You may stop using the service at any time. Provisions concerning payment obligations, consumed usage, disclaimers, liability, and legal responsibilities survive termination where applicable.",
  },
  {
    title: "14. Disclaimers and Limitation of Liability",
    body: "To the maximum extent permitted by law, the service and third-party data are provided as-is and as-available without warranties of accuracy, availability, merchantability, fitness for a particular purpose, non-infringement, or campaign results. Globonexo is not liable for lost revenue, lost opportunities, provider charges, inaccurate lead data, deliverability outcomes, campaign performance, compliance failures caused by your instructions or data, or indirect, incidental, special, consequential, or punitive damages. Any liability that cannot lawfully be excluded remains limited only to the extent permitted by applicable law.",
  },
  {
    title: "15. Contact and Legal Review",
    body: "Questions about these Terms can be sent to support@globonexo.com. These online Terms describe the operational allocation of responsibility for GNX Sales; organization-specific order forms or signed agreements control if they expressly conflict with these Terms.",
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="August 18, 2026" sections={sections} />;
}
