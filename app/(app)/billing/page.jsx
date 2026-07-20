"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import api from "../../../lib/api";

const PLAN_CONFIG = [
  { id: 'starter', name: 'Starter', priceAnnual: 49, priceMonthly: 59, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'], emailCap: 1500 },
  { id: 'growth', name: 'Growth', priceAnnual: 149, priceMonthly: 179, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], emailCap: 6000, seats: 5 },
  { id: 'scale', name: 'Scale', priceAnnual: 399, priceMonthly: 479, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'], emailCap: null, seats: 20 },
];

export default function BillingPage() {
  const [annual, setAnnual] = useState(true);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/billing/usage')
      .then(res => setUsage(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentPlanId = usage?.plan ?? 'starter';
  const currentPlanConfig = PLAN_CONFIG.find(p => p.id === currentPlanId) || PLAN_CONFIG[0];

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading billing…</p>
      </div>
    );
  }

  return (
    <div className="scroll grow billing-page" style={{ padding: '24px 32px', minHeight: 0 }}>
      <div className="row spread billing-head" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24 }}>Billing & plan</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>You&apos;re on the <b style={{ color: 'var(--g-700)' }}>{currentPlanConfig.name} plan</b></p>
        </div>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 28, borderRadius: 99, padding: 3, background: annual ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s' }}>
            <span style={{ display: 'block', width: 22, height: 22, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-xs)', transform: annual ? 'translateX(20px)' : 'none', transition: 'transform .2s' }} />
          </button>
          <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Annual <span className="badge" style={{ background: 'var(--g-50)', color: 'var(--g-700)' }}>Save 20%</span></span>
        </div>
      </div>

      <div className="card billing-usage-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Current usage</div>
        <div className="billing-usage-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[
            { k: 'Emails sent this month', v: usage?.emailsSentThisMonth ?? 0, max: currentPlanConfig.emailCap },
            { k: 'Seats used', v: usage?.seatsUsed ?? 0, max: currentPlanConfig.seats ?? 1 },
            { k: 'Active campaigns', v: usage?.activeCampaigns ?? 0, max: null },
          ].map(u => (
            <div key={u.k}>
              <div className="row spread" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{u.k}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>{u.v}{u.max ? ` / ${u.max}` : ' / ∞'}</span>
              </div>
              <div style={{ height: 9, background: 'var(--bg-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: (u.max ? (u.v / u.max) * 100 : 10) + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="billing-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {PLAN_CONFIG.map(p => {
          const isCurrent = p.id === currentPlanId;
          const price = annual ? p.priceAnnual : p.priceMonthly;
          return (
            <div key={p.id} className="card billing-plan-card" style={{ padding: 32, border: isCurrent ? '2px solid var(--g-400)' : '1px solid var(--line)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {isCurrent && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--g-500)', color: '#06231a', fontSize: 11.5, fontWeight: 800, padding: '5px 14px', borderBottomLeftRadius: 10 }}>Current plan</div>}
              <div className="display" style={{ fontSize: 26 }}>{p.name}</div>
              <div style={{ marginTop: 10 }}>
                <span className="display" style={{ fontSize: 48 }}>${price}</span>
                <span className="muted" style={{ fontSize: 14, marginLeft: 5 }}>/mo</span>
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: 8, marginBottom: 22 }}>{p.desc}</p>
              <div className="col" style={{ gap: 11, marginBottom: 24, flex: 1 }}>
                {p.feats.map(f => (
                  <div key={f} className="row" style={{ gap: 9, alignItems: 'flex-start' }}>
                    <Icon name="check" size={15} color="var(--g-500)" stroke={2.5} style={{ marginTop: 2, flex: 'none' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className={'btn btn-block ' + (isCurrent ? 'btn-ghost' : 'btn-primary')} style={{ fontSize: 15, height: 48 }}>
                {isCurrent ? 'Current plan' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
