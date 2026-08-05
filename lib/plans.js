// Shared plan catalogue for the standalone /subscribe checkout and the
// in-dashboard /billing management page, so the two can never drift apart.
//
// These display values mirror the backend's authoritative smallest-unit
// amounts. Razorpay still receives the configured Plan ID; the browser never
// decides the amount charged.
export const PLAN_CONFIG = [
  { id: 'starter', name: 'Starter', monthly: 59, annualMonthly: 49, annualTotal: 588, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'], emailCap: 1500 },
  { id: 'growth', name: 'Growth', monthly: 179, annualMonthly: 149, annualTotal: 1788, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], emailCap: 6000, seats: 5 },
  { id: 'scale', name: 'Scale', monthly: 479, annualMonthly: 399, annualTotal: 4788, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'], emailCap: null, seats: 20 },
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
