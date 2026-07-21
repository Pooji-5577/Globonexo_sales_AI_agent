"use client";
import React, { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import Icon from "../../../components/ui/Icon";
import api from "../../../lib/api";

const PLAN_CONFIG = [
  { id: 'starter', name: 'Starter', priceAnnual: 49, priceMonthly: 59, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'], emailCap: 1500 },
  { id: 'growth', name: 'Growth', priceAnnual: 149, priceMonthly: 179, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], emailCap: 6000, seats: 5 },
  { id: 'scale', name: 'Scale', priceAnnual: 399, priceMonthly: 479, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'], emailCap: null, seats: 20 },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BillingPage() {
  const [annual, setAnnual] = useState(true);
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [upgrading, setUpgrading] = useState("");

  const loadBillingData = useCallback(async () => {
    const [usageRes, historyRes] = await Promise.allSettled([
      api.get('/billing/usage'),
      api.get('/billing/history'),
    ]);
    if (usageRes.status === 'fulfilled') setUsage(usageRes.value.data);
    if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data ?? []);
  }, []);

  useEffect(() => {
    loadBillingData().finally(() => setLoading(false));
  }, [loadBillingData]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const handleUpgrade = async (planId) => {
    if (typeof window.Razorpay === 'undefined') {
      showToast('Payment isn’t ready yet — please wait a moment and try again.');
      return;
    }

    setUpgrading(planId);
    try {
      const { data } = await api.post('/billing/checkout', { planId, billingPeriod: annual ? 'annual' : 'monthly' });

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Globonexo Sales AI',
        handler: async (response) => {
          try {
            await api.post('/billing/checkout/verify', response);
            showToast('Payment successful! Your plan has been updated.');
            await loadBillingData();
          } catch {
            showToast('Payment received but verification failed — contact support.');
          } finally {
            setUpgrading("");
          }
        },
        modal: { ondismiss: () => setUpgrading("") },
        theme: { color: '#0f6e63' },
      });
      razorpay.on('payment.failed', () => {
        showToast('Payment failed. Please try again.');
        setUpgrading("");
      });
      razorpay.open();
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
      setUpgrading("");
    }
  };

  const currentPlanId = usage?.plan ?? 'starter';
  const currentPlanConfig = PLAN_CONFIG.find(p => p.id === currentPlanId) || PLAN_CONFIG[0];
  const pastDue = usage?.subscriptionStatus === 'past_due';
  const restricted = usage?.subscriptionStatus === 'restricted';

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading billing…</p>
      </div>
    );
  }

  return (
    <div className="scroll grow" style={{ padding: '24px 32px', minHeight: 0 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}
      <div className="row spread" style={{ marginBottom: 28 }}>
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

      {(pastDue || restricted) && (
        <div className="card" style={{ padding: 16, marginBottom: 20, background: restricted ? 'var(--r-50, #fdecea)' : 'var(--y-50, #fff8e6)', border: '1px solid ' + (restricted ? 'var(--r-200, #f5b8b0)' : 'var(--y-200, #ffe3a3)') }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {restricted
              ? 'Access is restricted because your billing period has lapsed. Renew below to restore full access.'
              : 'Your billing period has ended and payment is overdue. Renew soon to avoid your account being restricted.'}
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Current usage</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
        {PLAN_CONFIG.map(p => {
          const isCurrent = p.id === currentPlanId;
          const price = annual ? p.priceAnnual : p.priceMonthly;
          return (
            <div key={p.id} className="card" style={{ padding: 32, border: isCurrent ? '2px solid var(--g-400)' : '1px solid var(--line)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
              <button
                className={'btn btn-block ' + (isCurrent && !pastDue && !restricted ? 'btn-ghost' : 'btn-primary')}
                style={{ fontSize: 15, height: 48 }}
                disabled={(isCurrent && !pastDue && !restricted) || upgrading === p.id}
                onClick={() => handleUpgrade(p.id)}
              >
                {upgrading === p.id ? 'Please wait…' : isCurrent ? (pastDue || restricted ? 'Renew' : 'Current plan') : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Billing history</div>
        {history.length === 0 ? (
          <p className="muted" style={{ fontSize: 14 }}>No charges yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Plan</th>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Period</th>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '8px' }}>{formatDate(h.created_at)}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{h.plan_id}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{h.billing_period}</td>
                  <td style={{ padding: '8px' }}>${(h.amount / 100).toFixed(2)} {h.currency}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{h.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
