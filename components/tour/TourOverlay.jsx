"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import Spinner from "../ui/Spinner";
import api from "../../lib/api";
import { TOUR_STEPS } from "../../lib/tour-steps";
import {
  advance,
  computePopoverPosition,
  isFirstStep,
  isLastStep,
  isStepUnlocked,
  keyIntent,
  pickVisibleTarget,
  progressLabel,
  resolveStepRoute,
  retreat,
  stepAt,
} from "../../lib/tour-machine";
import { useSetup } from "../../providers/SetupProvider";

const POPOVER_WIDTH = 348;
const SPOTLIGHT_PADDING = 8;

/** Asks AppShell to open the mobile nav drawer so nav-anchored steps have a target. */
function requestMobileNav(open) {
  window.dispatchEvent(new CustomEvent("gnx:tour:nav", { detail: { open } }));
}

/** True while focus sits in something the customer could be typing into. */
function isEditingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export default function TourOverlay() {
  const { tourOpen, tourIndex, goToTourStep, finishTour, steps: setupSteps, skipStep, refresh } = useSetup();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "center" });
  const [mounted, setMounted] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [onboardingCampaignId, setOnboardingCampaignId] = useState(null);
  const popoverRef = useRef(null);

  const step = stepAt(TOUR_STEPS, tourIndex);
  const needsNav = Boolean(step?.target?.startsWith('[data-tour="nav-'));
  const effectiveRoute = resolveStepRoute(step, { onboardingCampaignId });
  const onStepRoute = !effectiveRoute || pathname === effectiveRoute;
  const unlocked = isStepUnlocked(step, setupSteps);

  useEffect(() => setMounted(true), []);

  // A step that opens the campaign onboarding built needs that campaign's id
  // first. Fetched lazily — most steps never need it — and re-checked each
  // time such a step is reached, since it may not exist yet on an earlier visit.
  useEffect(() => {
    if (!tourOpen || step?.dynamicRoute !== "onboardingCampaign" || onboardingCampaignId) return undefined;
    let cancelled = false;
    api
      .get("/onboarding/preparation/current")
      .then(({ data }) => {
        if (!cancelled && data?.campaignId) setOnboardingCampaignId(data.campaignId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tourOpen, step, onboardingCampaignId]);

  // Take the customer to the page this step is about before explaining it.
  useEffect(() => {
    if (!tourOpen || !effectiveRoute) return;
    if (pathname === effectiveRoute) {
      setNavigating(false);
      return;
    }
    setNavigating(true);
    setRect(null);
    router.push(effectiveRoute);
  }, [tourOpen, effectiveRoute, pathname, router]);

  // Locate the anchor once we're on the right page. Targets render late while
  // a page fetches (most show a skeleton first), so this retries for a few
  // seconds before giving up and letting the step render as a centred card.
  useEffect(() => {
    if (!tourOpen || !step) return undefined;

    if (!step.target || !onStepRoute) {
      setRect(null);
      return undefined;
    }

    const isNarrow = window.innerWidth <= 900;
    if (needsNav && isNarrow) requestMobileNav(true);

    let attempts = 0;
    let frame = 0;
    let settle = 0;

    const locate = () => {
      const element = pickVisibleTarget(document.querySelectorAll(step.target));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        // Read the rect after the scroll settles rather than mid-animation.
        settle = window.setTimeout(() => setRect(element.getBoundingClientRect()), 300);
        return;
      }
      attempts += 1;
      // ~6s of retries covers a page that has to fetch before it renders.
      if (attempts < 40) frame = window.setTimeout(locate, 150);
      else setRect(null);
    };

    locate();

    return () => {
      window.clearTimeout(frame);
      window.clearTimeout(settle);
      if (needsNav && isNarrow) requestMobileNav(false);
    };
  }, [tourOpen, step, needsNav, onStepRoute]);

  // Keep the spotlight glued to its element while the page scrolls or resizes.
  useEffect(() => {
    if (!tourOpen || !step?.target || !onStepRoute) return undefined;

    const reposition = () => {
      const element = pickVisibleTarget(document.querySelectorAll(step.target));
      setRect(element ? element.getBoundingClientRect() : null);
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [tourOpen, step, onStepRoute]);

  useLayoutEffect(() => {
    if (!tourOpen) return;
    const height = popoverRef.current?.offsetHeight ?? 240;
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 24);
    setPosition(
      computePopoverPosition({
        rect,
        placement: window.innerWidth <= 720 ? "bottom" : step?.placement ?? "bottom",
        popoverWidth: width,
        popoverHeight: height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }),
    );
  }, [rect, step, tourOpen]);

  const handleNext = useCallback(() => {
    if (!unlocked) return;
    const intent = advance(tourIndex, TOUR_STEPS);
    if (intent.action === "finish") finishTour("completed");
    else goToTourStep(intent.index);
  }, [tourIndex, finishTour, goToTourStep, unlocked]);

  const handleBack = useCallback(() => {
    const intent = retreat(tourIndex, TOUR_STEPS);
    if (intent.action === "move") goToTourStep(intent.index);
  }, [tourIndex, goToTourStep]);

  const handleSkip = useCallback(() => finishTour("skipped"), [finishTour]);

  // Lets the customer defer an optional step (calendar availability today)
  // rather than forcing it now — mirrors "Skip for now" on the Setup Checklist.
  const handleSkipStep = useCallback(async () => {
    if (!step?.requiresStepId || skipping) return;
    setSkipping(true);
    try {
      await skipStep(step.requiresStepId);
      const intent = advance(tourIndex, TOUR_STEPS);
      if (intent.action === "finish") finishTour("completed");
      else goToTourStep(intent.index);
    } finally {
      setSkipping(false);
    }
  }, [step, skipping, skipStep, tourIndex, finishTour, goToTourStep]);

  // While a gated step is locked, poll the real setup status so Next unlocks
  // itself the moment the customer finishes the action — no manual refresh.
  useEffect(() => {
    if (!tourOpen || !step?.requiresStepId || unlocked) return undefined;
    const timer = window.setInterval(() => refresh({ silent: true }), 3000);
    return () => window.clearInterval(timer);
  }, [tourOpen, step, unlocked, refresh]);

  // Forgetting this campaign id across tour sessions means a later step
  // re-resolves it fresh rather than trusting a possibly stale value.
  useEffect(() => {
    if (!tourOpen) setOnboardingCampaignId(null);
  }, [tourOpen]);

  useEffect(() => {
    if (!tourOpen) return undefined;
    const onKeyDown = event => {
      const intent = keyIntent(event.key);
      if (!intent) return;
      // Someone typing an app password shouldn't have Enter or the arrow keys
      // hijacked into tour navigation — only Escape still works while editing.
      if (intent !== "skip" && isEditingTarget(event.target)) return;
      event.preventDefault();
      if (intent === "next") handleNext();
      else if (intent === "prev") handleBack();
      else handleSkip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourOpen, handleNext, handleBack, handleSkip]);

  if (!mounted || !tourOpen || !step) return null;

  const first = isFirstStep(tourIndex);
  const last = isLastStep(tourIndex, TOUR_STEPS);

  return createPortal(
    <div className="tour-root" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Dim from the scrim only when no anchor is cut out, so the two dimming
          layers can never stack over the highlighted element. */}
      <div className={`tour-scrim ${rect ? "" : "is-dimmed"}`} onClick={handleSkip} aria-hidden="true" />

      {rect ? (
        <div
          className="tour-spotlight"
          aria-hidden="true"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      ) : null}

      <div
        ref={popoverRef}
        className={`tour-popover tour-popover-${position.placement}`}
        style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
      >
        <div className="tour-popover-head">
          <span className="tour-progress">{progressLabel(tourIndex, TOUR_STEPS)}</span>
          <button type="button" className="tour-close" onClick={handleSkip} aria-label="Close tour">
            <Icon name="close" size={16} />
          </button>
        </div>

        <h2 id="tour-title" className="tour-title">{step.title}</h2>
        {navigating && !onStepRoute ? (
          <p className="tour-navigating">Opening {effectiveRoute}…</p>
        ) : null}
        <p className="tour-body">{step.body}</p>
        {step.footnote ? <p className="tour-footnote">{step.footnote}</p> : null}
        {step.requiresStepId && !unlocked ? (
          <p className="tour-locked">
            <Icon name="clock" size={13} /> Waiting for this to be done — I'll unlock automatically.
          </p>
        ) : null}

        <div className="tour-dots" aria-hidden="true">
          {TOUR_STEPS.map((item, index) => (
            <span key={item.id} className={`tour-dot ${index === tourIndex ? "is-active" : ""} ${index < tourIndex ? "is-done" : ""}`} />
          ))}
        </div>

        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={handleSkip}>
            {last ? "Close" : "Skip tour"}
          </button>
          <div className="tour-actions-right">
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleBack} disabled={first}>
              Back
            </button>
            {step.skippable && !unlocked ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleSkipStep} disabled={skipping}>
                {skipping ? <Spinner size={14} /> : "Skip for now"}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNext}
              disabled={!unlocked}
              title={!unlocked ? "Finish this step to continue" : undefined}
            >
              {last ? "Finish" : "Next"}
              {last ? null : <Icon name="arrow" size={15} color="#06231a" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
