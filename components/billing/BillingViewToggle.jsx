"use client";

import React from "react";

const VIEW_OPTIONS = [
  { id: "current", label: "Plan you're in" },
  { id: "explore", label: "Explore plans" },
];

export default function BillingViewToggle({ view, onChange }) {
  return (
    <div
      className="row billing-view-toggle"
      role="group"
      aria-label="Billing view"
      style={{ gap: 4, alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: 4 }}
    >
      {VIEW_OPTIONS.map((option) => {
        const selected = view === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
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
    </div>
  );
}
