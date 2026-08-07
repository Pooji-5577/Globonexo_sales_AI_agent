'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Field } from '../../../components/ui/Input';
import Icon from '../../../components/ui/Icon';
import RouteSkeleton from '../../../components/ui/RouteSkeleton';
import { useFirstLoad } from '../../../hooks/useFirstLoad';
import { clampNumber, cleanText, normalizeUrl } from '../../../lib/validation';
import { useSetup } from '../../../providers/SetupProvider';

const HELP_LINKS = [
  { href: '/support', label: 'Support tickets', ico: 'inbox' },
  { href: '/help',    label: 'Help Center',     ico: 'doc' },
  { href: '/faq',     label: 'FAQs',            ico: 'chat' },
  { href: '/contact', label: 'Contact support', ico: 'mail' },
  { href: '/about',   label: 'About Globonexo', ico: 'building' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms',   label: 'Terms' },
  { href: '/refund',  label: 'Refunds' },
  { href: '/cookies', label: 'Cookies' },
];

const TONES = [
  { value: 'consultative', label: 'Consultative' },
  { value: 'direct',       label: 'Direct' },
  { value: 'friendly',     label: 'Friendly' },
  { value: 'formal',       label: 'Formal' },
  { value: 'challenger',   label: 'Challenger' },
];

const requestOptions = () => (
  typeof AbortSignal !== 'undefined' && AbortSignal.timeout
    ? { signal: AbortSignal.timeout(8000) }
    : {}
);

const EMPTY_SMTP_FORM = {
  email: '',
  displayName: '',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUsername: '',
  smtpPassword: '',
  imapHost: '',
  imapPort: '993',
  imapSecure: true,
  imapUsername: '',
  imapPassword: '',
};

const SMTP_PRESETS = {
  gmail: {
    label: 'Gmail',
    description: 'Use Gmail SMTP + IMAP with an app password.',
    values: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpSecure: false,
      imapHost: 'imap.gmail.com',
      imapPort: '993',
      imapSecure: true,
    },
    note: 'For this preset, use a Google app password—not your normal Google account password. For one-click Google OAuth, use the Gmail OAuth connection below.',
  },
  outlook: {
    label: 'Outlook',
    description: 'Use Outlook.com SMTP + IMAP settings.',
    values: {
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: '587',
      smtpSecure: false,
      imapHost: 'outlook.office365.com',
      imapPort: '993',
      imapSecure: true,
    },
    note: 'Outlook.com may require IMAP to be enabled and Modern Auth/OAuth2. This password form works only when your mailbox allows SMTP/IMAP password or app-password authentication.',
  },
  custom: {
    label: 'Custom',
    description: 'Enter your provider’s SMTP and IMAP settings.',
    values: {
      smtpHost: '',
      smtpPort: '587',
      smtpSecure: false,
      imapHost: '',
      imapPort: '993',
      imapSecure: true,
    },
    note: 'We test both connections before saving. Use provider-specific app passwords where your mail host requires them; never paste a Google Calendar password here.',
  },
};

export default function SettingsPage() {
  const { startTour } = useSetup();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    orgName: '',
    orgWebsite: '',
    tone: 'consultative',
    autoApproveReplies: false,
    dailyEmailSendCap: 100,
    bookingLink: '',
    retellPhoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [gmailLoading, setGmailLoading] = useState(true);
  const [gmailBusy, setGmailBusy] = useState(false);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, active: false, email: null, expiresAt: null });
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpBusy, setSmtpBusy] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState({ connections: [] });
  const [smtpPreset, setSmtpPreset] = useState('gmail');
  const [smtpForm, setSmtpForm] = useState({ ...EMPTY_SMTP_FORM, ...SMTP_PRESETS.gmail.values });
  const [useEmailForUsernames, setUseEmailForUsernames] = useState(true);
  const [voiceAgentId, setVoiceAgentId] = useState(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneLoading, setPhoneLoading] = useState(true);
  const [phoneRetrying, setPhoneRetrying] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    backend: { running: false },
    redis: { connected: false },
    workers: { required: true, queues: [] },
  });
  const [systemLoading, setSystemLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    api.get('/settings', requestOptions())
      .then(({ data }) => {
        setForm({
          firstName:          data.profile?.firstName || '',
          lastName:           data.profile?.lastName || '',
          orgName:            data.organization?.name || '',
          orgWebsite:         data.organization?.website || '',
          tone:               data.agentConfig?.tone || 'consultative',
          autoApproveReplies: Boolean(data.agentConfig?.autoApproveReplies),
          dailyEmailSendCap:  data.agentConfig?.dailyEmailSendCap || 100,
          bookingLink:        data.agentConfig?.bookingLink || '',
          retellPhoneNumber:  data.agentConfig?.retellPhoneNumber || '',
        });
        setVoiceAgentId(data.agentConfig?.retellAgentId || null);
      })
      .catch(() => setError('Failed to load settings. Check the API server and refresh.'))
      .finally(() => setLoading(false));

    api.get('/gmail/status', requestOptions())
      .then(({ data }) => setGmailStatus(data))
      .catch(() => setGmailStatus({ connected: false, active: false, email: null, expiresAt: null }))
      .finally(() => setGmailLoading(false));

    api.get('/smtp/status', requestOptions())
      .then(({ data }) => setSmtpStatus({ connections: Array.isArray(data?.connections) ? data.connections : [] }))
      .catch(() => setSmtpStatus({ connections: [] }))
      .finally(() => setSmtpLoading(false));

    api.get('/system/status', requestOptions())
      .then(({ data }) => setSystemStatus(data))
      .catch(() => setSystemStatus({
        backend: { running: false },
        redis: { connected: false },
        workers: { required: true, queues: [] },
      }))
      .finally(() => setSystemLoading(false));

    api.get('/voice/phone-numbers', requestOptions())
      .then(({ data }) => setPhoneNumbers(Array.isArray(data) ? data : []))
      .catch(() => setPhoneNumbers([]))
      .finally(() => setPhoneLoading(false));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setSmtpEmail = (e) => {
    const email = e.target.value;
    setSmtpForm((f) => ({
      ...f,
      email,
      smtpUsername: useEmailForUsernames ? email : f.smtpUsername,
      imapUsername: useEmailForUsernames ? email : f.imapUsername,
    }));
  };
  const setSmtp = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSmtpForm((f) => ({ ...f, [field]: value }));
  };

  const applySmtpPreset = (presetKey) => {
    const preset = SMTP_PRESETS[presetKey] || SMTP_PRESETS.custom;
    setSmtpPreset(presetKey);
    setSmtpForm((f) => ({
      ...f,
      ...preset.values,
      smtpUsername: useEmailForUsernames ? f.email : f.smtpUsername,
      imapUsername: useEmailForUsernames ? f.email : f.imapUsername,
      smtpPassword: '',
      imapPassword: '',
    }));
    setError('');
    setSuccess(false);
  };

  const toggleEmailUsernames = (e) => {
    const checked = e.target.checked;
    setUseEmailForUsernames(checked);
    if (checked) {
      setSmtpForm((f) => ({ ...f, smtpUsername: f.email, imapUsername: f.email }));
    }
  };

  const refreshSmtpStatus = async () => {
    const { data } = await api.get('/smtp/status', requestOptions());
    setSmtpStatus({ connections: Array.isArray(data?.connections) ? data.connections : [] });
  };

  const refreshGmailStatus = async () => {
    const { data } = await api.get('/gmail/status', requestOptions());
    setGmailStatus(data);
  };

  const connectGmail = async () => {
    setError('');
    setGmailBusy(true);
    try {
      const { data } = await api.get('/gmail/auth-url');
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError('Gmail connection URL was not returned.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start Gmail connection.');
    } finally {
      setGmailBusy(false);
    }
  };

  const disconnectGmail = async () => {
    setError('');
    setGmailBusy(true);
    try {
      await api.delete('/gmail/disconnect');
      setGmailStatus({ connected: false, active: false, email: null, expiresAt: null });
      await refreshSmtpStatus().catch(() => undefined);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disconnect Gmail.');
    } finally {
      setGmailBusy(false);
    }
  };

  const activateGmail = async () => {
    setError('');
    setGmailBusy(true);
    try {
      await api.post('/gmail/activate');
      setGmailStatus((status) => ({ ...status, active: true }));
      setSmtpStatus((status) => ({
        connections: status.connections.map((connection) => ({ ...connection, active: false })),
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate Gmail.');
    } finally {
      setGmailBusy(false);
    }
  };

  const connectSmtp = async () => {
    setError('');
    setSuccess(false);
    setSmtpBusy(true);
    try {
      const { data } = await api.post('/smtp/connect', {
        ...smtpForm,
        smtpPort: Number(smtpForm.smtpPort),
        imapPort: Number(smtpForm.imapPort),
      });
      setSmtpForm((formState) => ({ ...formState, smtpPassword: '', imapPassword: '' }));
      await refreshSmtpStatus();
      setGmailStatus((status) => ({ ...status, active: false }));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not verify the SMTP and IMAP connection.');
    } finally {
      setSmtpBusy(false);
    }
  };

  const activateSmtp = async (connectionId) => {
    setError('');
    setSmtpBusy(true);
    try {
      await api.post('/smtp/activate');
      setSmtpStatus((status) => ({
        connections: status.connections.map((connection) => ({ ...connection, active: connection.id === connectionId })),
      }));
      setGmailStatus((status) => ({ ...status, active: false }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate custom email.');
    } finally {
      setSmtpBusy(false);
    }
  };

  const disconnectSmtp = async () => {
    setError('');
    setSmtpBusy(true);
    try {
      await api.delete('/smtp/disconnect');
      await refreshSmtpStatus();
      await refreshGmailStatus().catch(() => undefined);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disconnect custom email.');
    } finally {
      setSmtpBusy(false);
    }
  };

  const setupVoiceAgent = async () => {
    setError('');
    setSuccess(false);
    setVoiceBusy(true);
    try {
      // The Retell phone number field lives in this same section, so save it
      // along with setting up the agent - otherwise it only exists in local
      // form state until the separate page-level Save button is clicked,
      // which isn't visible while scrolled down here, and gets lost on refresh.
      await api.put('/settings', {
        ...form,
        dailyEmailSendCap: Number(form.dailyEmailSendCap),
      });
      const { data } = await api.post('/voice/agents');
      setVoiceAgentId(data?.agentId || null);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set up voice agent.');
    } finally {
      setVoiceBusy(false);
    }
  };

  const retryPhoneProvisioning = async () => {
    setError('');
    setSuccess(false);
    setPhoneRetrying(true);
    try {
      const { data } = await api.post('/voice/phone-numbers/retry');
      const { data: refreshed } = await api.get('/voice/phone-numbers', requestOptions());
      setPhoneNumbers(Array.isArray(refreshed) ? refreshed : []);
      if (data?.status === 'provisioning') {
        setSuccess(true);
      } else if (data?.status === 'active') {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Retell could not provision the number. You can retry again or contact support.');
    } finally {
      setPhoneRetrying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    let orgWebsite = '';
    let bookingLink = '';
    try {
      orgWebsite = normalizeUrl(form.orgWebsite);
      bookingLink = normalizeUrl(form.bookingLink);
    } catch {
      setSaving(false);
      setError('Enter valid website and booking URLs, or leave them blank.');
      return;
    }
    try {
      await api.put('/settings', {
        firstName: cleanText(form.firstName, { max: 80 }),
        lastName: cleanText(form.lastName, { max: 80 }),
        orgName: cleanText(form.orgName, { max: 160 }),
        orgWebsite,
        tone: TONES.some(tone => tone.value === form.tone) ? form.tone : 'consultative',
        autoApproveReplies: Boolean(form.autoApproveReplies),
        dailyEmailSendCap: clampNumber(form.dailyEmailSendCap, { min: 1, max: 500, fallback: 100 }),
        bookingLink,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const activePhone = phoneNumbers.find(phone => phone.status === 'active' && phone.phone_number);
  const pendingPhone = phoneNumbers.find(phone => ['requested', 'provisioning'].includes(phone.status));
  const failedPhone = phoneNumbers.find(phone => phone.status === 'failed');
  const phoneReady = Boolean(activePhone);
  const smtpConnection = smtpStatus.connections.find((connection) => connection.provider === 'smtp') || null;
  const emailConnectionReady = gmailStatus.active === true || smtpConnection?.active === true;

  if (showSkeleton) return <RouteSkeleton />;

  return (
    <div className="scroll grow settings-page" style={{ minHeight: 0 }}>
      <div className="settings-inner" style={{ padding: '34px 40px 48px', width: '100%' }}>
        <div className="row spread settings-head" style={{ gap: 18, alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 className="display" style={{ fontSize: 28, marginBottom: 8 }}>Settings</h1>
            <p className="muted" style={{ fontSize: 14 }}>
              Manage profile details, organisation identity, and AI agent defaults.
            </p>
          </div>
          <button
            form="settings-form"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving}
            style={{ flex: 'none' }}
          >
            <Icon name="check" size={15} color="#06231a" />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
          <form id="settings-form" onSubmit={handleSubmit} className="col" style={{ gap: 18 }}>
            <section className="card" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row" style={{ gap: 10, marginBottom: 20 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--g-50)', display: 'grid', placeItems: 'center', color: 'var(--g-700)' }}>
                  <Icon name="user" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800 }}>Profile</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Shown in the workspace header and account records.</p>
                </div>
              </div>
              <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                <Field label="First name" value={form.firstName || ''} onChange={set('firstName')} />
                <Field label="Last name" value={form.lastName || ''} onChange={set('lastName')} />
              </div>
            </section>

            <section className="card" data-tour="settings-email" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row spread" style={{ gap: 16, marginBottom: 18, alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: smtpConnection?.active ? 'var(--g-50)' : 'var(--bg-2)', display: 'grid', placeItems: 'center', color: smtpConnection?.active ? 'var(--g-700)' : 'var(--ink-2)', flex: 'none' }}>
                    <Icon name="send" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800 }}>SMTP + IMAP mailbox</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Choose a provider preset or enter your own server details. SMTP sends outbound email; IMAP polls replies.</p>
                  </div>
                </div>
                <span
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border: `1px solid ${smtpConnection?.active ? 'var(--g-100)' : 'var(--line)'}`,
                    background: smtpConnection?.active ? 'var(--g-50)' : 'var(--bg-2)',
                    color: smtpConnection?.active ? 'var(--g-700)' : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 900,
                    flex: 'none',
                  }}
                >
                  {smtpLoading ? 'Checking' : smtpConnection?.active ? 'Active' : smtpConnection ? 'Connected, not active' : 'Not connected'}
                </span>
              </div>

              {smtpConnection && (
                <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-2)', marginBottom: 18 }}>
                  <div className="row spread" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <div className="col" style={{ gap: 4, minWidth: 0 }}>
                      <span className="ellip" style={{ fontSize: 13.5, fontWeight: 800 }}>{smtpConnection.email}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                        SMTP: {smtpConnection.smtpHost || 'configured'} · IMAP: {smtpConnection.imapHost || 'configured'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--faint)' }}>Passwords are never displayed after saving.</span>
                    </div>
                    <div className="row" style={{ gap: 8, flex: 'none' }}>
                      {!smtpConnection.active && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => activateSmtp(smtpConnection.id)} disabled={smtpBusy || smtpLoading}>
                          Use this mailbox
                        </button>
                      )}
                      <button type="button" className="btn btn-ghost btn-sm" onClick={disconnectSmtp} disabled={smtpBusy || smtpLoading}>
                        <Icon name="logout" size={15} />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <div
                  role="tablist"
                  aria-label="Email provider presets"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 8,
                    padding: 5,
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    background: 'var(--bg-2)',
                  }}
                >
                  {Object.entries(SMTP_PRESETS).map(([presetKey, preset]) => {
                    const selected = smtpPreset === presetKey;
                    return (
                      <button
                        key={presetKey}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => applySmtpPreset(presetKey)}
                        style={{
                          border: `1px solid ${selected ? 'var(--g-200)' : 'transparent'}`,
                          borderRadius: 8,
                          background: selected ? 'var(--bg)' : 'transparent',
                          color: selected ? 'var(--ink)' : 'var(--muted)',
                          padding: '10px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          boxShadow: selected ? '0 2px 8px rgba(24, 57, 45, 0.08)' : 'none',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 900 }}>{preset.label}</span>
                        <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, lineHeight: 1.35, color: selected ? 'var(--muted)' : 'var(--faint)' }}>
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: '10px 2px 0', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {SMTP_PRESETS[smtpPreset].note}
                  {smtpPreset === 'gmail' && (
                    <>
                      {' '}
                      <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--g-700)', fontWeight: 800 }}>
                        Generate a Google app password
                      </a>
                    </>
                  )}
                </p>
              </div>

              <div className="col" style={{ gap: 16 }}>
                <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                  <Field
                    label="Sending email"
                    type="email"
                    value={smtpForm.email}
                    onChange={setSmtpEmail}
                    placeholder={smtpPreset === 'gmail' ? 'you@gmail.com' : smtpPreset === 'outlook' ? 'you@outlook.com' : 'you@company.com'}
                    autoComplete="email"
                  />
                  <Field label="Display name" value={smtpForm.displayName} onChange={setSmtp('displayName')} placeholder="Your name or company" autoComplete="organization" />
                </div>

                <label className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useEmailForUsernames} onChange={toggleEmailUsernames} style={{ accentColor: 'var(--g-500)' }} />
                  Use the sending email as both the SMTP and IMAP username
                </label>

                <div>
                  <p style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>SMTP sending</p>
                  <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: 14 }}>
                    <Field label="SMTP host" value={smtpForm.smtpHost} onChange={setSmtp('smtpHost')} placeholder={SMTP_PRESETS[smtpPreset].values.smtpHost || 'smtp.yourprovider.com'} autoComplete="off" />
                    <Field label="Port" type="number" value={smtpForm.smtpPort} onChange={setSmtp('smtpPort')} placeholder="587" autoComplete="off" />
                  </div>
                  <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 14 }}>
                    {useEmailForUsernames ? (
                      <div className="field">
                        <label>SMTP username</label>
                        <div className="input-wrap">
                          <input className="input" value={smtpForm.email} readOnly placeholder="Enter sending email first" autoComplete="username" />
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>Uses the sending email.</span>
                      </div>
                    ) : (
                      <Field label="SMTP username" value={smtpForm.smtpUsername} onChange={setSmtp('smtpUsername')} placeholder="Usually your email" autoComplete="username" />
                    )}
                    <Field label="SMTP password / app password" type="password" toggle value={smtpForm.smtpPassword} onChange={setSmtp('smtpPassword')} autoComplete="new-password" />
                  </div>
                  <label className="row" style={{ gap: 8, marginTop: 12, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={smtpForm.smtpSecure} onChange={setSmtp('smtpSecure')} style={{ accentColor: 'var(--g-500)' }} />
                    Use secure SMTP (usually port 465; leave off for STARTTLS on port 587)
                  </label>
                </div>

                <div>
                  <p style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>IMAP reply polling</p>
                  <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: 14 }}>
                    <Field label="IMAP host" value={smtpForm.imapHost} onChange={setSmtp('imapHost')} placeholder={SMTP_PRESETS[smtpPreset].values.imapHost || 'imap.yourprovider.com'} autoComplete="off" />
                    <Field label="Port" type="number" value={smtpForm.imapPort} onChange={setSmtp('imapPort')} placeholder="993" autoComplete="off" />
                  </div>
                  <div className="settings-two-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 14 }}>
                    {useEmailForUsernames ? (
                      <div className="field">
                        <label>IMAP username</label>
                        <div className="input-wrap">
                          <input className="input" value={smtpForm.email} readOnly placeholder="Enter sending email first" autoComplete="username" />
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>Uses the sending email.</span>
                      </div>
                    ) : (
                      <Field label="IMAP username" value={smtpForm.imapUsername} onChange={setSmtp('imapUsername')} placeholder="Usually your email" autoComplete="username" />
                    )}
                    <Field label="IMAP password / app password" type="password" toggle value={smtpForm.imapPassword} onChange={setSmtp('imapPassword')} autoComplete="new-password" />
                  </div>
                  <label className="row" style={{ gap: 8, marginTop: 12, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={smtpForm.imapSecure} onChange={setSmtp('imapSecure')} style={{ accentColor: 'var(--g-500)' }} />
                    Use secure IMAP (usually port 993)
                  </label>
                </div>

                <div className="row spread" style={{ gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, maxWidth: 520 }}>
                    The selected preset only fills server settings. Enter the mailbox address and password/app password, then test before saving.
                  </span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={connectSmtp} disabled={smtpBusy || smtpLoading} style={{ flex: 'none' }}>
                    <Icon name="check" size={15} color="#06231a" />
                    {smtpBusy ? 'Testing and saving...' : 'Test & save connection'}
                  </button>
                </div>
              </div>
            </section>

            <section className="card" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row" style={{ gap: 10, marginBottom: 20 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
                  <Icon name="building" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800 }}>Organisation</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Used for account context and future campaign personalisation.</p>
                </div>
              </div>
              <div className="col" style={{ gap: 16 }}>
                <Field label="Company name" value={form.orgName || ''} onChange={set('orgName')} />
                <Field
                  label="Website"
                  type="url"
                  value={form.orgWebsite || ''}
                  onChange={set('orgWebsite')}
                  hint="e.g. https://yourcompany.com"
                />
              </div>
            </section>

            <section className="card" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row" style={{ gap: 10, marginBottom: 20 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--g-50)', display: 'grid', placeItems: 'center', color: 'var(--g-700)' }}>
                  <Icon name="spark" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800 }}>Agent Configuration</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Defaults applied to outbound emails, replies, and booking workflows.</p>
                </div>
              </div>

              <div className="col" style={{ gap: 18 }}>
                <Field
                  label="Booking link"
                  type="url"
                  value={form.bookingLink || ''}
                  onChange={set('bookingLink')}
                  hint="e.g. https://calendly.com/yourname/15min"
                />

                <div className="settings-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: 14 }}>
                  <div className="field">
                    <label>Outreach tone</label>
                    <div className="input-wrap">
                      <select className="input" value={form.tone} onChange={set('tone')}>
                        {TONES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>
                      Controls AI email and voice script writing style.
                    </span>
                  </div>

                  <div className="field">
                    <label>Daily send cap</label>
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
                    <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>1-500 emails/day.</span>
                  </div>
                </div>

                <label
                  className="row spread"
                  style={{
                    gap: 18,
                    cursor: 'pointer',
                    padding: 16,
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    background: form.autoApproveReplies ? 'var(--g-50)' : 'var(--bg)',
                  }}
                >
                  <div className="col" style={{ gap: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>Auto-approve AI replies</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                      Send AI reply drafts automatically. Keep off to approve replies from Inbox.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoApproveReplies}
                    onChange={(e) => setForm((f) => ({ ...f, autoApproveReplies: e.target.checked }))}
                    style={{ accentColor: 'var(--g-500)', width: 20, height: 20, flex: 'none' }}
                  />
                </label>
              </div>
            </section>

            <section className="card" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row spread" style={{ gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: gmailStatus.active ? 'var(--g-50)' : 'var(--bg-2)', display: 'grid', placeItems: 'center', color: gmailStatus.active ? 'var(--g-700)' : 'var(--ink-2)', flex: 'none' }}>
                    <Icon name="google" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800 }}>Gmail OAuth Connection</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Use one-click Google OAuth instead of entering Gmail SMTP and IMAP credentials.</p>
                  </div>
                </div>
                <span
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border: `1px solid ${gmailStatus.active ? 'var(--g-100)' : 'var(--line)'}`,
                    background: gmailStatus.active ? 'var(--g-50)' : 'var(--bg-2)',
                    color: gmailStatus.active ? 'var(--g-700)' : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 900,
                    flex: 'none',
                  }}
                >
                  {gmailLoading ? 'Checking' : gmailStatus.active ? 'Active' : gmailStatus.connected ? 'Connected, not active' : 'Not connected'}
                </span>
              </div>

              <div className="settings-gmail-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 16, alignItems: 'center' }}>
                <div className="col" style={{ gap: 6, minWidth: 0 }}>
                  <span className="ellip" style={{ fontSize: 14, fontWeight: 800 }}>
                    {gmailLoading ? 'Checking Gmail status...' : gmailStatus.connected ? gmailStatus.email || 'Gmail account connected' : 'No Gmail account connected'}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                    {gmailStatus.connected
                      ? `Token expiry: ${gmailStatus.expiresAt ? new Date(gmailStatus.expiresAt).toLocaleString() : 'refresh token available'}`
                      : 'Connect Gmail or configure custom SMTP + IMAP before launching email campaigns.'}
                  </span>
                </div>
                {gmailStatus.connected ? (
                  <div className="row" style={{ gap: 8, flex: 'none' }}>
                    {!gmailStatus.active && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={activateGmail}
                        disabled={gmailBusy || gmailLoading}
                      >
                        Use Gmail
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={disconnectGmail}
                      disabled={gmailBusy || gmailLoading}
                    >
                      <Icon name="logout" size={15} />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={connectGmail}
                    disabled={gmailBusy || gmailLoading}
                    style={{ flex: 'none' }}
                  >
                    <Icon name="google" size={15} />
                    {gmailBusy ? 'Opening...' : 'Connect Gmail'}
                  </button>
                )}
              </div>
            </section>

            <section className="card" style={{ padding: 24, borderRadius: 8 }}>
              <div className="row spread" style={{ gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: voiceAgentId ? 'var(--g-50)' : 'var(--bg-2)', display: 'grid', placeItems: 'center', color: voiceAgentId ? 'var(--g-700)' : 'var(--ink-2)', flex: 'none' }}>
                    <Icon name="phone" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800 }}>Voice Agent (Retell)</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Required for launching and running voice campaigns.</p>
                  </div>
                </div>
                <span
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border: `1px solid ${voiceAgentId ? 'var(--g-100)' : 'var(--line)'}`,
                    background: voiceAgentId ? 'var(--g-50)' : 'var(--bg-2)',
                    color: voiceAgentId ? 'var(--g-700)' : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 900,
                    flex: 'none',
                  }}
                >
                  {voiceAgentId ? 'Connected' : 'Not connected'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 16, alignItems: 'center', marginBottom: 18 }}>
                <div className="col" style={{ gap: 6, minWidth: 0 }}>
                  <span className="ellip" style={{ fontSize: 14, fontWeight: 800 }}>
                    {voiceAgentId ? 'Voice agent is set up' : 'No voice agent set up yet'}
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                    {voiceAgentId
                      ? 'Re-run this after changing your tone, product description, or objections to refresh the call script.'
                      : 'Creates a Retell agent for your organisation using your onboarding details.'}
                  </span>
                </div>
                <button
                  type="button"
                  className={'btn btn-sm ' + (voiceAgentId ? 'btn-ghost' : 'btn-primary')}
                  onClick={setupVoiceAgent}
                  disabled={voiceBusy}
                  style={{ flex: 'none' }}
                >
                  <Icon name="spark" size={15} />
                  {voiceBusy ? 'Working...' : voiceAgentId ? 'Update voice agent' : 'Set up voice agent'}
                </button>
              </div>

              <Field
                label="Retell phone number"
                type="tel"
                value={form.retellPhoneNumber || ''}
                onChange={set('retellPhoneNumber')}
                hint="Your included US/Canada number is provisioned here after payment. Custom numbers can still be entered in E.164 format."
              />

              <div
                style={{
                  marginTop: 4,
                  padding: 16,
                  border: `1px solid ${phoneReady ? 'var(--g-100)' : failedPhone ? '#fed7aa' : 'var(--line)'}`,
                  borderRadius: 10,
                  background: phoneReady ? 'var(--g-50)' : failedPhone ? '#fff7ed' : 'var(--bg-2)',
                }}
              >
                <div className="row spread" style={{ gap: 14, alignItems: 'flex-start' }}>
                  <div className="col" style={{ gap: 5, minWidth: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>Included Retell number</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.45 }}>
                      {phoneLoading
                        ? 'Checking number provisioning status...'
                        : phoneReady
                          ? `${activePhone.phone_number} is ready for voice calls.`
                          : pendingPhone
                            ? 'Retell is still provisioning your included number. This page will show it when ready.'
                            : failedPhone
                              ? 'The previous provisioning attempt failed. Your number was not purchased.'
                              : 'No included number has been provisioned yet.'}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '6px 9px',
                      borderRadius: 999,
                      background: phoneReady ? 'var(--g-100)' : failedPhone ? '#ffedd5' : 'var(--bg)',
                      color: phoneReady ? 'var(--g-700)' : failedPhone ? '#9a3412' : 'var(--muted)',
                      fontSize: 11.5,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phoneLoading ? 'Checking' : phoneReady ? 'Active' : pendingPhone ? 'Provisioning' : failedPhone ? 'Failed' : 'Not ready'}
                  </span>
                </div>

                {!phoneLoading && !phoneReady && !pendingPhone && (
                  <div className="row" style={{ gap: 10, marginTop: 13, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={retryPhoneProvisioning}
                      disabled={phoneRetrying}
                    >
                      <Icon name="refresh" size={14} />
                      {phoneRetrying ? 'Retrying...' : failedPhone ? 'Retry provisioning' : 'Provision included number'}
                    </button>
                    {failedPhone && <span className="faint" style={{ fontSize: 12 }}>If it fails again, contact Support with the time of the attempt.</span>}
                  </div>
                )}
              </div>
            </section>

            {error && <p style={{ fontSize: 13.5, color: '#c0392b', fontWeight: 700 }}>{error}</p>}
            {success && <p style={{ fontSize: 13.5, color: 'var(--g-700)', fontWeight: 800 }}>Settings saved successfully.</p>}
          </form>

          <aside className="col settings-aside" style={{ gap: 14, position: 'sticky', top: 24 }}>
            <section className="card" style={{ padding: 20, borderRadius: 8 }}>
              <div className="row" style={{ gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', color: 'var(--g-700)' }}>
                  <Icon name="building" size={21} />
                </span>
                <div className="col" style={{ minWidth: 0 }}>
                  <span className="ellip" style={{ fontWeight: 800, fontSize: 15 }}>{form.orgName || 'Organisation'}</span>
                  <span className="faint" style={{ fontSize: 12.5 }}>{form.orgWebsite || 'No website set'}</span>
                </div>
              </div>
              <hr className="divider" style={{ margin: '18px 0' }} />
              {[
                ['User', [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Not set'],
                ['Tone', TONES.find((tone) => tone.value === form.tone)?.label || form.tone],
                ['Daily cap', `${form.dailyEmailSendCap || 0} emails`],
                ['Reply approval', form.autoApproveReplies ? 'Automatic' : 'Manual review'],
              ].map(([label, value]) => (
                <div key={label} className="row spread" style={{ gap: 12, padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <span className="faint" style={{ fontSize: 12.5, fontWeight: 800 }}>{label}</span>
                  <span className="ellip" style={{ fontSize: 13, fontWeight: 800, textAlign: 'right', maxWidth: 170 }}>{value}</span>
                </div>
              ))}
            </section>

            <section className="card" style={{ padding: 18, borderRadius: 8, background: 'var(--g-50)', borderColor: 'var(--g-100)' }}>
              <div className="row" style={{ gap: 8, fontWeight: 800, fontSize: 13 }}>
                <Icon name="checkCircle" size={16} color="var(--g-700)" />
                Workspace defaults
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.5 }}>
                These settings feed campaign generation, reply handling, and booking prompts across the app.
              </p>
            </section>

            <section className="card" style={{ padding: 18, borderRadius: 8 }}>
              <div className="row" style={{ gap: 8, fontWeight: 800, fontSize: 13 }}>
                <Icon name="send" size={16} color="var(--g-700)" />
                Campaign launch readiness
              </div>
              <div className="col" style={{ gap: 10, marginTop: 14 }}>
                {[
                  ['Email account connected', emailConnectionReady],
                  ['Backend API', systemStatus.backend?.running],
                  ['Redis jobs', systemStatus.redis?.connected],
                  ['Reply approval', true],
                ].map(([label, ready]) => (
                  <div key={label} className="row spread" style={{ gap: 12 }}>
                    <span className="faint" style={{ fontSize: 12.5, fontWeight: 800 }}>{label}</span>
                    <span style={{ color: ready ? 'var(--g-700)' : 'var(--muted)', fontWeight: 900, fontSize: 12 }}>
                      {systemLoading && label !== 'Email account connected' ? 'Checking' : ready ? 'Ready' : 'Needed'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.45 }}>
                Redis must be running for delayed email sequence jobs and inbox polling.
              </p>
            </section>

            <section className="card" data-tour="settings-tour" style={{ padding: 18, borderRadius: 8 }}>
              <div className="row" style={{ gap: 8, fontWeight: 800, fontSize: 13 }}>
                <Icon name="play" size={16} color="var(--g-700)" />
                Guided tour
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.5 }}>
                Replay the walkthrough of the dashboard, AI agent, prospects, campaigns, inbox, meetings,
                and analytics. Useful when someone new joins your team, or to revisit a section you skipped.
              </p>
              <div className="col" style={{ gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => startTour({ restart: true })}>
                  <Icon name="play" size={14} /> Restart tour
                </button>
                <Link href="/setup" className="btn btn-ghost btn-sm">
                  <Icon name="checkCircle" size={14} /> Open setup checklist
                </Link>
              </div>
            </section>

            <section className="card" style={{ padding: 18, borderRadius: 8 }}>
              <div className="row" style={{ gap: 8, fontWeight: 800, fontSize: 13 }}>
                <Icon name="chat" size={16} color="var(--g-700)" />
                Help and resources
              </div>
              <div className="settings-resource-grid" style={{ marginTop: 12 }}>
                {HELP_LINKS.map(link => (
                  <Link key={link.href} href={link.href} className="settings-resource-link">
                    <span className="row" style={{ gap: 9, minWidth: 0 }}>
                      <Icon name={link.ico} size={15} color="var(--muted)" />
                      {link.label}
                    </span>
                    <Icon name="arrow" size={14} color="var(--faint)" />
                  </Link>
                ))}
              </div>
              <div className="settings-legal-links">
                {LEGAL_LINKS.map(link => (
                  <Link key={link.href} href={link.href}>{link.label}</Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
