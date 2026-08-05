"use client";

import { useState } from "react";
import api from "../lib/api";
import { findPlan } from "../lib/plans";

// Shared Razorpay Subscriptions checkout, used by the standalone /subscribe
// page and the in-dashboard /billing page. The backend owns the Plan ID and
// the amount; this only opens Checkout against the subscription it returns.
export default function useBillingCheckout({ onToast, onVerified, onRefresh }) {
  const [busy, setBusy] = useState("");

  const startCheckout = async (planId, billingPeriod) => {
    if (typeof window.Razorpay === 'undefined') {
      onToast('Payment is loading. Please wait a moment and try again.');
      return;
    }

    setBusy(planId);
    try {
      const { data } = await api.post('/billing/checkout', { planId, billingPeriod });
      const plan = findPlan(planId);
      const razorpay = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Globonexo Sales AI',
        description: `${plan?.name ?? planId} · ${billingPeriod} subscription`,
        handler: async (response) => {
          try {
            const verification = await api.post('/billing/checkout/verify', response);
            if (verification.data.subscriptionStatus !== 'active') {
              onToast('Payment received. Razorpay is still confirming the subscription; refresh shortly.');
              await onRefresh?.();
              return;
            }
            onToast('Billing verified. Continue with onboarding.');
            await onRefresh?.();
            onVerified?.();
          } catch {
            onToast('Payment is still being confirmed. Refresh shortly or contact Support.');
          } finally {
            setBusy("");
          }
        },
        modal: { ondismiss: () => setBusy("") },
        theme: { color: '#0f6e63' },
      });
      razorpay.on('payment.failed', () => {
        onToast('Payment failed. Please try again.');
        setBusy("");
      });
      razorpay.open();
    } catch (err) {
      onToast(err?.response?.data?.error ?? 'Something went wrong. Please try again.');
      setBusy("");
    }
  };

  return { busy, setBusy, startCheckout };
}
