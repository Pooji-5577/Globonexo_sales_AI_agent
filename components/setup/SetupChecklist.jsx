"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import Spinner from "../ui/Spinner";
import { useSetup } from "../../providers/SetupProvider";
import {
  canSkipStep,
  groupSteps,
  nextIncompleteStep,
  progressSummary,
  stepBadge,
  stepMeta,
} from "../../lib/setup-model";

function ProgressRing({ percent, size = 46 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;

  return (
    <svg width={size} height={size} className="setup-ring" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-2)" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--g-500)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function StepRow({ step, onSkip, onReset, onOpenCopilot }) {
  const router = useRouter();
  const meta = stepMeta(step.id);
  const badge = stepBadge(step);
  const [busy, setBusy] = useState(false);
  const done = step.status === "complete";
  const unavailable = step.status === "unavailable";

  const runSkip = async () => {
    setBusy(true);
    try {
      await onSkip(step.id);
    } finally {
      setBusy(false);
    }
  };

  const runReset = async () => {
    setBusy(true);
    try {
      await onReset(step.id);
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    if (step.id === "campaign") {
      onOpenCopilot();
      return;
    }
    router.push(meta.href);
  };

  return (
    <li className={`setup-step ${done ? "is-done" : ""} ${unavailable ? "is-unavailable" : ""} ${step.skipped ? "is-skipped" : ""}`}>
      <span className="setup-step-mark" aria-hidden="true">
        {done ? (
          <Icon name="check" size={14} color="#fff" stroke={3} />
        ) : (
          <Icon name={meta.icon} size={15} color={unavailable ? "var(--faint)" : "var(--g-700)"} />
        )}
      </span>

      <div className="setup-step-body">
        <div className="setup-step-head">
          <strong>{meta.title}</strong>
          <span className={`setup-badge setup-badge-${badge.tone}`}>{badge.label}</span>
        </div>
        <p className="setup-step-summary">{meta.summary}</p>
        <p className="setup-step-detail">{step.detail}</p>
        {!done && !unavailable ? <p className="setup-step-why">{meta.why}</p> : null}
      </div>

      <div className="setup-step-actions">
        {busy ? (
          <Spinner size={16} />
        ) : (
          <>
            {!done && !unavailable ? (
              <button type="button" className="btn btn-primary btn-sm setup-step-cta" onClick={open}>
                {meta.cta}
              </button>
            ) : null}
            {done ? (
              <button type="button" className="setup-step-link" onClick={open}>
                Review
              </button>
            ) : null}
            {canSkipStep(step) ? (
              <button type="button" className="setup-step-link" onClick={runSkip}>
                Skip for now
              </button>
            ) : null}
            {step.skipped ? (
              <button type="button" className="setup-step-link" onClick={runReset}>
                Undo skip
              </button>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

/**
 * `variant="compact"` is the dashboard card; `variant="full"` is the /setup page.
 * Both read the same organization-scoped state so progress cannot disagree
 * between the two surfaces.
 */
export default function SetupChecklist({ variant = "full" }) {
  const router = useRouter();
  const { loading, error, steps, refresh, skipStep, resetStep, openCopilot, startTour } = useSetup();

  if (loading) {
    return (
      <div className={`card setup-card setup-card-${variant}`} data-tour="setup-checklist">
        <div className="setup-loading">
          <Spinner size={20} />
          <span>Checking your setup…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card setup-card setup-card-${variant}`} data-tour="setup-checklist">
        <div className="setup-error">
          <Icon name="alertCircle" size={20} color="#c2410c" />
          <div>
            <strong>Setup status unavailable</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => refresh()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const summary = progressSummary(steps);
  const next = nextIncompleteStep(steps);
  const nextMeta = next ? stepMeta(next.id) : null;

  if (variant === "compact") {
    return (
      <div className="card setup-card setup-card-compact" data-tour="setup-checklist">
        <div className="setup-compact-head">
          <ProgressRing percent={summary.percent} />
          <div className="setup-compact-copy">
            <strong>{summary.allDone ? "Setup complete" : "Finish your setup"}</strong>
            <span>
              {summary.resolved} of {summary.total} steps done
            </span>
          </div>
        </div>

        {summary.allDone ? (
          <p className="setup-compact-next">
            Everything is configured. Your campaigns have what they need to run.
          </p>
        ) : (
          <p className="setup-compact-next">
            <span className="setup-compact-label">Next</span>
            {nextMeta?.title} — {nextMeta?.summary}
          </p>
        )}

        <div className="setup-compact-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => router.push("/setup")}>
            {summary.allDone ? "Review setup" : "Continue setup"}
            <Icon name="arrow" size={15} color="#06231a" />
          </button>
          <button type="button" className="setup-step-link" onClick={() => startTour({ restart: true })}>
            Replay tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-full" data-tour="setup-checklist">
      <div className="card setup-card setup-summary-card">
        <div className="setup-compact-head">
          <ProgressRing percent={summary.percent} size={58} />
          <div className="setup-compact-copy">
            <strong>{summary.percent}% complete</strong>
            <span>
              {summary.resolved} of {summary.total} steps done
              {summary.completed !== summary.resolved ? ` · ${summary.resolved - summary.completed} skipped` : ""}
            </span>
          </div>
        </div>
        <div className="setup-summary-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={openCopilot}>
            <Icon name="spark" size={15} color="#06231a" /> Open Setup Copilot
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => startTour({ restart: true })}>
            <Icon name="play" size={14} /> Replay tour
          </button>
        </div>
      </div>

      {groupSteps(steps).map(section => (
        <section key={section.group} className="setup-group">
          <h2 className="setup-group-title">{section.group}</h2>
          <ul className="setup-step-list">
            {section.steps.map(step => (
              <StepRow
                key={step.id}
                step={step}
                onSkip={skipStep}
                onReset={resetStep}
                onOpenCopilot={openCopilot}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
