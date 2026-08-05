"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Icon from "../../../components/ui/Icon";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import api from "../../../lib/api";

// These display values mirror the backend's authoritative smallest-unit
// amounts. Razorpay still receives the configured Plan ID; the browser never
// decides the amount charged.
const PLAN_CONFIG = [
  { id: 'starter', name: 'Starter', monthly: 59, annualMonthly: 49, annualTotal: 588, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'], emailCap: 1500 },
  { id: 'growth', name: 'Growth', monthly: 179, annualMonthly: 149, annualTotal: 1788, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], emailCap: 6000, seats: 5 },
  { id: 'scale', name: 'Scale', monthly: 479, annualMonthly: 399, annualTotal: 4788, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'], emailCap: null, seats: 20 },
];

const ACTIVE_STATUSES = new Set(['active', 'past_due']);

const MOST_POPULAR_PLAN_ID = 'growth';

// Derived from PLAN_CONFIG so the toggle's claim can never drift from the
// prices actually shown on the cards.
const MAX_ANNUAL_SAVINGS_PERCENT = Math.round(
  Math.max(...PLAN_CONFIG.map((plan) => (1 - plan.annualMonthly / plan.monthly) * 100)),
);

// Display labels only. The values sent to the backend stay 'monthly'/'annual'.
const BILLING_PERIOD_OPTIONS = [
  { label: 'Monthly', isAnnual: false },
  { label: 'Yearly', isAnnual: true },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [annual, setAnnual] = useState(true);
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const showSkeleton = useFirstLoad(loading);

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

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4500);
  };

  const status = usage?.subscriptionStatus ?? 'payment_required';
  const subscription = usage?.subscription;
  const hasEntitlement = ACTIVE_STATUSES.has(status);
  const canManageBilling = usage?.canManageBilling !== false;
  const currentPlanId = usage?.plan ?? 'starter';
  const currentPlanConfig = PLAN_CONFIG.find((p) => p.id === currentPlanId) ?? PLAN_CONFIG[0];
  const selectedBillingPeriod = annual ? 'annual' : 'monthly';
  const requiredNotice = searchParams.get('required') === '1';
  const statusLabel = useMemo(() => ({
    active: 'Active',
    past_due: 'Payment retry in progress',
    restricted: 'Restricted',
    payment_required: 'Billing required',
    cancelled: 'Cancelled',
  }[status] ?? 'Billing required'), [status]);

  const handleCheckout = async (planId) => {
    if (!canManageBilling) {
      showToast('Ask your organization billing manager to choose a plan.');
      return;
    }
    if (typeof window.Razorpay === 'undefined') {
      showToast('Payment is loading. Please wait a moment and try again.');
      return;
    }

    setBusy(planId);
    try {
      const { data } = await api.post('/billing/checkout', { planId, billingPeriod: selectedBillingPeriod });
      const plan = PLAN_CONFIG.find((item) => item.id === planId);
      const razorpay = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Globonexo Sales AI',
        description: `${plan?.name ?? planId} · ${selectedBillingPeriod === 'annual' ? 'annual' : 'monthly'} subscription`,
        handler: async (response) => {
          try {
            const verification = await api.post('/billing/checkout/verify', response);
            if (verification.data.subscriptionStatus !== 'active') {
              showToast('Payment received. Razorpay is still confirming the subscription; refresh Billing shortly.');
              await loadBillingData();
              return;
            }
            showToast('Billing verified. Continue with onboarding.');
            await loadBillingData();
            router.push('/onboarding');
          } catch {
            showToast('Payment is still being confirmed. Refresh Billing shortly or contact Support.');
          } finally {
            setBusy("");
          }
        },
        modal: { ondismiss: () => setBusy("") },
        theme: { color: '#0f6e63' },
      });
      razorpay.on('payment.failed', () => {
        showToast('Payment failed. Please try again.');
        setBusy("");
      });
      razorpay.open();
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
      setBusy("");
    }
  };

  const handlePlanChange = async (planId) => {
    if (!canManageBilling) {
      showToast('Ask your organization billing manager to change the plan.');
      return;
    }
    setBusy(planId);
    try {
      const { data } = await api.patch('/billing/subscription', { planId, billingPeriod: selectedBillingPeriod });
      showToast(data.change === 'cycle_end'
        ? 'Downgrade scheduled for the end of the current billing period.'
        : 'Plan updated. Razorpay will apply the change immediately.');
      await loadBillingData();
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Could not change the plan.');
    } finally {
      setBusy("");
    }
  };

  const handlePlanAction = (planId) => {
    const samePlan = hasEntitlement && planId === currentPlanId && selectedBillingPeriod === subscription?.billingPeriod;
    if (samePlan) return;
    if (hasEntitlement && subscription?.providerStatus !== 'halted') {
      handlePlanChange(planId);
    } else {
      handleCheckout(planId);
    }
  };

  const handleCancel = async () => {
    if (!canManageBilling || subscription?.cancelAtCycleEnd) return;
    if (!window.confirm('Cancel future renewals at the end of the current paid period?')) return;
    setBusy('cancel');
    try {
      await api.post('/billing/cancel');
      showToast('Cancellation scheduled. Your access remains active through the paid period.');
      await loadBillingData();
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Could not schedule cancellation.');
    } finally {
      setBusy("");
    }
  };

  if (showSkeleton) return <RouteSkeleton />;

  return (
    <div className="scroll grow billing-page" style={{ minHeight: 0 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {toast && (
        <div role="status" style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 380, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className="row spread billing-head" style={{ marginBottom: 28, gap: 20, alignItems: 'flex-start' }}>
        <div>
          <h1 className="display" style={{ fontSize: 24 }}>Billing & plan</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 5 }}>
            {hasEntitlement ? <>You&apos;re on the <b style={{ color: 'var(--g-700)' }}>{currentPlanConfig.name} plan</b></> : 'Choose a paid plan to unlock your workspace.'}
            <span className="badge" style={{ marginLeft: 10, background: hasEntitlement ? 'var(--g-50)' : '#fff8e6', color: hasEntitlement ? 'var(--g-700)' : '#8a5a00' }}>{statusLabel}</span>
          </p>
        </div>
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
                onClick={() => setAnnual(option.isAnnual)}
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
      </div>

      {(requiredNotice || status === 'payment_required') && (
        <div className="card" role="alert" style={{ padding: 17, marginBottom: 20, background: '#fff8e6', border: '1px solid #ffe3a3' }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Please complete billing to continue.</div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 5 }}>Select a monthly or annual plan below. Razorpay will securely connect your payment method, and successful verification will take you through onboarding.</div>
        </div>
      )}
      {status === 'past_due' && (
        <div className="card" role="alert" style={{ padding: 17, marginBottom: 20, background: '#fff8e6', border: '1px solid #ffe3a3' }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Your renewal needs attention.</div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 5 }}>Access remains available during the seven-day billing grace period while Razorpay retries the payment. Contact Support if the payment does not complete.</div>
        </div>
      )}
      {status === 'restricted' && (
        <div className="card" role="alert" style={{ padding: 17, marginBottom: 20, background: '#fdecea', border: '1px solid #f5b8b0' }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Access is restricted until billing is restored.</div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 5 }}>Choose the plan you want below to start a new paid subscription. Your previous subscription will not be charged again by this action.</div>
        </div>
      )}
      {subscription?.cancelAtCycleEnd && (
        <div className="card" role="status" style={{ padding: 17, marginBottom: 20, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Cancellation scheduled.</div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 5 }}>Your plan remains available through {formatDate(subscription.currentPeriodEnd)} and will not renew after that date.</div>
        </div>
      )}

      <div className="card billing-usage-card" data-tour="billing-usage" style={{ padding: 24, marginBottom: 28 }}>
        <div className="row spread" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Current usage</div>
          {hasEntitlement && canManageBilling && !subscription?.cancelAtCycleEnd && (
            <button className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={busy === 'cancel'}>{busy === 'cancel' ? 'Scheduling…' : 'Cancel at period end'}</button>
          )}
        </div>
        <div className="billing-usage-grid">
          {[
            { k: 'Emails sent this month', v: usage?.emailsSentThisMonth ?? 0, max: currentPlanConfig.emailCap },
            { k: 'Seats used', v: usage?.seatsUsed ?? 0, max: currentPlanConfig.seats ?? 1 },
            { k: 'Active campaigns', v: usage?.activeCampaigns ?? 0, max: null },
          ].map((item) => (
            <div key={item.k}>
              <div className="row spread" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{item.k}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>{item.v}{item.max ? ` / ${item.max}` : ' / ∞'}</span>
              </div>
              <div style={{ height: 9, background: 'var(--bg-2)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: (item.max ? Math.min((item.v / item.max) * 100, 100) : 10) + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
              </div>
            </div>
          ))}
        </div>
        {!canManageBilling && <p className="muted" style={{ fontSize: 13, marginTop: 18 }}>Only the organization billing manager can start, change, or cancel a subscription.</p>}
      </div>

      <div className="billing-plan-grid" style={{ marginBottom: 28 }}>
        {PLAN_CONFIG.map((plan) => {
          const isCurrent = hasEntitlement && plan.id === currentPlanId;
          const price = annual ? plan.annualMonthly : plan.monthly;
          // The "Current plan" ribbon wins the top strip when both apply.
          const showPopular = plan.id === MOST_POPULAR_PLAN_ID && !isCurrent;
          const sameSelection = isCurrent && selectedBillingPeriod === subscription?.billingPeriod;
          const actionDisabled = !canManageBilling || sameSelection || busy === plan.id || (status === 'past_due' && isCurrent);
          const actionLabel = busy === plan.id
            ? 'Please wait…'
            : sameSelection
              ? 'Current plan'
              : !hasEntitlement
                ? 'Choose plan'
                : plan.id === currentPlanId
                  ? 'Change billing period'
                  : 'Change plan';
          return (
            <div key={plan.id} className="card billing-plan-card" style={{ padding: 32, paddingTop: showPopular ? 42 : 32, border: isCurrent ? '2px solid var(--g-400)' : showPopular ? '2px solid var(--ink)' : '1px solid var(--line)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {isCurrent && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--g-500)', color: '#06231a', fontSize: 11.5, fontWeight: 800, padding: '5px 14px', borderBottomLeftRadius: 10 }}>Current plan</div>}
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
              <button className={'btn btn-block ' + (sameSelection ? 'btn-ghost' : 'btn-primary')} style={{ fontSize: 15, height: 48 }} disabled={actionDisabled} onClick={() => handlePlanAction(plan.id)}>
                {actionLabel}
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: '6px 8px', fontWeight: 700 }}>Date</th><th style={{ padding: '6px 8px', fontWeight: 700 }}>Plan</th><th style={{ padding: '6px 8px', fontWeight: 700 }}>Period</th><th style={{ padding: '6px 8px', fontWeight: 700 }}>Amount</th><th style={{ padding: '6px 8px', fontWeight: 700 }}>Status</th>
              </tr></thead>
              <tbody>{history.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '8px' }}>{formatDate(item.created_at)}</td><td style={{ padding: '8px', textTransform: 'capitalize' }}>{item.plan_id}</td><td style={{ padding: '8px', textTransform: 'capitalize' }}>{item.billing_period}</td><td style={{ padding: '8px' }}>${(item.amount / 100).toFixed(2)} {item.currency}</td><td style={{ padding: '8px', textTransform: 'capitalize' }}>{item.status}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
