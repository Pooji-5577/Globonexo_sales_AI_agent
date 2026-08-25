"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import BillingPeriodToggle from "../../../components/billing/BillingPeriodToggle";
import BillingViewToggle from "../../../components/billing/BillingViewToggle";
import PlanCard from "../../../components/billing/PlanCard";
import Icon from "../../../components/ui/Icon";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import useBillingCheckout from "../../../hooks/useBillingCheckout";
import api from "../../../lib/api";
import { ACCESS_STATUSES as ACTIVE_STATUSES, MOST_POPULAR_PLAN_ID, PLAN_CONFIG } from "../../../lib/plans";

function formatDate(iso) {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format((Number(amount) || 0) / 100);
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [annual, setAnnual] = useState(true);
  const [activeView, setActiveView] = useState('current');
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [planChangeQuote, setPlanChangeQuote] = useState(null);
  const [planChangeSubmitting, setPlanChangeSubmitting] = useState(false);
  const showSkeleton = useFirstLoad(loading);
  const initializedView = useRef(false);

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
  const currentPlanRank = PLAN_CONFIG.findIndex((p) => p.id === currentPlanId);
  const currentPeriodActive = Boolean(subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getTime() > Date.now());
  const currentPlanPrice = subscription?.billingPeriod === 'annual' ? currentPlanConfig.annualMonthly : currentPlanConfig.monthly;
  const selectedBillingPeriod = annual ? 'annual' : 'monthly';
  const requiredNotice = searchParams.get('required') === '1';

  // Send users with no active plan straight to Explore, but only once.
  // afterwards let them freely switch back to "Plan you're in".
  useEffect(() => {
    if (!loading && !initializedView.current) {
      initializedView.current = true;
      if (!hasEntitlement) setActiveView('explore');
    }
  }, [loading, hasEntitlement]);
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
      const { data } = await api.post('/billing/subscription/change-quote', {
        planId,
        billingPeriod: selectedBillingPeriod,
        idempotencyKey: `billing-${planId}-${selectedBillingPeriod}-${Date.now()}`,
      });
      setPlanChangeQuote(data);
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Could not change the plan.');
    } finally {
      setBusy("");
    }
  };

  const closePlanChangeQuote = () => {
    if (!planChangeSubmitting) setPlanChangeQuote(null);
  };

  const confirmPlanChange = async () => {
    if (!planChangeQuote?.quoteId || planChangeSubmitting) return;
    setPlanChangeSubmitting(true);
    try {
      let { data } = await api.patch('/billing/subscription', { attemptId: planChangeQuote.quoteId });
      if (data.status === 'payment_pending' || data.status === 'submitted') {
        showToast('Payment is being processed. We will activate the plan after Razorpay confirms it.');
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
          const statusResponse = await api.get(`/billing/subscription/change/${planChangeQuote.quoteId}`);
          data = statusResponse.data;
          if (['paid', 'scheduled', 'failed', 'expired'].includes(data.status)) break;
        }
      }
      if (data.status === 'paid') {
        showToast('Payment confirmed. Your plan and credits have been updated.');
      } else if (data.status === 'scheduled') {
        showToast('Change scheduled for the end of the current billing period.');
      } else if (data.status === 'payment_pending' || data.status === 'submitted') {
        showToast('Payment is still being confirmed. Refresh shortly to see the result.');
      } else {
        showToast('The plan change could not be confirmed. Your current plan is unchanged.');
      }
      await loadBillingData();
      setPlanChangeQuote(null);
    } catch (err) {
      showToast(err?.response?.data?.error ?? 'Could not confirm the plan change.');
    } finally {
      setPlanChangeSubmitting(false);
    }
  };

  const handlePlanAction = (planId) => {
    const samePlan = hasEntitlement && planId === currentPlanId && selectedBillingPeriod === subscription?.billingPeriod;
    if (samePlan) return;
    const isDowngrade = hasEntitlement && PLAN_CONFIG.findIndex((plan) => plan.id === planId) < currentPlanRank;
    if (isDowngrade && currentPeriodActive) {
      showToast(`Downgrades are available after ${formatDate(subscription.currentPeriodEnd)}.`);
      return;
    }
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

      {planChangeQuote && (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePlanChangeQuote(); }} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(9, 17, 18, 0.62)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="plan-change-title" className="card" style={{ width: 'min(560px, 100%)', padding: 26, boxShadow: '0 20px 70px rgba(0,0,0,0.25)' }}>
            <div className="row spread" style={{ gap: 16, alignItems: 'flex-start' }}>
              <div>
                <h2 id="plan-change-title" className="display" style={{ fontSize: 22 }}>Confirm plan changes</h2>
                <p className="muted" style={{ fontSize: 13.5, marginTop: 5 }}>
                  {planChangeQuote.change === 'cycle_end' ? 'Your current plan stays active until the end of this billing period.' : 'Your new plan starts after Razorpay confirms the payment.'}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closePlanChangeQuote} disabled={planChangeSubmitting} aria-label="Close">×</button>
            </div>

            <div style={{ borderTop: '1px solid var(--line-2)', marginTop: 20, paddingTop: 18 }}>
              <div className="row spread" style={{ marginBottom: 14 }}>
                <span style={{ fontWeight: 700 }}>{planChangeQuote.current.planName} subscription</span>
                <strong>{formatMoney(planChangeQuote.current.amount, planChangeQuote.adjustment.currency)}</strong>
              </div>
              <div className="row spread muted" style={{ marginBottom: 18, fontSize: 13.5 }}>
                <span>New plan billed {planChangeQuote.requested.billingPeriod}</span>
                <span>{formatMoney(planChangeQuote.requested.amount, planChangeQuote.adjustment.currency)}</span>
              </div>
              {planChangeQuote.change === 'immediate' && (
                <>
                  <div className="row spread" style={{ marginBottom: 10 }}><span>Unused {planChangeQuote.current.planName} credit</span><span style={{ color: 'var(--g-700)' }}>−{formatMoney(planChangeQuote.adjustment.unusedCurrentCredit, planChangeQuote.adjustment.currency)}</span></div>
                  <div className="row spread" style={{ marginBottom: 10 }}><span>Subtotal</span><span>{formatMoney(planChangeQuote.adjustment.subtotal, planChangeQuote.adjustment.currency)}</span></div>
                  <div className="row spread muted" style={{ marginBottom: 16 }}><span>Tax ({planChangeQuote.adjustment.taxRatePercent}%)</span><span>{formatMoney(planChangeQuote.adjustment.tax, planChangeQuote.adjustment.currency)}</span></div>
                  <div className="row spread" style={{ borderTop: '1px solid var(--line-2)', paddingTop: 14, fontSize: 16, fontWeight: 800 }}><span>Total due today</span><span>{formatMoney(planChangeQuote.adjustment.total, planChangeQuote.adjustment.currency)}</span></div>
                </>
              )}
              {planChangeQuote.change === 'cycle_end' && (
                <div className="card" style={{ padding: 13, marginTop: 12, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>No payment due today</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>The change takes effect after {formatDate(planChangeQuote.currentPeriodEnd)}. Your current credits remain unchanged until then.</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, fontSize: 13.5 }}>
              <span className="muted">Payment method </span>
              <strong>{planChangeQuote.paymentMethod ?? 'Saved Razorpay payment method'}</strong>
            </div>
            <div className="muted" style={{ marginTop: 8, fontSize: 12.5 }}>Next renewal: {formatDate(planChangeQuote.currentPeriodEnd)} at {formatMoney(planChangeQuote.requested.amount, planChangeQuote.adjustment.currency)} per {planChangeQuote.requested.billingPeriod === 'annual' ? 'year' : 'month'}.</div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={closePlanChangeQuote} disabled={planChangeSubmitting}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmPlanChange} disabled={planChangeSubmitting}>
                {planChangeSubmitting ? 'Processing…' : planChangeQuote.change === 'cycle_end' ? 'Schedule change' : 'Pay now'}
              </button>
            </div>
          </div>
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
        <BillingViewToggle view={activeView} onChange={setActiveView} />
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

      {activeView === 'current' ? (
        <>
          <div className="billing-current-stack">
            {hasEntitlement ? (
              <div className="card billing-current-plan-card" style={{ padding: 24 }}>
                <div className="billing-current-plan-head">
                  <div>
                    <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                      <div className="display" style={{ fontSize: 22 }}>{currentPlanConfig.name}</div>
                      <span className="badge" style={{ background: hasEntitlement ? 'var(--g-50)' : '#fff8e6', color: hasEntitlement ? 'var(--g-700)' : '#8a5a00' }}>{statusLabel}</span>
                    </div>
                    <p className="muted" style={{ fontSize: 13.5, marginTop: 5 }}>{currentPlanConfig.desc}</p>
                  </div>
                  <div>
                    <span className="display" style={{ fontSize: 32 }}>${currentPlanPrice}</span>
                    <span className="muted" style={{ fontSize: 13, marginLeft: 4 }}>/mo</span>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2, textTransform: 'capitalize' }}>{subscription?.billingPeriod ?? 'monthly'} billing</div>
                  </div>
                </div>

                <div className="billing-current-features">
                  {currentPlanConfig.feats.map((feature) => (
                    <div key={feature} className="row" style={{ gap: 7, alignItems: 'center' }}>
                      <Icon name="check" size={14} color="var(--g-500)" stroke={2.5} />
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="billing-current-actions">
                  <p className="muted" style={{ fontSize: 13 }}>
                    {subscription?.cancelAtCycleEnd
                      ? <>Access ends {formatDate(subscription.currentPeriodEnd)}</>
                      : subscription?.currentPeriodEnd
                        ? <>Renews {formatDate(subscription.currentPeriodEnd)}</>
                        : null}
                  </p>
                  <div className="row" style={{ gap: 10 }}>
                    {canManageBilling && !subscription?.cancelAtCycleEnd && (
                      <button className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={busy === 'cancel'}>{busy === 'cancel' ? 'Scheduling…' : 'Cancel at period end'}</button>
                    )}
                    <button className="btn btn-dark btn-sm" onClick={() => setActiveView('explore')}>Change plan</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                <p className="muted" style={{ fontSize: 14 }}>You don&apos;t have an active plan yet.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setActiveView('explore')}>Explore plans</button>
              </div>
            )}

            <div className="card billing-usage-card" data-tour="billing-usage" style={{ padding: 24 }}>
              <div className="row spread" style={{ marginBottom: 18, gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Credit balance</div>
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>One credit equals one cent of reported provider cost.</p>
                </div>
                <strong style={{ color: usage?.credits?.remainingCredits > 0 ? 'var(--g-700)' : '#b42318', fontSize: 22 }}>
                  {(usage?.credits?.remainingCredits ?? 0).toLocaleString()}
                </strong>
              </div>
              {(usage?.meteringStatus === 'unavailable' || (usage?.credits?.remainingCredits ?? 0) <= 0) && (
                <div role="alert" style={{ padding: 12, marginBottom: 18, borderRadius: 10, background: '#fff4ed', border: '1px solid #f7c9ad', color: '#8a2d12', fontSize: 13 }}>
                  {usage?.meteringStatus === 'unavailable'
                    ? 'Credit metering is not available yet. New AI, enrichment, and voice actions are paused until the billing ledger is ready.'
                    : 'Your credit balance is empty. New AI, enrichment, and voice actions are paused; work already in flight can still finish.'}
                </div>
              )}
              <div className="billing-usage-grid">
                {[
                  { k: 'Credits used', v: usage?.credits?.usedCredits ?? 0, max: usage?.credits?.totalCredits ?? currentPlanConfig.monthlyCredits },
                  { k: 'Credits reserved', v: usage?.credits?.reservedCredits ?? 0, max: usage?.credits?.totalCredits ?? currentPlanConfig.monthlyCredits },
                  { k: 'Email campaigns', v: usage?.campaignUsage?.email?.used ?? 0, max: usage?.campaignUsage?.email?.limit ?? currentPlanConfig.emailCampaigns },
                  { k: 'Voice campaigns', v: usage?.campaignUsage?.voice?.used ?? 0, max: usage?.campaignUsage?.voice?.limit ?? currentPlanConfig.voiceCampaigns },
                ].map((item) => (
                  <div key={item.k}>
                    <div className="row spread" style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{item.k}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>{item.v}{item.max ? ` / ${item.max.toLocaleString()}` : ' / ∞'}</span>
                    </div>
                    <div style={{ height: 9, background: 'var(--bg-2)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: (item.max ? Math.min((item.v / item.max) * 100, 100) : 10) + '%', borderRadius: 99, background: item.k === 'Credits reserved' ? 'var(--teal)' : 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="billing-usage-summary">
                <div>
                  <span className="muted">Included credits</span>
                  <strong>{(usage?.credits?.includedCredits ?? currentPlanConfig.monthlyCredits).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="muted">Top-up credits</span>
                  <strong>{(usage?.credits?.topUpCredits ?? 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="muted">Campaign ceiling</span>
                  <strong>{currentPlanConfig.emailCampaigns} email · {currentPlanConfig.voiceCampaigns} voice</strong>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.55, marginTop: 18 }}>
                Usage resets at the start of each billing month. Credits are settled from the cost the provider reports after the action completes.
              </p>
              {!canManageBilling && <p className="muted" style={{ fontSize: 13, marginTop: 18 }}>Only the organization billing manager can start, change, or cancel a subscription.</p>}
            </div>
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
        </>
      ) : (
        <>
          <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 20 }}>
            <BillingPeriodToggle annual={annual} onChange={setAnnual} />
          </div>

          <div className="billing-plan-grid">
            {PLAN_CONFIG.map((plan) => {
              const isCurrent = hasEntitlement && plan.id === currentPlanId;
              // The "Current plan" ribbon wins the top strip when both apply.
              const showPopular = plan.id === MOST_POPULAR_PLAN_ID && !isCurrent;
              const sameSelection = isCurrent && selectedBillingPeriod === subscription?.billingPeriod;
              const downgradeBlocked = hasEntitlement
                && PLAN_CONFIG.findIndex((candidate) => candidate.id === plan.id) < currentPlanRank
                && currentPeriodActive;
              const actionDisabled = !canManageBilling || sameSelection || downgradeBlocked || busy === plan.id || (status === 'past_due' && isCurrent);
              const actionLabel = busy === plan.id
                ? 'Please wait…'
                : sameSelection
                  ? 'Current plan'
                  : downgradeBlocked
                    ? 'After period ends'
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
        </>
      )}
    </div>
  );
}
