'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { cleanText, isValidEmail } from '../../lib/validation';

export function SignupForm() {
  const router = useRouter();
  const { startSignup, verifySignup } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '' });
  const [agreed, setAgreed] = useState(true);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleDetailsSubmit = async (e) => {
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
    };
    if (!payload.firstName || !payload.lastName || !payload.company) {
      setError('Enter your name and company.');
      return;
    }
    if (!isValidEmail(payload.email)) {
      setError('Enter a valid work email.');
      return;
    }
    setForm(payload);
    setSubmitting(true);
    try {
      await startSignup(payload);
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
      await verifySignup(form.email, otp);
      localStorage.setItem('returning_user', '1');
      router.push('/billing?required=1');
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
      await startSignup(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <div style={{ width: 420, maxWidth: '100%' }}>
        <h2 className="display" style={{ fontSize: 30 }}>Check your inbox</h2>
        <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>
          We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{form.email}</b>.
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
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify & create account'} <Icon name="arrow" size={18} color="#06231a" />
          </button>
        </form>
        <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
          Didn&apos;t get it?{' '}
          <button type="button" onClick={handleResend} disabled={submitting} style={{ color: 'var(--g-700)', fontWeight: 800 }}>
            Resend code
          </button>
        </p>
        <p className="text-c muted" style={{ marginTop: 8, fontSize: 14 }}>
          <button type="button" onClick={() => { setStep('details'); setOtp(''); setError(''); }} style={{ color: 'var(--muted)', fontWeight: 700 }}>
            Use a different email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form-wide">
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
      <form onSubmit={handleDetailsSubmit}>
        <div className="col" style={{ gap: 14 }}>
          <div className="auth-name-grid">
            <Field label="First name" icon="user" placeholder="Jane" value={form.firstName} onChange={update('firstName')} required autoComplete="given-name" />
            <Field label="Last name" placeholder="Smith" value={form.lastName} onChange={update('lastName')} required autoComplete="family-name" />
          </div>
          <Field label="Work email" icon="mail" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required autoComplete="email" />
          <Field label="Company" icon="building" placeholder="Your company" value={form.company} onChange={update('company')} required autoComplete="organization" />
        </div>
        <label className="row" style={{ gap: 9, fontSize: 13, color: 'var(--muted)', marginTop: 16, cursor: 'pointer', lineHeight: 1.4 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: 'var(--g-500)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
          <span>I agree to the <b style={{ color: 'var(--g-700)' }}>Terms</b> and <b style={{ color: 'var(--g-700)' }}>Privacy Policy</b>.</span>
        </label>
        {error && (
          <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} disabled={submitting}>
          {submitting ? 'Sending code…' : 'Create account'} <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </form>
      <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
        Already have an account? <a href="/login" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Sign in</a>
      </p>
    </div>
  );
}
