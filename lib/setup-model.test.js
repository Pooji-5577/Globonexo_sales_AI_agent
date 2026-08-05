import { describe, expect, it } from "vitest";
import {
  SETUP_STEP_META,
  canSkipStep,
  groupSteps,
  isStepActionable,
  isStepResolved,
  nextIncompleteStep,
  progressSummary,
  stepBadge,
  stepMeta,
} from "./setup-model";

const step = (id, overrides = {}) => ({
  id,
  status: "incomplete",
  detail: "",
  skipped: false,
  manual: false,
  dependsOn: [],
  ...overrides,
});

describe("step resolution", () => {
  it("treats complete, unavailable, and skipped steps as resolved", () => {
    expect(isStepResolved(step("gmail", { status: "complete" }))).toBe(true);
    expect(isStepResolved(step("apollo", { status: "unavailable" }))).toBe(true);
    expect(isStepResolved(step("calendar", { skipped: true }))).toBe(true);
    expect(isStepResolved(step("gmail"))).toBe(false);
    expect(isStepResolved(null)).toBe(false);
  });

  it("treats a blocked step as still actionable", () => {
    expect(isStepActionable(step("retell", { status: "blocked" }))).toBe(true);
  });
});

describe("next step selection", () => {
  it("returns the first step that still needs the customer", () => {
    const steps = [
      step("profile", { status: "complete" }),
      step("gmail", { status: "complete" }),
      step("calendar", { skipped: true }),
      step("leads"),
      step("campaign"),
    ];
    expect(nextIncompleteStep(steps).id).toBe("leads");
  });

  it("skips over unavailable integrations", () => {
    const steps = [
      step("apollo", { status: "unavailable" }),
      step("retell", { status: "unavailable" }),
      step("leads"),
    ];
    expect(nextIncompleteStep(steps).id).toBe("leads");
  });

  it("returns null when everything is resolved", () => {
    expect(nextIncompleteStep([step("gmail", { status: "complete" })])).toBeNull();
    expect(nextIncompleteStep([])).toBeNull();
    expect(nextIncompleteStep(null)).toBeNull();
  });
});

describe("progress summary", () => {
  it("excludes unavailable steps from the denominator", () => {
    const summary = progressSummary([
      step("profile", { status: "complete" }),
      step("gmail", { status: "complete" }),
      step("apollo", { status: "unavailable" }),
      step("leads"),
    ]);

    expect(summary.total).toBe(3);
    expect(summary.completed).toBe(2);
    expect(summary.percent).toBe(67);
    expect(summary.allDone).toBe(false);
  });

  it("counts a skipped optional step toward progress but not completion", () => {
    const summary = progressSummary([
      step("gmail", { status: "complete" }),
      step("calendar", { skipped: true }),
    ]);

    expect(summary.completed).toBe(1);
    expect(summary.resolved).toBe(2);
    expect(summary.percent).toBe(100);
    expect(summary.allDone).toBe(true);
  });

  it("reports zero rather than dividing by zero on an empty list", () => {
    expect(progressSummary([]).percent).toBe(0);
    expect(progressSummary(null).total).toBe(0);
  });
});

describe("badges", () => {
  it("only says Done when the backend reported the step complete", () => {
    expect(stepBadge(step("gmail", { status: "complete" })).label).toBe("Done");
    expect(stepBadge(step("gmail")).label).toBe("To do");
    expect(stepBadge(step("gmail", { status: "blocked" })).label).toBe("Needs attention");
    expect(stepBadge(step("apollo", { status: "unavailable" })).label).toBe("Not available");
    expect(stepBadge(step("calendar", { skipped: true })).label).toBe("Skipped");
  });

  it("does not claim Done for a skipped step", () => {
    expect(stepBadge(step("calendar", { skipped: true, status: "incomplete" })).tone).not.toBe("good");
  });
});

describe("skipping", () => {
  it("allows skipping only the optional integrations", () => {
    expect(canSkipStep(step("calendar"))).toBe(true);
    expect(canSkipStep(step("apollo"))).toBe(true);
    expect(canSkipStep(step("retell"))).toBe(true);
    expect(canSkipStep(step("gmail"))).toBe(false);
    expect(canSkipStep(step("leads"))).toBe(false);
  });

  it("does not offer a skip for an already complete or skipped step", () => {
    expect(canSkipStep(step("calendar", { status: "complete" }))).toBe(false);
    expect(canSkipStep(step("calendar", { skipped: true }))).toBe(false);
  });
});

describe("presentation metadata", () => {
  it("covers all eleven checklist steps", () => {
    const ids = Object.keys(SETUP_STEP_META);
    expect(ids).toHaveLength(11);
    for (const id of [
      "profile", "product", "icp", "outreach", "gmail", "calendar",
      "apollo", "retell", "leads", "campaign", "launch",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("gives every step a destination and a reason it matters", () => {
    for (const [id, meta] of Object.entries(SETUP_STEP_META)) {
      expect(meta.href, id).toMatch(/^\//);
      expect(meta.why.length, id).toBeGreaterThan(10);
      expect(meta.cta.length, id).toBeGreaterThan(0);
    }
  });

  it("falls back safely for an unknown step id", () => {
    const meta = stepMeta("brand-new-step");
    expect(meta.title).toBe("brand-new-step");
    expect(meta.href).toBe("/dashboard");
  });

  it("groups steps in setup order and drops empty groups", () => {
    const sections = groupSteps([step("profile"), step("gmail"), step("leads")]);
    expect(sections.map(section => section.group)).toEqual([
      "Tell the agent about you",
      "Connect your tools",
      "Launch your first campaign",
    ]);

    const partial = groupSteps([step("gmail")]);
    expect(partial).toHaveLength(1);
    expect(partial[0].group).toBe("Connect your tools");
  });
});
