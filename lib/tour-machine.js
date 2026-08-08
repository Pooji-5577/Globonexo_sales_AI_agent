/**
 * Pure navigation logic for the product tour.
 *
 * Kept separate from the overlay component so the rules that matter — where a
 * resumed tour restarts, what Next does on the last step, how a missing target
 * degrades — are testable without a DOM.
 */

export function clampIndex(index, length) {
  if (!Number.isFinite(index) || length <= 0) return 0;
  return Math.min(Math.max(Math.floor(index), 0), length - 1);
}

/**
 * Where a tour should open, given persisted server state.
 *
 * A completed or never-started tour opens at the beginning; an interrupted one
 * resumes on the step the customer was last looking at. Resolution is by step
 * id first so that inserting or reordering steps in a later release cannot
 * drop someone into an unrelated part of the tour.
 */
export function resumeIndex(steps, tourState) {
  const list = Array.isArray(steps) ? steps : [];
  if (list.length === 0) return 0;

  const state = tourState ?? {};
  if (state.status !== "in_progress") return 0;

  if (state.lastStepId) {
    const byId = list.findIndex(step => step.id === state.lastStepId);
    if (byId >= 0) return byId;
  }

  return clampIndex(Number(state.lastStepIndex), list.length);
}

export function isFirstStep(index) {
  return index <= 0;
}

export function isLastStep(index, steps) {
  const length = Array.isArray(steps) ? steps.length : 0;
  return length === 0 || index >= length - 1;
}

export function nextIndex(index, steps) {
  const length = Array.isArray(steps) ? steps.length : 0;
  return clampIndex(index + 1, length);
}

export function prevIndex(index, steps) {
  const length = Array.isArray(steps) ? steps.length : 0;
  return clampIndex(index - 1, length);
}

/**
 * What pressing Next should do. Returning an intent rather than mutating lets
 * the component stay dumb and the transition stay testable.
 */
export function advance(index, steps) {
  if (isLastStep(index, steps)) return { action: "finish", index };
  return { action: "move", index: nextIndex(index, steps) };
}

export function retreat(index, steps) {
  if (isFirstStep(index)) return { action: "stay", index: 0 };
  return { action: "move", index: prevIndex(index, steps) };
}

export function stepAt(steps, index) {
  const list = Array.isArray(steps) ? steps : [];
  if (list.length === 0) return null;
  return list[clampIndex(index, list.length)] ?? null;
}

export function progressLabel(index, steps) {
  const length = Array.isArray(steps) ? steps.length : 0;
  if (length === 0) return "";
  return `Step ${clampIndex(index, length) + 1} of ${length}`;
}

/**
 * Whether a step's Next is allowed to fire.
 *
 * A step with no `requiresStepId` is always unlocked (pure narration). One
 * that names a Setup Checklist step id stays locked until that step's
 * server-derived status says "complete" — the same status the checklist
 * itself reads, so the tour can never claim something is done when the
 * checklist would still show it outstanding.
 */
export function isStepUnlocked(step, setupSteps) {
  if (!step?.requiresStepId) return true;
  const list = Array.isArray(setupSteps) ? setupSteps : [];
  const match = list.find(item => item.id === step.requiresStepId);
  return match?.status === "complete";
}

/** Resolves the route a step should actually navigate to, given live context. */
export function resolveStepRoute(step, { onboardingCampaignId } = {}) {
  if (step?.dynamicRoute === "onboardingCampaign" && onboardingCampaignId) {
    return `/campaigns/${onboardingCampaignId}`;
  }
  return step?.route ?? null;
}

/** Maps a keyboard event key onto a tour intent. Returns null for other keys. */
export function keyIntent(key) {
  if (key === "ArrowRight" || key === "Enter") return "next";
  if (key === "ArrowLeft") return "prev";
  if (key === "Escape") return "skip";
  return null;
}

/**
 * Chooses which element a step should point at.
 *
 * A selector can match several nodes — the sidebar nav is rendered twice, once
 * for desktop and once inside the mobile drawer. Only a genuinely visible node
 * can be spotlighted, so hidden matches are skipped and a step with no visible
 * match is rendered as a centred card instead.
 */
export function pickVisibleTarget(candidates) {
  const list = Array.from(candidates ?? []);
  return list.find(element => {
    if (!element) return false;
    if (typeof element.getBoundingClientRect !== "function") return false;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    // offsetParent is null for display:none subtrees (and for position:fixed,
    // which the sidebar is not).
    return element.offsetParent !== null;
  }) ?? null;
}

/**
 * Places the popover relative to the spotlighted rect, flipping when it would
 * overflow the viewport. Returns coordinates in viewport space.
 */
export function computePopoverPosition({
  rect,
  placement = "bottom",
  popoverWidth = 340,
  popoverHeight = 220,
  viewportWidth = 1024,
  viewportHeight = 768,
  gap = 14,
  margin = 12,
}) {
  if (!rect) {
    return {
      top: Math.max(margin, viewportHeight / 2 - popoverHeight / 2),
      left: Math.max(margin, viewportWidth / 2 - popoverWidth / 2),
      placement: "center",
    };
  }

  const fits = {
    bottom: rect.bottom + gap + popoverHeight <= viewportHeight - margin,
    top: rect.top - gap - popoverHeight >= margin,
    right: rect.right + gap + popoverWidth <= viewportWidth - margin,
    left: rect.left - gap - popoverWidth >= margin,
  };

  // Try the requested side, then its opposite, then whatever else fits.
  const opposite = { bottom: "top", top: "bottom", right: "left", left: "right" };
  const order = [placement, opposite[placement], "bottom", "top", "right", "left"].filter(Boolean);
  const chosen = order.find(side => fits[side]) ?? "center";

  if (chosen === "center") {
    return {
      top: Math.max(margin, viewportHeight / 2 - popoverHeight / 2),
      left: Math.max(margin, viewportWidth / 2 - popoverWidth / 2),
      placement: "center",
    };
  }

  let top;
  let left;

  if (chosen === "bottom") {
    top = rect.bottom + gap;
    left = rect.left + rect.width / 2 - popoverWidth / 2;
  } else if (chosen === "top") {
    top = rect.top - gap - popoverHeight;
    left = rect.left + rect.width / 2 - popoverWidth / 2;
  } else if (chosen === "right") {
    top = rect.top + rect.height / 2 - popoverHeight / 2;
    left = rect.right + gap;
  } else {
    top = rect.top + rect.height / 2 - popoverHeight / 2;
    left = rect.left - gap - popoverWidth;
  }

  return {
    top: Math.min(Math.max(top, margin), Math.max(margin, viewportHeight - popoverHeight - margin)),
    left: Math.min(Math.max(left, margin), Math.max(margin, viewportWidth - popoverWidth - margin)),
    placement: chosen,
  };
}
