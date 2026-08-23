const STOPPED_STATUSES = new Set(["engaged", "meeting_booked", "not_interested", "unsubscribed"]);

export function immediateEmailBlockReason({ hasEmail, campaignId, status, campaignBlocked }) {
  if (!hasEmail) return "missing_email";
  if (!campaignId) return "missing_campaign";
  if (STOPPED_STATUSES.has(status)) return "sequence_stopped";
  if (campaignBlocked) return "campaign_lead_blocked";
  return null;
}
