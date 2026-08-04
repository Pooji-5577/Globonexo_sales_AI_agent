'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { cleanText, isValidEmail } from '../../lib/validation';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = cleanText(email, { max: 254 }).toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid work email.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await login(normalizedEmail, password);
      localStorage.setItem('returning_user', '1');
      const status = data.organization?.subscription_status;
      router.push(['active', 'past_due'].includes(status) ? '/dashboard' : '/billing?required=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: 380, maxWidth: '100%' }}>
      <h2 className="display" style={{ fontSize: 30 }}>Sign in</h2>
      <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Welcome back. Let&apos;s get to work.</p>
      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ marginTop: 26 }}
        onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; }}
      >
        <Icon name="google" size={19} /> Continue with Google
      </button>
      <div className="row center" style={{ gap: 14, margin: '20px 0' }}>
        <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="col" style={{ gap: 16 }}>
          <Field label="Work email" icon="mail" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Field label="Password" icon="lock" toggle placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="row spread" style={{ marginTop: 14 }}>
          <label className="row nw" style={{ gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16 }} /> Remember me
          </label>
          <a href="/forgot-password" className="nw" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--g-700)' }}>Forgot password?</a>
        </div>
        {error && (
          <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'} <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </form>
      <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
        New to Globonexo? <a href="/signup" className="nw" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Create an account</a>
      </p>
    </div>
  );
}
