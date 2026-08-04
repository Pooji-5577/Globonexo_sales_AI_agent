'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { cleanText, isStrongPassword, isValidEmail } from '../../lib/validation';

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', password: '' });
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreed) {
      setError('Please agree to the Terms and Privacy Policy.');
      return;
    }
    const payload = {
      firstName: cleanText(form.firstName, { max: 80 }),
      lastName: cleanText(form.lastName, { max: 80 }),
      email: cleanText(form.email, { max: 254 }).toLowerCase(),
      company: cleanText(form.company, { max: 160 }),
      password: form.password,
    };
    if (!payload.firstName || !payload.lastName || !payload.company) {
      setError('Enter your name and company.');
      return;
    }
    if (!isValidEmail(payload.email)) {
      setError('Enter a valid work email.');
      return;
    }
    if (!isStrongPassword(payload.password)) {
      setError('Use 8+ characters with a letter, number, and symbol.');
      return;
    }
    setSubmitting(true);
    try {
      await signup(payload);
      localStorage.setItem('returning_user', '1');
      router.push('/billing?required=1');
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const messages = [];
        for (const [key, val] of Object.entries(data.details)) {
          if (key === '_errors') continue;
          if (val?._errors?.length) messages.push(val._errors[0]);
        }
        setError(messages.join('. ') || data.error || 'Something went wrong. Please try again.');
      } else {
        setError(data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <h2 className="display" style={{ fontSize: 30 }}>Create your account</h2>
      <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Let&apos;s build your autonomous pipeline.</p>
      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ marginTop: 24 }}
        onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; }}
      >
        <Icon name="google" size={19} /> Sign up with Google
      </button>
      <div className="row center" style={{ gap: 14, margin: '18px 0' }}>
        <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="col" style={{ gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(240px,1fr))', gap: 20 }}>
            <Field label="First name" icon="user" placeholder="Jane" value={form.firstName} onChange={update('firstName')} required autoComplete="given-name" />
            <Field label="Last name" placeholder="Smith" value={form.lastName} onChange={update('lastName')} required autoComplete="family-name" />
          </div>
          <Field label="Work email" icon="mail" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required autoComplete="email" />
          <Field label="Company" icon="building" placeholder="Your company" value={form.company} onChange={update('company')} required autoComplete="organization" />
          <Field label="Password" icon="lock" toggle placeholder="8+ characters" hint="Use 8+ characters with a number and a symbol." value={form.password} onChange={update('password')} required autoComplete="new-password" />
        </div>
        <label className="row" style={{ gap: 9, fontSize: 13, color: 'var(--muted)', marginTop: 16, cursor: 'pointer', lineHeight: 1.4 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: 'var(--g-500)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
          <span>I agree to the <b style={{ color: 'var(--g-700)' }}>Terms</b> and <b style={{ color: 'var(--g-700)' }}>Privacy Policy</b>.</span>
        </label>
        {error && (
          <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'} <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </form>
      <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
        Already have an account? <a href="/login" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Sign in</a>
      </p>
    </div>
  );
}
