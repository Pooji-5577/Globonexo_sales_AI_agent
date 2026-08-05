"use client";

import React from "react";
import Icon from "../ui/Icon";

export default function PlanCard({
  plan,
  annual,
  isCurrent = false,
  showPopular = false,
  actionLabel,
  actionDisabled = false,
  ghostAction = false,
  onAction,
}) {
  const price = annual ? plan.annualMonthly : plan.monthly;

  return (
    <div
      className="card billing-plan-card"
      style={{
        padding: 32,
        paddingTop: showPopular ? 42 : 32,
        border: isCurrent ? '2px solid var(--g-400)' : showPopular ? '2px solid var(--ink)' : '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isCurrent && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--g-500)', color: '#06231a', fontSize: 11.5, fontWeight: 800, padding: '5px 14px', borderBottomLeftRadius: 10 }}>
          Current plan
        </div>
      )}
      {showPopular && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', padding: '5px 18px', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
          MOST POPULAR
        </div>
      )}

      <div className="display" style={{ fontSize: 26 }}>{plan.name}</div>

      <div style={{ marginTop: 10 }}>
        {annual && (
          <span className="muted" style={{ fontSize: 24, fontWeight: 700, marginRight: 9, textDecoration: 'line-through' }}>${plan.monthly}</span>
        )}
        <span className="display" style={{ fontSize: 48 }}>${price}</span>
        <span className="muted" style={{ fontSize: 14, marginLeft: 5 }}>/mo</span>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
          {annual ? `Billed $${plan.annualTotal.toLocaleString()} annually` : 'Billed monthly'}
        </div>
      </div>

      <p className="muted" style={{ fontSize: 14, marginTop: 8, marginBottom: 22 }}>{plan.desc}</p>

      <div className="col" style={{ gap: 11, marginBottom: 24, flex: 1 }}>
        {plan.feats.map((feature) => (
          <div key={feature} className="row" style={{ gap: 9, alignItems: 'flex-start' }}>
            <Icon name="check" size={15} color="var(--g-500)" stroke={2.5} style={{ marginTop: 2, flex: 'none' }} />
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{feature}</span>
          </div>
        ))}
      </div>

      <button
        className={'btn btn-block ' + (ghostAction ? 'btn-ghost' : 'btn-primary')}
        style={{ fontSize: 15, height: 48 }}
        disabled={actionDisabled}
        onClick={() => onAction(plan.id)}
      >
        {actionLabel}
      </button>
    </div>
  );
}
