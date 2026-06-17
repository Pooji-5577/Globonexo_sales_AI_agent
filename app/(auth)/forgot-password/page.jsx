"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthAside from "../../../components/layout/AuthAside";
import Field from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Account recovery"
        headline="Let's get you back in."
        sub="We'll email a secure link to reset your password. Expires in 15 minutes."
        bullets={['Encrypted reset link', 'No password shown to support', 'Back in under a minute']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <button className="row" onClick={() => router.push('/login')} style={{ gap: 8, color: 'var(--muted)', fontWeight: 700, fontSize: 14, marginBottom: 22 }}>
            <Icon name="arrowLeft" size={17} /> Back to sign in
          </button>
          {!sent ? (
            <>
              <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name="lock" size={26} color="var(--g-600)" />
              </span>
              <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Reset password</h2>
              <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Enter your work email and we&apos;ll send a reset link.</p>
              <div style={{ marginTop: 24 }}>
                <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => setSent(true)}>
                Send reset link <Icon name="send" size={17} color="#06231a" />
              </button>
            </>
          ) : (
            <div style={{ animation: 'pop .4s both' }}>
              <span style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name="checkCircle" size={34} color="var(--g-500)" stroke={2} />
              </span>
              <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Check your inbox</h2>
              <p className="muted" style={{ marginTop: 10, fontSize: 15, lineHeight: 1.55 }}>
                We sent a reset link to <b style={{ color: 'var(--ink)' }}>{email || 'your email'}</b>. Expires in 15 minutes.
              </p>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }} onClick={() => router.push('/login')}>
                Back to sign in
              </button>
              <button className="btn btn-block" style={{ marginTop: 10, color: 'var(--g-700)', fontWeight: 700 }} onClick={() => setSent(false)}>
                Didn&apos;t get it? Resend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
