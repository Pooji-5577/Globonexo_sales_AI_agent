"use client";

import React from "react";
import { BILLING_PERIOD_OPTIONS, MAX_ANNUAL_SAVINGS_PERCENT } from "../../lib/plans";

export default function BillingPeriodToggle({ annual, onChange }) {
  return (
    <div
      className="row billing-period-toggle"
      role="group"
      aria-label="Billing period"
      style={{ gap: 4, alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: 4 }}
    >
      {BILLING_PERIOD_OPTIONS.map((option) => {
        const selected = annual === option.isAnnual;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.isAnnual)}
            style={{
              padding: '9px 22px',
              borderRadius: 'var(--r-pill)',
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: selected ? 'var(--ink)' : 'transparent',
              color: selected ? '#fff' : 'var(--muted)',
              boxShadow: selected ? 'var(--sh-xs)' : 'none',
              transition: 'background .2s, color .2s',
            }}
          >
            {option.label}
          </button>
        );
      })}
      <span className="badge" style={{ background: 'var(--g-50)', color: 'var(--g-700)', fontWeight: 800, margin: '0 8px 0 4px', whiteSpace: 'nowrap' }}>
        Save up to {MAX_ANNUAL_SAVINGS_PERCENT}%
      </span>
    </div>
  );
}
