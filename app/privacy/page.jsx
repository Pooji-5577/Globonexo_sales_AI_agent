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
    body: "If you connect Gmail, a custom SMTP/IMAP mailbox, Razorpay, our lead sourcing and enrichment provider, Retell, Supabase, PostHog, or other providers, we process the information needed to provide the requested workflow, such as sending emails, reading campaign replies, processing payments, enriching leads, and logging product events.",
  },
  {
    title: "2d. Inbound AI Calls",
    body: "When an organization enables inbound AI calling, we use the incoming phone number and caller-confirmed details to identify the caller, route the call, prevent abuse, and record structured outcomes such as duration, identity status, disposition, and meeting or follow-up requests. Inbound calls begin with an AI disclosure. GNX Sales configures these inbound calls not to retain recordings, transcripts, or provider call logs.",
  },
  {
    title: "2a. Google User Data",
    body: "Connecting a Google account is optional. When you connect Gmail, we request three permissions and use each for one purpose: gmail.send to send the outreach emails and follow-ups you have approved from your own Gmail account; gmail.readonly to read the message threads GNX Sales started on your behalf so we can detect prospect replies, cancel scheduled follow-ups, and show the conversation in your Inbox view; and userinfo.email to identify which Google account is connected. We store OAuth access and refresh tokens so campaigns can continue running, along with the message metadata and reply content needed for the features above. We do not read unrelated mail in your mailbox. You can disconnect Google at any time from Settings, which deletes the stored tokens, and you can revoke access from your Google Account permissions page at https://myaccount.google.com/permissions.",
  },
  {
    title: "2b. Limited Use of Google User Data",
    body: "GNX Sales' use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy (https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements. We do not sell Google user data, do not use it for advertising, do not transfer it except as necessary to provide or improve the features you requested, to comply with applicable law, or as part of a merger or acquisition, and do not use it to develop, improve, or train generalized AI or machine learning models. Human access to Google user data is limited to what you explicitly permit, what is needed for security purposes such as investigating abuse, to comply with applicable law, or where the data is aggregated and anonymized.",
  },
  {
    title: "2c. Custom Email Credentials",
    body: "If you choose a custom email provider, GNX Sales uses the SMTP credentials to send campaign messages and the IMAP credentials to poll the connected inbox for replies to those messages. Custom SMTP and IMAP passwords are encrypted before they are stored. We do not use them for Google Calendar access, and you can disconnect the mailbox from Settings at any time.",
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
  return <LegalPage title="Privacy Policy" updated="August 8, 2026" sections={sections} />;
}
