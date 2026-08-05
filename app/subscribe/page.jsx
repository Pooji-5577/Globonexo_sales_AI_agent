"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Logo from "../../components/ui/Logo";
import Aurora from "../../components/ui/Aurora";
import BillingPeriodToggle from "../../components/billing/BillingPeriodToggle";
import PlanCard from "../../components/billing/PlanCard";
import useBillingCheckout from "../../hooks/useBillingCheckout";
import api from "../../lib/api";
import { ACCESS_STATUSES, MOST_POPULAR_PLAN_ID, PLAN_CONFIG } from "../../lib/plans";

// Standalone, full-page checkout for accounts that have never paid. Deliberately
// outside the (app) route group: no sidebar and no workspace chrome, because
// none of it is reachable until billing completes. Subscribers manage their
// plan from /billing inside the dashboard instead.
export default function SubscribePage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [checking, setChecking] = useState(true);
  const [canManageBilling, setCanManageBilling] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4500);
  }, []);

  const { busy, startCheckout } = useBillingCheckout({
    onToast: showToast,
    onVerified: () => router.replace('/onboarding'),
  });

  // Anyone who already has entitlement belongs on the managed billing page.
  useEffect(() => {
    let cancelled = false;
    api.get('/billing/usage')
      .then(({ data }) => {
        if (cancelled) return;
        if (ACCESS_STATUSES.has(data.subscriptionStatus)) {
          router.replace('/billing');
          return;
        }
        setCanManageBilling(data.canManageBilling !== false);
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) router.replace('/login');
      });
    return () => { cancelled = true; };
  }, [router]);

  if (checking) {
    return (
      <div className="screen" style={{ display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <p className="muted">Loading plans…</p>
      </div>
    );
  }

  return (
    <div className="screen scroll" style={{ background: 'var(--bg)', position: 'relative', minHeight: '100vh' }}>
      <Aurora />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {toast && (
        <div role="status" style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--fg)', color: 'var(--bg)', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '40px 24px 64px' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
          <Logo />
          <button className="btn btn-ghost" style={{ fontSize: 13.5 }} onClick={() => router.push('/support')}>
            Need help?
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 className="display" style={{ fontSize: 38, lineHeight: 1.15 }}>Choose your plan</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 12, maxWidth: 560, marginInline: 'auto', lineHeight: 1.6 }}>
            Pick monthly or yearly billing to unlock your workspace. Razorpay securely
            connects your payment method, and you&apos;ll go straight to onboarding.
          </p>
        </div>

        <div className="row" style={{ justifyContent: 'center', marginBottom: 34 }}>
          <BillingPeriodToggle annual={annual} onChange={setAnnual} />
        </div>

        {!canManageBilling && (
          <div className="card" role="alert" style={{ padding: 17, marginBottom: 24, background: '#fff8e6', border: '1px solid #ffe3a3', textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 13.5 }}>
              Only your organization&apos;s billing manager can start a subscription.
            </div>
          </div>
        )}

        <div className="billing-plan-grid">
          {PLAN_CONFIG.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              annual={annual}
              showPopular={plan.id === MOST_POPULAR_PLAN_ID}
              actionLabel={busy === plan.id ? 'Please wait…' : 'Choose plan'}
              actionDisabled={!canManageBilling || Boolean(busy)}
              onAction={(planId) => startCheckout(planId, annual ? 'annual' : 'monthly')}
            />
          ))}
        </div>

        <p className="muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 30, lineHeight: 1.6 }}>
          Cancel anytime from Billing. Prices in USD.
        </p>
      </div>
    </div>
  );
}
