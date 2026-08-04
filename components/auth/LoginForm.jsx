'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { cleanText, isValidEmail } from '../../lib/validation';

export function LoginForm() {
  const router = useRouter();
  const { startLogin, verifyLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = cleanText(email, { max: 254 }).toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid work email.');
      return;
    }
    setEmail(normalizedEmail);
    setSubmitting(true);
    try {
      await startLogin(normalizedEmail);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      await verifyLogin(email, otp);
      localStorage.setItem('returning_user', '1');
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSubmitting(true);
    try {
      await startLogin(email);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <div style={{ width: 380, maxWidth: '100%' }}>
        <h2 className="display" style={{ fontSize: 30 }}>Check your inbox</h2>
        <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>
          We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{email}</b>.
        </p>
        <form onSubmit={handleOtpSubmit}>
          <div style={{ marginTop: 24 }}>
            <Field
              label="Verification code"
              icon="lock"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoComplete="one-time-code"
            />
          </div>
          {error && (
            <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
          )}
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'} <Icon name="arrow" size={18} color="#06231a" />
          </button>
        </form>
        <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
          Didn&apos;t get it?{' '}
          <button type="button" onClick={handleResend} disabled={submitting} style={{ color: 'var(--g-700)', fontWeight: 800 }}>
            Resend code
          </button>
        </p>
        <p className="text-c muted" style={{ marginTop: 8, fontSize: 14 }}>
          <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{ color: 'var(--muted)', fontWeight: 700 }}>
            Use a different email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
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
      <form onSubmit={handleEmailSubmit}>
        <div className="col" style={{ gap: 16 }}>
          <Field label="Work email" icon="mail" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        {error && (
          <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={submitting}>
          {submitting ? 'Sending code…' : 'Continue'} <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </form>
      <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
        New to Globonexo? <a href="/signup" className="nw" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Create an account</a>
      </p>
    </div>
  );
}
