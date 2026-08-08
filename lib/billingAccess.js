// Opt-in, not opt-out: an unset env var must never grant workspace access.
// This is a NEXT_PUBLIC_* var baked into the client bundle at build time, so
// if it's simply absent from an environment's config (as it is in production
// today) the bypass must default to off, not on.
export const DEV_BILLING_BYPASS = process.env.NEXT_PUBLIC_DEV_BILLING_BYPASS === '1';

export const BILLING_ACCESS_STATUSES = new Set(['active', 'past_due']);

export function hasWorkspaceAccess(user, organization) {
  if (!user || !organization) return false;
  if (user.role === 'admin') return true;
  if (DEV_BILLING_BYPASS) return true;
  return BILLING_ACCESS_STATUSES.has(organization.subscription_status);
}
