'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { cleanText, isValidEmail } from '../../lib/validation';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
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
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: normalizedEmail });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <a href="/login" className="row" style={{ gap: 8, color: 'var(--muted)', fontWeight: 700, fontSize: 14, marginBottom: 22 }}>
        <Icon name="arrowLeft" size={17} /> Back to sign in
      </a>
      {!sent ? (
        <>
          <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
            <Icon name="lock" size={26} color="var(--g-600)" />
          </span>
          <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Reset password</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Enter your work email and we&apos;ll send a reset link.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: 24 }}>
              <Field label="Work email" icon="mail" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            {error && (
              <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
            )}
            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'} <Icon name="send" size={17} color="#06231a" />
            </button>
          </form>
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
          <a href="/login" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }}>
            Back to sign in
          </a>
          <button type="button" className="btn btn-block" style={{ marginTop: 10, color: 'var(--g-700)', fontWeight: 700 }} onClick={() => setSent(false)}>
            Didn&apos;t get it? Resend
          </button>
        </div>
      )}
    </div>
  );
}
