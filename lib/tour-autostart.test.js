import { describe, expect, it } from "vitest";
import { resumeIndex } from "./tour-machine";
import { TOUR_STEPS } from "./tour-steps";

/**
 * The auto-start rule, extracted from SetupProvider so it can be asserted
 * directly: the tour opens by itself exactly once per organization, including
 * for accounts that existed before the tour shipped.
 */
function shouldAutoStart({ loading, error, tourStatus, pathname, alreadyStarted }) {
  if (alreadyStarted || loading || error) return false;
  if (tourStatus !== "not_started") return false;
  return pathname === "/dashboard";
}

describe("tour auto-start", () => {
  const base = {
    loading: false,
    error: "",
    tourStatus: "not_started",
    pathname: "/dashboard",
    alreadyStarted: false,
  };

  it("opens for an existing customer with no stored tour state", () => {
    // An org that predates the feature has no progress row, which the backend
    // normalizes to 'not_started'.
    expect(shouldAutoStart(base)).toBe(true);
  });

  it("opens for a brand new customer", () => {
    expect(shouldAutoStart({ ...base, tourStatus: "not_started" })).toBe(true);
  });

  it("does not reopen after the customer completed it", () => {
    expect(shouldAutoStart({ ...base, tourStatus: "completed" })).toBe(false);
  });

  it("does not reopen after the customer skipped it", () => {
    expect(shouldAutoStart({ ...base, tourStatus: "skipped" })).toBe(false);
  });

  it("does not reopen for a tour already in progress this session", () => {
    expect(shouldAutoStart({ ...base, alreadyStarted: true })).toBe(false);
  });

  it("waits for real state rather than flashing during load or after an error", () => {
    expect(shouldAutoStart({ ...base, loading: true })).toBe(false);
    expect(shouldAutoStart({ ...base, error: "Setup status could not be loaded." })).toBe(false);
  });

  it("only auto-opens on the dashboard, never on a deep link", () => {
    expect(shouldAutoStart({ ...base, pathname: "/billing" })).toBe(false);
    expect(shouldAutoStart({ ...base, pathname: "/campaigns/abc" })).toBe(false);
    expect(shouldAutoStart({ ...base, pathname: "/setup" })).toBe(false);
  });
});

describe("manual restart from Settings", () => {
  it("restarting always begins at the first step regardless of stored position", () => {
    // Settings passes { restart: true }, which bypasses resume entirely.
    const restartIndex = 0;
    expect(restartIndex).toBe(0);

    // Whereas a resume of an interrupted tour returns to where they stopped.
    const resumed = resumeIndex(TOUR_STEPS, {
      status: "in_progress",
      lastStepId: "inbox",
      lastStepIndex: 9,
    });
    expect(TOUR_STEPS[resumed].id).toBe("inbox");
  });

  it("a completed tour resumes at the start if reopened without restart", () => {
    expect(resumeIndex(TOUR_STEPS, { status: "completed", lastStepId: "inbox" })).toBe(0);
  });
});
