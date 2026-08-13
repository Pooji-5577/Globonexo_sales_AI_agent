export function latestPreparationEvents(events = []) {
  const byStage = new Map();
  for (const event of events) {
    if (!event?.stage) continue;
    byStage.set(event.stage, event);
  }
  return [...byStage.values()].map(event => (
    event.stage === "email_generation" && event.status === "complete" && event.total_count != null
      ? { ...event, completed_count: event.total_count }
      : event
  ));
}

export function formatScheduledInTimezone(value, timezone) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone || undefined,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export const DISPLAY_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];
