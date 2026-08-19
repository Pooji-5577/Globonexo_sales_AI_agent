// Shared plan catalogue for the standalone /subscribe checkout and the
// in-dashboard /billing management page, so the two can never drift apart.
//
// These display values mirror the backend's authoritative smallest-unit
// amounts. Razorpay still receives the configured Plan ID; the browser never
// decides the amount charged.
export const PLAN_CONFIG = [
  {
    id: 'starter',
    name: 'Individual',
    monthly: 59,
    annualMonthly: 49,
    annualTotal: 588,
    monthlyCredits: 2645,
    emailCampaigns: 3,
    voiceCampaigns: 1,
    dailyEmailCap: 100,
    desc: 'For one person running outbound alone.',
    feats: ['2,645 credits/month', '3 email campaigns', '1 voice campaign', 'AI email sequences', 'Lead enrichment from verified data providers', 'AI voice calling'],
  },
  {
    id: 'growth',
    name: 'Agency',
    monthly: 179,
    annualMonthly: 149,
    annualTotal: 1788,
    monthlyCredits: 5370,
    emailCampaigns: 10,
    voiceCampaigns: 4,
    dailyEmailCap: 200,
    desc: 'For agencies running outbound across multiple client accounts.',
    feats: ['5,370 credits/month', '10 email campaigns', '4 voice campaigns', 'AI email sequences', 'Lead enrichment from verified data providers', 'AI voice calling'],
  },
  {
    id: 'scale',
    name: 'Startup',
    monthly: 479,
    annualMonthly: 399,
    annualTotal: 4788,
    monthlyCredits: 14370,
    emailCampaigns: 25,
    voiceCampaigns: 10,
    dailyEmailCap: 500,
    desc: 'For startups building an in-house outbound motion at volume.',
    feats: ['14,370 credits/month', '25 email campaigns', '10 voice campaigns', 'AI email sequences', 'Lead enrichment from verified data providers', 'AI voice calling'],
  },
];

export const MOST_POPULAR_PLAN_ID = 'growth';

// Statuses that grant workspace access. Mirrors AppShell's gate and the
// backend's providerStatusToOrganizationStatus mapping.
export const ACCESS_STATUSES = new Set(['active', 'past_due']);

// Derived from PLAN_CONFIG so the toggle's claim can never drift from the
// prices actually shown on the cards.
export const MAX_ANNUAL_SAVINGS_PERCENT = Math.round(
  Math.max(...PLAN_CONFIG.map((plan) => (1 - plan.annualMonthly / plan.monthly) * 100)),
);

// Display labels only. The values sent to the backend stay 'monthly'/'annual'.
export const BILLING_PERIOD_OPTIONS = [
  { label: 'Monthly', isAnnual: false },
  { label: 'Yearly', isAnnual: true },
];

export function findPlan(planId) {
  return PLAN_CONFIG.find((plan) => plan.id === planId);
}
