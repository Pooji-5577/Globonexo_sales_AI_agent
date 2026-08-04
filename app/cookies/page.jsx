export const metadata = {
  title: "Cookie Policy — GNX sales",
  description: "How GNX sales uses cookies and similar technologies.",
};

import LegalPage from "../../components/layout/LegalPage";

const sections = [
  {
    title: "1. What Cookies Are",
    body: "Cookies are small text files stored on your device when you visit a website. We also use similar technologies such as local storage and browser session storage to keep the product working correctly.",
  },
  {
    title: "2. Essential Cookies",
    body: "These are required to run the service. They keep you signed in, maintain your session with Supabase authentication, remember your organization context, protect against request forgery, and support secure OAuth flows such as connecting Gmail. The product does not work without them.",
  },
  {
    title: "3. Preference Storage",
    body: "We use local storage to remember interface choices such as whether you are a returning user, saved filters, and dismissed prompts. This keeps the product consistent between visits and holds no marketing data.",
  },
  {
    title: "4. Analytics Cookies",
    body: "We use product analytics, including PostHog, to understand which features are used, where users encounter errors, and how to improve reliability. These cookies collect usage events, page views, and device or browser details.",
  },
  {
    title: "5. Third-Party Cookies",
    body: "Providers we rely on may set their own cookies when you use their flows. This includes Stripe for checkout and fraud prevention, Google for Gmail authorization, and Supabase for authentication.",
  },
  {
    title: "6. Advertising",
    body: "We do not use advertising cookies, and we do not sell information collected through cookies to advertising networks.",
  },
  {
    title: "7. Managing Cookies",
    body: "Most browsers let you view, block, or delete cookies in their settings. Blocking essential cookies will sign you out and prevent core parts of the product from loading. You can clear analytics data at any time by clearing site data for the domain.",
  },
  {
    title: "8. Retention",
    body: "Session cookies are removed when you close the browser. Persistent cookies remain for a limited period set by us or the relevant provider, and are refreshed while you keep using the service.",
  },
  {
    title: "9. Changes",
    body: "We may update this policy as the product and its integrations change. The date above reflects the most recent revision.",
  },
  {
    title: "10. Contact",
    body: "Questions about cookies can be sent to support@globonexo.com.",
  },
];

export default function CookiePage() {
  return <LegalPage title="Cookie Policy" updated="July 21, 2026" sections={sections} />;
}
