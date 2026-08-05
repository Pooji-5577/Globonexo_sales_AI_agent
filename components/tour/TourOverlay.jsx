"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import { TOUR_STEPS } from "../../lib/tour-steps";
import {
  advance,
  computePopoverPosition,
  isFirstStep,
  isLastStep,
  keyIntent,
  pickVisibleTarget,
  progressLabel,
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

export default function TourOverlay() {
  const { tourOpen, tourIndex, goToTourStep, finishTour } = useSetup();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "center" });
  const [mounted, setMounted] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const popoverRef = useRef(null);

  const step = stepAt(TOUR_STEPS, tourIndex);
  const needsNav = Boolean(step?.target?.startsWith('[data-tour="nav-'));
  const onStepRoute = !step?.route || pathname === step.route;

  useEffect(() => setMounted(true), []);

  // Take the customer to the page this step is about before explaining it.
  useEffect(() => {
    if (!tourOpen || !step?.route) return;
    if (pathname === step.route) {
      setNavigating(false);
      return;
    }
    setNavigating(true);
    setRect(null);
    router.push(step.route);
  }, [tourOpen, step, pathname, router]);

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
    const intent = advance(tourIndex, TOUR_STEPS);
    if (intent.action === "finish") finishTour("completed");
    else goToTourStep(intent.index);
  }, [tourIndex, finishTour, goToTourStep]);

  const handleBack = useCallback(() => {
    const intent = retreat(tourIndex, TOUR_STEPS);
    if (intent.action === "move") goToTourStep(intent.index);
  }, [tourIndex, goToTourStep]);

  const handleSkip = useCallback(() => finishTour("skipped"), [finishTour]);

  useEffect(() => {
    if (!tourOpen) return undefined;
    const onKeyDown = event => {
      const intent = keyIntent(event.key);
      if (!intent) return;
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
          <p className="tour-navigating">Opening {step.route}…</p>
        ) : null}
        <p className="tour-body">{step.body}</p>
        {step.footnote ? <p className="tour-footnote">{step.footnote}</p> : null}

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
            <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
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
