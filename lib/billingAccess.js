export const DEV_BILLING_BYPASS = process.env.NEXT_PUBLIC_DEV_BILLING_BYPASS !== '0';

export const BILLING_ACCESS_STATUSES = new Set(['active', 'past_due']);

export function hasWorkspaceAccess(user, organization) {
  if (!user || !organization) return false;
  if (user.role === 'admin') return true;
  if (DEV_BILLING_BYPASS) return true;
  return BILLING_ACCESS_STATUSES.has(organization.subscription_status);
}
