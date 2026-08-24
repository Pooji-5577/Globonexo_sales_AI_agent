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

// Real usage ceilings, verified 2026-08 against settled rows in Supabase's
// `cost_events` table and the cost model in backend/src/services/
// credit-meter.service.ts. Kept in one place so /pricing and the landing
// page can never show different numbers for the same plan.
//
//  - Email: generateSequenceRaw() makes ONE model call for a whole 3-step
//    sequence, so email_sequence_draft settles at ~1 credit for all 3 steps
//    (real n=9 settled rows, avg/min/max all exactly 1 credit). Credits are
//    never what limits email as a result — the real ceiling is the daily
//    *send* cap (plan.dailyEmailCap), enforced in email.service.ts.
//  - Voice: no daily cap exists anywhere in the backend, so credits are the
//    real ceiling. Real settled average is 26.72 credits/call (n=25 calls,
//    range 8-79, driven by call length). Small sample — directional, not a
//    guarantee, until there's more production volume behind it.
export const AVG_CREDITS_PER_CALL = 26.72;
const DAYS_PER_MONTH = 30;

export function usageCeilingsFor(plan) {
  return {
    emailsPerMonth: plan.dailyEmailCap * DAYS_PER_MONTH,
    callsPerMonth: Math.round(plan.monthlyCredits / AVG_CREDITS_PER_CALL / 10) * 10,
  };
}

// Marketing display numbers — "credits" mean nothing to a first-time visitor,
// so /pricing and the landing page show emails/month and calls/month instead.
// Rounded up from usageCeilingsFor() to clean marketing figures; Startup's
// calls figure (550) is rounded above its true ceiling (538) by sign-off,
// since it reads as a round number and the gap is small enough to not matter
// in practice.
export const MARKETING_CEILINGS = {
  starter: { emailsPerMonth: 3000, callsPerMonth: 100 },
  growth: { emailsPerMonth: 6000, callsPerMonth: 200 },
  scale: { emailsPerMonth: 15000, callsPerMonth: 550 },
};

export function marketingCeilingsFor(plan) {
  return MARKETING_CEILINGS[plan.id];
}
