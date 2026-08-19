const CAMPAIGN_MAX_LEADS = 25;

function clampWholeNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(parsed)));
}

/**
 * Sanitizes browser-persisted campaign state before it reaches the form.
 * Older drafts may contain limits that are no longer customer-configurable.
 */
export function normalizeSavedCampaignForm(savedForm) {
  if (!savedForm || typeof savedForm !== "object" || Array.isArray(savedForm)) return {};

  const { apolloCreditLimit: _internalCreditLimit, ...rest } = savedForm;

  return {
    ...rest,
    maxLeads: clampWholeNumber(savedForm.maxLeads, CAMPAIGN_MAX_LEADS, 1, CAMPAIGN_MAX_LEADS),
    weeklyQualifiedLeadTarget: clampWholeNumber(
      savedForm.weeklyQualifiedLeadTarget,
      CAMPAIGN_MAX_LEADS,
      1,
      CAMPAIGN_MAX_LEADS,
    ),
  };
}
