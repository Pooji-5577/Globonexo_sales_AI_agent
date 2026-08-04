'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { Icon } from '../ui/Icon';
import { Field } from '../ui/Input';
import { isStrongPassword } from '../../lib/validation';

export function ResetPasswordForm() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    setAccessToken(hash.get('access_token') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accessToken) {
      setError('This reset link is invalid or has expired. Please request a new one.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Use 8+ characters with a letter, number, and symbol.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { accessToken, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
        <Icon name="lock" size={26} color="var(--g-600)" />
      </span>
      <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Set a new password</h2>
      <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Choose a new password for your account.</p>
      {done ? (
        <div style={{ marginTop: 24 }}>
          <span style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
            <Icon name="checkCircle" size={34} color="var(--g-500)" stroke={2} />
          </span>
          <p className="muted" style={{ marginTop: 14, fontSize: 15 }}>Password updated. Redirecting to sign in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: 24 }}>
            <Field label="New password" icon="lock" toggle placeholder="8+ characters" hint="Use 8+ characters with a number and a symbol." value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          {error && (
            <p style={{ marginTop: 14, fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>
          )}
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'} <Icon name="arrow" size={18} color="#06231a" />
          </button>
        </form>
      )}
    </div>
  );
}
