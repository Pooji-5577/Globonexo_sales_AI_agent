"use client";
import React from "react";
import Link from "next/link";
import Icon from "../ui/Icon";
import {
  BILLING_PERIOD_OPTIONS,
  MAX_ANNUAL_SAVINGS_PERCENT,
  MOST_POPULAR_PLAN_ID,
  PLAN_CONFIG,
  marketingCeilingsFor,
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

// marketingCeilingsFor() lives in lib/plans.js — see that file for how these
// rounded numbers relate to the real, verified usage ceilings.
const limitsFor = (plan) => {
  const { emailsPerMonth, callsPerMonth } = marketingCeilingsFor(plan);
  return [
    { value: emailsPerMonth.toLocaleString(), label: "emails / month", prefix: "Up to" },
    { value: plan.emailCampaigns, label: `email campaign${plan.emailCampaigns === 1 ? "" : "s"}` },
    { value: plan.voiceCampaigns, label: `voice campaign${plan.voiceCampaigns === 1 ? "" : "s"}` },
    { value: callsPerMonth, label: "calls / month", prefix: "Up to" },
  ];
};

export default function PlanCards() {
  const [annual, setAnnual] = React.useState(false);

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
        {annual ? (
          <span className="plan-period-save is-active">Saving up to {MAX_ANNUAL_SAVINGS_PERCENT}%</span>
        ) : (
          <span className="plan-period-save">Save up to {MAX_ANNUAL_SAVINGS_PERCENT}% yearly</span>
        )}
      </div>

      <p className="plan-credit-def">
        One credit is one cent of reported provider cost — it&apos;s what funds enrichment, drafting, and calling.
      </p>

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
                    {l.prefix && <em className="plan-limit-prefix">{l.prefix}</em>}
                    <span className="plan-limit-row">
                      <b>{l.value}</b>
                      <span>{l.label}</span>
                    </span>
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
