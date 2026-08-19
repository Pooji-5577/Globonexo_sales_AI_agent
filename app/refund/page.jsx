export const metadata = {
  title: "Refund policy for GNX Sales",
  description: "Refund Policy for GNX sales subscriptions.",
};

import LegalPage from "../../components/layout/LegalPage";

const sections = [
  {
    title: "1. Overview",
    body: "This Refund Policy explains how billing, cancellations, and refunds work for GNX sales subscriptions. It applies alongside our Terms of Service.",
  },
  {
    title: "2. Subscription Billing",
    body: "There is no free trial. Paid plans are billed in advance through Razorpay for the monthly or annual period selected at checkout. Billing must be completed before onboarding and product access.",
  },
  {
    title: "3. Plan Billing",
    body: "Paid plans use Razorpay recurring subscriptions. Monthly plans run for 120 billing cycles and annual plans run for 10 billing cycles. You can cancel at any time; cancellation takes effect at the end of the current paid period.",
  },
  {
    title: "4. Cancellations",
    body: "You can cancel at any time from Billing in your account settings. Cancellation stops future renewals and your plan stays active until the end of the current billing period. We do not automatically prorate or refund the unused portion of a period.",
  },
  {
    title: "5. Refund Eligibility",
    body: "Fees are non-refundable except where required by law. We will review refund requests made within 14 days of a charge for duplicate billing, a charge after a confirmed cancellation, or a sustained platform outage that prevented normal use of the service.",
  },
  {
    title: "6. Non-Refundable Items",
    body: "Usage-based charges that have already been consumed are non-refundable. This includes sent emails, placed voice call minutes, lead enrichment credits, and AI generation usage, along with one-time onboarding or implementation fees.",
  },
  {
    title: "7. How to Request a Refund",
    body: "Email support@globonexo.com from the address on your account with the organization name, invoice or charge date, and the reason for the request. We respond to refund requests within 3 business days.",
  },
  {
    title: "8. Approved Refunds",
    body: "Approved refunds are issued to the original payment method through Razorpay and typically appear within 5 to 10 business days depending on your bank or card issuer.",
  },
  {
    title: "9. Chargebacks",
    body: "Please contact us before opening a chargeback so we can resolve the issue directly. Accounts with an open chargeback may be suspended until the dispute is settled.",
  },
  {
    title: "10. Contact",
    body: "Billing and refund questions can be sent to support@globonexo.com.",
  },
];

export default function RefundPage() {
  return <LegalPage title="Refund Policy" updated="July 21, 2026" sections={sections} />;
}
