"use client";
import React from "react";
import { useRouter } from "next/navigation";
import AuthAside from "../../../components/layout/AuthAside";
import Field from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Start free"
        headline="Hire your AI sales rep in 5 minutes."
        sub="No credit card. Connect your inbox and the agent starts prospecting the same day."
        bullets={['14-day free trial, full access', '2-minute inbox & CRM connect', 'Cancel anytime']}
      />
      <div className="grow scroll" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 400, maxWidth: '100%' }}>
          <button className="row" onClick={() => router.push('/')} style={{ gap: 8, color: 'var(--muted)', fontWeight: 700, fontSize: 14, marginBottom: 22 }}>
            <Icon name="arrowLeft" size={17} /> Back to landing
          </button>
          <h2 className="display" style={{ fontSize: 30 }}>Create your account</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Let&apos;s build your autonomous pipeline.</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 24 }}>
            <Icon name="google" size={19} /> Sign up with Google
          </button>
          <div className="row center" style={{ gap: 14, margin: '18px 0' }}>
            <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
          </div>
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="First name" icon="user" placeholder="Mara" />
              <Field label="Last name" placeholder="Ito" />
            </div>
            <Field label="Work email" icon="mail" placeholder="you@company.com" />
            <Field label="Company" icon="building" placeholder="Northwind Inc." />
            <Field label="Password" icon="lock" toggle placeholder="8+ characters" hint="Use 8+ characters with a number and a symbol." />
          </div>
          <label className="row" style={{ gap: 9, fontSize: 13, color: 'var(--muted)', marginTop: 16, cursor: 'pointer', lineHeight: 1.4 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
            <span>I agree to the <b style={{ color: 'var(--g-700)' }}>Terms</b> and <b style={{ color: 'var(--g-700)' }}>Privacy Policy</b>.</span>
          </label>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => router.push('/onboarding')}>
            Create account <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
            Already have an account? <button onClick={() => router.push('/login')} style={{ color: 'var(--g-700)', fontWeight: 800 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
