'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Field } from '../../../components/ui/Input';

const TONES = [
  { value: 'consultative', label: 'Consultative' },
  { value: 'direct',       label: 'Direct' },
  { value: 'friendly',     label: 'Friendly' },
  { value: 'formal',       label: 'Formal' },
  { value: 'challenger',   label: 'Challenger' },
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    orgName: '',
    orgWebsite: '',
    tone: 'consultative',
    autoApproveReplies: false,
    dailyEmailSendCap: 100,
    bookingLink: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        setForm({
          firstName:          data.profile.firstName,
          lastName:           data.profile.lastName,
          orgName:            data.organization.name,
          orgWebsite:         data.organization.website,
          tone:               data.agentConfig.tone,
          autoApproveReplies: data.agentConfig.autoApproveReplies,
          dailyEmailSendCap:  data.agentConfig.dailyEmailSendCap,
          bookingLink:        data.agentConfig.bookingLink,
        });
      })
      .catch(() => setError('Failed to load settings. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await api.put('/settings', {
        ...form,
        dailyEmailSendCap: Number(form.dailyEmailSendCap),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 680 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Settings</h1>
      <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>
        Manage your profile, organisation, and AI agent configuration.
      </p>

      <form onSubmit={handleSubmit} className="col" style={{ gap: 32 }}>

        {/* Profile */}
        <section className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First name" value={form.firstName} onChange={set('firstName')} />
            <Field label="Last name"  value={form.lastName}  onChange={set('lastName')}  />
          </div>
        </section>

        {/* Organisation */}
        <section className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Organisation</h2>
          <div className="col" style={{ gap: 16 }}>
            <Field label="Company name" value={form.orgName} onChange={set('orgName')} />
            <Field
              label="Website"
              type="url"
              value={form.orgWebsite}
              onChange={set('orgWebsite')}
              hint="e.g. https://yourcompany.com"
            />
          </div>
        </section>

        {/* Agent Configuration */}
        <section className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Agent Configuration</h2>
          <div className="col" style={{ gap: 24 }}>

            {/* Booking link */}
            <Field
              label="Booking link"
              type="url"
              value={form.bookingLink}
              onChange={set('bookingLink')}
              hint="e.g. https://calendly.com/yourname/15min"
            />

            {/* Tone */}
            <div className="field">
              <label>Outreach tone</label>
              <div className="input-wrap">
                <select
                  className="input"
                  value={form.tone}
                  onChange={set('tone')}
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>
                Controls the writing style of AI-generated emails and voice scripts.
              </span>
            </div>

            {/* Daily send cap */}
            <div className="field">
              <label>Daily email send cap</label>
              <div className="input-wrap">
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={500}
                  value={form.dailyEmailSendCap}
                  onChange={(e) => setForm((f) => ({ ...f, dailyEmailSendCap: e.target.value }))}
                />
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>
                Maximum emails sent per day across all active campaigns (1–500).
              </span>
            </div>

            {/* Auto-approve replies */}
            <label style={{ display: 'flex', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.autoApproveReplies}
                onChange={(e) => setForm((f) => ({ ...f, autoApproveReplies: e.target.checked }))}
                style={{
                  accentColor: 'var(--g-500)',
                  width: 18,
                  height: 18,
                  flex: 'none',
                  marginTop: 2,
                }}
              />
              <div className="col" style={{ gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Auto-approve AI replies</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  When on, AI reply drafts send automatically without human review.
                  Leave off to approve each reply in the Inbox first.
                </span>
              </div>
            </label>

          </div>
        </section>

        {error   && <p style={{ fontSize: 13.5, color: '#c0392b', fontWeight: 600 }}>{error}</p>}
        {success && <p style={{ fontSize: 13.5, color: 'var(--g-700)', fontWeight: 600 }}>Settings saved successfully.</p>}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start' }}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>

      </form>
    </div>
  );
}
