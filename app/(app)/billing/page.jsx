"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import BillingPeriodToggle from "../../../components/billing/BillingPeriodToggle";
import PlanCard from "../../../components/billing/PlanCard";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import useBillingCheckout from "../../../hooks/useBillingCheckout";
import api from "../../../lib/api";
import { ACCESS_STATUSES as ACTIVE_STATUSES, MOST_POPULAR_PLAN_ID, PLAN_CONFIG } from "../../../lib/plans";

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
  const showSkeleton = useFirstLoad(loading);

  const loadBillingData = useCallback(async () => {
    const [usageRes, historyRes] = await Promise.allSettled([
      api.get('/billing/usage'),
      api.get('/billing/history'),
    ]);
    if (usageRes.status === 'fulfilled') setUsage(usageRes.value.data);
    if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data ?? []);
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4500);
  }, []);

  const { busy, setBusy, startCheckout } = useBillingCheckout({
    onToast: showToast,
    onRefresh: loadBillingData,
    onVerified: () => router.push('/onboarding'),
  });

  useEffect(() => {
    loadBillingData().finally(() => setLoading(false));
  }, [loadBillingData]);

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

  const handleCheckout = (planId) => {
    if (!canManageBilling) {
      showToast('Ask your organization billing manager to choose a plan.');
      return;
    }
    startCheckout(planId, selectedBillingPeriod);
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
        <BillingPeriodToggle annual={annual} onChange={setAnnual} />
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
            <PlanCard
              key={plan.id}
              plan={plan}
              annual={annual}
              isCurrent={isCurrent}
              showPopular={showPopular}
              actionLabel={actionLabel}
              actionDisabled={actionDisabled}
              ghostAction={sameSelection}
              onAction={handlePlanAction}
            />
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
