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

const ACTIVE_SIMULATION_STATUSES = new Set(["queued", "running", "repairing"]);
const ACTIVE_IMPORT_STATUSES = new Set(["queued", "searching", "candidates_found", "enriching", "waiting_for_enrichment"]);

export function simulationPresentation(data = {}) {
  const status = data?.campaign?.retell_simulation_status ?? "not_started";
  const runs = data?.simulation?.runs ?? [];
  const activeRun = runs.find(run => ["queued", "in_progress"].includes(run?.status));
  const terminalRun = runs.find(run => ["pass", "fail", "error"].includes(run?.status) && Number(run?.total_count ?? 0) > 0);
  const run = ACTIVE_SIMULATION_STATUSES.has(status) ? (activeRun ?? runs[0] ?? null) : (terminalRun ?? runs[0] ?? null);
  const failure = (run?.results ?? []).find(item => item?.status === "fail" || item?.status === "error") ?? null;
  return {
    status,
    active: ACTIVE_SIMULATION_STATUSES.has(status) && Boolean(activeRun),
    passed: Number(run?.pass_count ?? 0),
    total: Number(run?.total_count ?? 0),
    failedScenario: failure?.scenarioKey ?? failure?.scenario_key ?? null,
    explanation: failure?.explanation ?? failure?.result_explanation ?? null,
    run,
  };
}

export function shouldPollCampaignPreparation(data = {}) {
  const simulation = simulationPresentation(data);
  const preparationStatus = data?.campaign?.preparation_status ?? "not_started";
  const importStatus = data?.latestImport?.status ?? null;
  return preparationStatus === "preparing"
    || simulation.active
    || ACTIVE_IMPORT_STATUSES.has(importStatus);
}

export function campaignPreparationEvents(data = {}) {
  const events = latestPreparationEvents(data?.events ?? []);
  const simulation = simulationPresentation(data);
  if (!["attention", "passed"].includes(simulation.status) || simulation.total <= 0) return events;
  const title = simulation.status === "passed"
    ? "All required agent simulations passed"
    : "Voice agent needs attention";
  const scenario = simulation.failedScenario ? String(simulation.failedScenario).replace(/_/g, " ") : "Mandatory scenario";
  const detail = simulation.status === "passed"
    ? `${simulation.passed}/${simulation.total} mandatory simulations passed.`
    : `${simulation.passed}/${simulation.total} passed. ${scenario}${simulation.explanation ? `: ${simulation.explanation}` : " failed."}`;
  const authoritative = {
    id: `authoritative-retell-${simulation.run?.id ?? simulation.status}`,
    stage: "retell_simulation",
    status: simulation.status === "passed" ? "complete" : "attention",
    title,
    detail,
    completed_count: simulation.passed,
    total_count: simulation.total,
  };
  const existingIndex = events.findIndex(event => event.stage === "retell_simulation");
  if (existingIndex < 0) return [...events, authoritative];
  return events.map((event, index) => index === existingIndex ? authoritative : event);
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
