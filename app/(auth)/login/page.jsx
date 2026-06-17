"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthAside from "../../../components/layout/AuthAside";
import Field from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('mara@northwind.io');
  const [pw, setPw] = useState('••••••••••');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Welcome back"
        headline="Your pipeline ran all night."
        sub="While you were away, your agent sent 84 emails, handled 19 replies and booked 3 meetings."
        bullets={['Autonomous outreach & follow-up', 'Real-time buying-intent signals', 'Meetings booked on autopilot']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <h2 className="display" style={{ fontSize: 30 }}>Sign in</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Welcome back. Let&apos;s get to work.</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 26 }}>
            <Icon name="google" size={19} /> Continue with Google
          </button>
          <div className="row center" style={{ gap: 14, margin: '20px 0' }}>
            <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
          </div>
          <div className="col" style={{ gap: 16 }}>
            <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Field label="Password" icon="lock" toggle placeholder="Your password" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="row spread" style={{ marginTop: 14 }}>
            <label className="row nw" style={{ gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16 }} /> Remember me
            </label>
            <button onClick={() => router.push('/forgot-password')} className="nw" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--g-700)' }}>Forgot password?</button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => router.push('/dashboard')}>
            Sign in <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
            New to Globonexo? <button onClick={() => router.push('/signup')} className="nw" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}
