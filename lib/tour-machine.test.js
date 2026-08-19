import { describe, expect, it } from "vitest";
import {
  advance,
  clampIndex,
  computePopoverPosition,
  isFirstStep,
  isLastStep,
  isStepUnlocked,
  keyIntent,
  nextIndex,
  pickVisibleTarget,
  prevIndex,
  progressLabel,
  resolveStepRoute,
  resumeIndex,
  retreat,
  stepAt,
} from "./tour-machine";
import { TOUR_STEPS } from "./tour-steps";

const steps = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

describe("tour navigation", () => {
  it("moves forward and backward within bounds", () => {
    expect(nextIndex(0, steps)).toBe(1);
    expect(nextIndex(3, steps)).toBe(3);
    expect(prevIndex(2, steps)).toBe(1);
    expect(prevIndex(0, steps)).toBe(0);
  });

  it("finishes rather than advancing past the last step", () => {
    expect(advance(2, steps)).toEqual({ action: "move", index: 3 });
    expect(advance(3, steps)).toEqual({ action: "finish", index: 3 });
  });

  it("stays put when Back is pressed on the first step", () => {
    expect(retreat(0, steps)).toEqual({ action: "stay", index: 0 });
    expect(retreat(2, steps)).toEqual({ action: "move", index: 1 });
  });

  it("knows the first and last step", () => {
    expect(isFirstStep(0)).toBe(true);
    expect(isFirstStep(1)).toBe(false);
    expect(isLastStep(3, steps)).toBe(true);
    expect(isLastStep(2, steps)).toBe(false);
    expect(isLastStep(0, [])).toBe(true);
  });

  it("clamps out-of-range indexes instead of returning undefined steps", () => {
    expect(clampIndex(99, steps.length)).toBe(3);
    expect(clampIndex(-4, steps.length)).toBe(0);
    expect(clampIndex(NaN, steps.length)).toBe(0);
    expect(stepAt(steps, 99)).toEqual({ id: "d" });
    expect(stepAt([], 0)).toBeNull();
  });

  it("labels progress from a one-based position", () => {
    expect(progressLabel(0, steps)).toBe("Step 1 of 4");
    expect(progressLabel(3, steps)).toBe("Step 4 of 4");
    expect(progressLabel(0, [])).toBe("");
  });

  it("maps keyboard input onto tour intents", () => {
    expect(keyIntent("ArrowRight")).toBe("next");
    expect(keyIntent("Enter")).toBe("next");
    expect(keyIntent("ArrowLeft")).toBe("prev");
    expect(keyIntent("Escape")).toBe("skip");
    expect(keyIntent("a")).toBeNull();
  });
});

describe("resuming a tour", () => {
  it("starts at the beginning when the tour was never started", () => {
    expect(resumeIndex(steps, { status: "not_started" })).toBe(0);
    expect(resumeIndex(steps, null)).toBe(0);
  });

  it("starts at the beginning when the tour was already completed or skipped", () => {
    expect(resumeIndex(steps, { status: "completed", lastStepId: "c", lastStepIndex: 2 })).toBe(0);
    expect(resumeIndex(steps, { status: "skipped", lastStepId: "c", lastStepIndex: 2 })).toBe(0);
  });

  it("resumes an interrupted tour on the step the customer was looking at", () => {
    expect(resumeIndex(steps, { status: "in_progress", lastStepId: "c", lastStepIndex: 2 })).toBe(2);
  });

  it("prefers the step id over the index so reordering steps cannot misplace someone", () => {
    // Server thinks index 3, but the step now lives at index 1.
    expect(resumeIndex(steps, { status: "in_progress", lastStepId: "b", lastStepIndex: 3 })).toBe(1);
  });

  it("falls back to the stored index when the step id no longer exists", () => {
    expect(resumeIndex(steps, { status: "in_progress", lastStepId: "removed", lastStepIndex: 2 })).toBe(2);
  });

  it("clamps a stored index that is now out of range", () => {
    expect(resumeIndex(steps, { status: "in_progress", lastStepId: null, lastStepIndex: 99 })).toBe(3);
    expect(resumeIndex([], { status: "in_progress", lastStepIndex: 4 })).toBe(0);
  });
});

describe("target selection", () => {
  const visible = { getBoundingClientRect: () => ({ width: 100, height: 30 }), offsetParent: {} };
  const zeroSized = { getBoundingClientRect: () => ({ width: 0, height: 0 }), offsetParent: {} };
  const hidden = { getBoundingClientRect: () => ({ width: 100, height: 30 }), offsetParent: null };

  it("picks the first genuinely visible match", () => {
    // The sidebar renders twice: desktop plus the collapsed mobile drawer.
    expect(pickVisibleTarget([hidden, visible])).toBe(visible);
  });

  it("ignores zero-sized and display:none elements", () => {
    expect(pickVisibleTarget([zeroSized, hidden])).toBeNull();
  });

  it("returns null for an empty or missing list", () => {
    expect(pickVisibleTarget([])).toBeNull();
    expect(pickVisibleTarget(null)).toBeNull();
  });
});

describe("popover placement", () => {
  const viewport = { viewportWidth: 1200, viewportHeight: 800, popoverWidth: 340, popoverHeight: 220 };

  it("centres the popover when a step has no anchor", () => {
    const position = computePopoverPosition({ rect: null, ...viewport });
    expect(position.placement).toBe("center");
  });

  it("honours the requested side when it fits", () => {
    const rect = { top: 300, bottom: 340, left: 100, right: 260, width: 160, height: 40 };
    expect(computePopoverPosition({ rect, placement: "right", ...viewport }).placement).toBe("right");
  });

  it("flips to the opposite side when the requested one would overflow", () => {
    // Anchor pinned to the bottom of the viewport: "bottom" cannot fit.
    const rect = { top: 740, bottom: 780, left: 100, right: 260, width: 160, height: 40 };
    expect(computePopoverPosition({ rect, placement: "bottom", ...viewport }).placement).toBe("top");
  });

  it("keeps the popover inside the viewport", () => {
    const rect = { top: 10, bottom: 50, left: 1150, right: 1195, width: 45, height: 40 };
    const position = computePopoverPosition({ rect, placement: "right", ...viewport });
    expect(position.left).toBeGreaterThanOrEqual(0);
    expect(position.left + viewport.popoverWidth).toBeLessThanOrEqual(viewport.viewportWidth);
    expect(position.top).toBeGreaterThanOrEqual(0);
  });

  it("falls back to centre in a viewport too small for any side", () => {
    const rect = { top: 0, bottom: 300, left: 0, right: 300, width: 300, height: 300 };
    const position = computePopoverPosition({
      rect,
      placement: "bottom",
      popoverWidth: 340,
      popoverHeight: 220,
      viewportWidth: 320,
      viewportHeight: 320,
    });
    expect(position.placement).toBe("center");
  });
});

describe("tour content", () => {
  it("covers the setup arc and every area the tour promises to explain", () => {
    const ids = TOUR_STEPS.map(step => step.id);
    for (const required of [
      "welcome",
      "email",
      "calendar",
      "leads",
      "review",
      "launch",
      "dashboard",
      "agent",
      "prospects",
      "pipeline",
      "inbox",
      "analytics",
      "billing",
      "settings",
    ]) {
      expect(ids).toContain(required);
    }
  });

  it("gives every step a title and body, and unique ids", () => {
    expect(new Set(TOUR_STEPS.map(step => step.id)).size).toBe(TOUR_STEPS.length);
    for (const step of TOUR_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(20);
    }
  });

  it("sends every step to a real page as a fallback, even the ones that resolve dynamically", () => {
    for (const step of TOUR_STEPS) {
      expect(step.route, step.id).toMatch(/^\//);
    }

    // The whole point of the rework: a step about a section is read while
    // standing on that section, not from the dashboard.
    const routeFor = id => TOUR_STEPS.find(step => step.id === id).route;
    expect(routeFor("email")).toBe("/settings");
    expect(routeFor("agent")).toBe("/agent");
    expect(routeFor("prospects")).toBe("/prospects");
    expect(routeFor("pipeline")).toBe("/pipeline");
    expect(routeFor("inbox")).toBe("/inbox");
    expect(routeFor("calendar")).toBe("/calendar");
    expect(routeFor("analytics")).toBe("/analytics");
    expect(routeFor("billing")).toBe("/billing");
    expect(routeFor("settings")).toBe("/settings");
  });

  it("anchors to page content rather than to sidebar nav items", () => {
    // Pointing at the nav entry explained the menu, not the feature.
    for (const step of TOUR_STEPS) {
      if (!step.target) continue;
      expect(step.target, step.id).not.toMatch(/data-tour="nav-/);
    }
  });

  it("only allows a targetless step when it is deliberately centred", () => {
    for (const step of TOUR_STEPS) {
      if (step.target === null) expect(step.placement, step.id).toBe("center");
    }
  });

  it("names a real Setup Checklist step id wherever it gates on completion", () => {
    // Mirrors SETUP_STEP_IDS in backend/src/services/setup.service.ts. Kept in
    // sync by hand, which is what this assertion is here to catch.
    const setupStepIds = new Set([
      "profile", "product", "icp", "outreach", "gmail", "calendar",
      "apollo", "retell", "leads", "campaign", "review_drafts", "launch",
    ]);
    for (const step of TOUR_STEPS) {
      if (step.requiresStepId) expect(setupStepIds.has(step.requiresStepId), step.id).toBe(true);
    }
  });
});

describe("step unlocking", () => {
  it("unlocks a step with nothing to require", () => {
    expect(isStepUnlocked({ id: "welcome" }, [])).toBe(true);
  });

  it("stays locked until the named setup step reports complete", () => {
    const step = { id: "email", requiresStepId: "gmail" };
    expect(isStepUnlocked(step, [{ id: "gmail", status: "incomplete" }])).toBe(false);
    expect(isStepUnlocked(step, [{ id: "gmail", status: "complete" }])).toBe(true);
    expect(isStepUnlocked(step, [])).toBe(false);
  });
});

describe("dynamic route resolution", () => {
  it("falls back to the static route when there is nothing dynamic to resolve to", () => {
    expect(resolveStepRoute({ route: "/settings" }, {})).toBe("/settings");
  });

  it("opens the onboarding campaign once its id is known", () => {
    const step = { route: "/campaigns", dynamicRoute: "onboardingCampaign" };
    expect(resolveStepRoute(step, { onboardingCampaignId: "camp_123" })).toBe("/campaigns/camp_123");
  });

  it("falls back to the static route when the campaign id isn't resolved yet", () => {
    const step = { route: "/campaigns", dynamicRoute: "onboardingCampaign" };
    expect(resolveStepRoute(step, {})).toBe("/campaigns");
  });
});
