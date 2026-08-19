"use client";
import React from "react";
import Link from "next/link";
import Icon from "../ui/Icon";
import {
  BILLING_PERIOD_OPTIONS,
  MAX_ANNUAL_SAVINGS_PERCENT,
  MOST_POPULAR_PLAN_ID,
  PLAN_CONFIG,
} from "../../lib/plans";

// Every plan ships the same capability set by design — only volume changes.
// So the cards carry the numbers (which differ) and the shared capability list
// is stated once, below the grid, instead of three identical times inside it.
export const SHARED_CAPABILITIES = [
  "AI email sequences",
  "Lead enrichment from verified data providers",
  "AI voice calling",
  "Human-approved replies before send",
  "Suppression and do-not-call handling",
];

const limitsFor = (plan) => [
  { value: plan.monthlyCredits.toLocaleString(), label: "credits / month" },
  { value: plan.emailCampaigns, label: `email campaign${plan.emailCampaigns === 1 ? "" : "s"}` },
  { value: plan.voiceCampaigns, label: `voice campaign${plan.voiceCampaigns === 1 ? "" : "s"}` },
  { value: plan.dailyEmailCap, label: "emails / day" },
];

// `compact` is the landing-page form: no billing toggle, limits collapsed to a
// single line, no capability band. The full apparatus belongs on /pricing.
export default function PlanCards({ compact = false }) {
  const [annual, setAnnual] = React.useState(false);

  if (compact) {
    return (
      <div className="plan-grid is-compact" aria-label="Pricing plans">
        {PLAN_CONFIG.map((plan) => {
          const featured = plan.id === MOST_POPULAR_PLAN_ID;
          return (
            <article key={plan.id} className={`plan-card${featured ? " is-featured" : ""}`}>
              {featured && <span className="plan-badge">Most popular</span>}
              <span className="plan-name">{plan.name}</span>
              <div className="plan-price">
                <strong>${plan.monthly}</strong>
                <span>/mo</span>
              </div>
              <p className="plan-annual">or ${plan.annualMonthly}/mo billed yearly</p>
              <p className="plan-terse">
                {plan.monthlyCredits.toLocaleString()} credits · {plan.emailCampaigns} email ·{" "}
                {plan.voiceCampaigns} voice campaign{plan.voiceCampaigns === 1 ? "" : "s"}
              </p>
              <Link className="plan-cta" href="/signup">
                Start {plan.name} <Icon name="arrow" size={16} color="currentColor" />
              </Link>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="plan-period" role="group" aria-label="Billing period">
        <div className="plan-period-switch">
          {BILLING_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={annual === option.isAnnual}
              className={annual === option.isAnnual ? "is-on" : ""}
              onClick={() => setAnnual(option.isAnnual)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="plan-period-save">Save up to {MAX_ANNUAL_SAVINGS_PERCENT}%</span>
      </div>

      <div className="plan-grid" aria-label="Pricing plans">
        {PLAN_CONFIG.map((plan) => {
          const featured = plan.id === MOST_POPULAR_PLAN_ID;
          return (
            <article key={plan.id} className={`plan-card${featured ? " is-featured" : ""}`}>
              {featured && <span className="plan-badge">Most popular</span>}

              <span className="plan-name">{plan.name}</span>
              <div className="plan-price">
                {annual && <s>${plan.monthly}</s>}
                <strong>${annual ? plan.annualMonthly : plan.monthly}</strong>
                <span>/mo</span>
              </div>
              <p className="plan-annual">
                {annual ? `Billed $${plan.annualTotal.toLocaleString()} annually` : "Billed monthly"}
              </p>
              <p className="plan-desc">{plan.desc}</p>

              <ul className="plan-limits">
                {limitsFor(plan).map((l) => (
                  <li key={l.label}>
                    <b>{l.value}</b>
                    <span>{l.label}</span>
                  </li>
                ))}
              </ul>

              <Link className="plan-cta" href="/signup">
                Start {plan.name} <Icon name="arrow" size={16} color="currentColor" />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="plan-included">
        <strong>In every plan, at every price</strong>
        <ul>
          {SHARED_CAPABILITIES.map((c) => (
            <li key={c}><Icon name="check" size={15} color="var(--g-800)" stroke={2.6} />{c}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
