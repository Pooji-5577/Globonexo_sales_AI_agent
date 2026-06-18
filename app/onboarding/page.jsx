"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/ui/Logo";
import Aurora from "../../components/ui/Aurora";
import Icon from "../../components/ui/Icon";
import Field from "../../components/ui/Field";
import api from "../../lib/api";

const STEPS = [
  { title: 'Your product', sub: 'Help Nexo understand what you sell.', ico: 'doc' },
  { title: 'Who you target', sub: 'Define your ideal customer profile.', ico: 'target' },
  { title: 'Review & launch', sub: "Everything looks right? Let's go.", ico: 'checkCircle' },
];

const DEFAULTS = {
  role: 'Account Executive',
  productDescription: '',
  valueProp: '',
  titles: [],
  companySizes: [],
  geos: [],
  tone: 'Consultative',
  hookStyle: 'Pain-based (problem-first)',
  agentName: 'Nexo',
  bookingLink: '',
};

function OSelect({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="row wrap" style={{ gap: 9 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            height: 40, padding: '0 16px', borderRadius: 'var(--r-pill)', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
            border: '1.5px solid ' + (value === o ? 'var(--g-400)' : 'var(--line)'),
            background: value === o ? 'var(--g-50)' : '#fff',
            color: value === o ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .13s',
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function OMulti({ label, hint, options, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>{hint}</span>}
      <div className="row wrap" style={{ gap: 9 }}>
        {options.map(o => {
          const on = value.includes(o);
          return (
            <button key={o} onClick={() => onChange(o)} style={{
              height: 40, padding: '0 16px', borderRadius: 'var(--r-pill)', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
              border: '1.5px solid ' + (on ? 'var(--g-400)' : 'var(--line)'),
              background: on ? 'var(--g-50)' : '#fff',
              color: on ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .13s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {on && <Icon name="check" size={14} color="var(--g-600)" stroke={2.5} />}{o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k, v) => setD(prev => ({
    ...prev,
    [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v],
  }));

  const next = () => setStep(s => s + 1);
  const back = () => step > 0 ? setStep(s => s - 1) : router.push('/signup');

  const launch = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/onboarding', {
        productDescription: d.productDescription,
        valueProp: d.valueProp,
        tone: d.tone,
        hookStyle: d.hookStyle,
        icpTitles: d.titles,
        icpCompanySizes: d.companySizes,
        icpGeos: d.geos,
        agentName: d.agentName,
        bookingLink: d.bookingLink || undefined,
      });
    } catch (err) {
      // If the API returns a validation error, surface it. Otherwise proceed
      // (backend may not be running yet during local frontend dev).
      const status = err?.response?.status;
      if (status >= 400 && status < 500) {
        setLoading(false);
        setError(err?.response?.data?.message || 'Please check your inputs and try again.');
        return;
      }
    }
    router.push('/celebrate');
  };

  const pct = (step / (STEPS.length - 1)) * 100;
  const s = STEPS[step];

  const reviewRows = [
    { l: 'Role', v: d.role },
    { l: 'Product', v: d.productDescription || '—' },
    { l: 'Value prop', v: d.valueProp || '—' },
    { l: 'Target titles', v: d.titles.join(', ') || '—' },
    { l: 'Target market', v: d.companySizes.join(', ') || '—' },
    { l: 'Geographies', v: d.geos.join(', ') || '—' },
    { l: 'Tone', v: d.tone },
    { l: 'Agent name', v: d.agentName },
  ];

  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      {/* Left sidebar */}
      <div style={{
        width: 280, flex: 'none', background: 'linear-gradient(170deg,#06311f,#085c40)',
        color: '#fff', display: 'flex', flexDirection: 'column', padding: '32px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <Aurora />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={30} light />
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 18, letterSpacing: '.06em', textTransform: 'uppercase' }}>Setup steps</div>
            <div className="col" style={{ gap: 4 }}>
              {STEPS.map((st, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} className="row" style={{ gap: 12, padding: '10px 10px', borderRadius: 12, background: active ? 'rgba(255,255,255,.12)' : 'transparent', cursor: done ? 'pointer' : 'default' }}
                    onClick={() => done && setStep(i)}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', flex: 'none',
                      display: 'grid', placeItems: 'center',
                      background: done ? 'var(--g-500)' : active ? '#fff' : 'rgba(255,255,255,.12)',
                      color: done ? '#06231a' : active ? 'var(--ink)' : 'rgba(255,255,255,.5)',
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {done ? <Icon name="check" size={14} color="#06231a" stroke={3} /> : i + 1}
                    </span>
                    <span className="nw" style={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? '#fff' : done ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)' }}>
                      {st.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: pct + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width .4s ease' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.55)' }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grow col" style={{ background: '#fff', minWidth: 0 }}>
        <div className="scroll grow" style={{ padding: '44px 56px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 0 }}>
          <div style={{ width: '100%', maxWidth: 560, animation: 'rise .35s both' }} key={step}>
            <div className="row" style={{ gap: 14, marginBottom: 28 }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon name={s.ico} size={26} color="var(--g-600)" />
              </span>
              <div className="col">
                <h2 className="display" style={{ fontSize: 26 }}>{s.title}</h2>
                <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>{s.sub}</p>
              </div>
            </div>

            {/* Step 0: Your product */}
            {step === 0 && (
              <div className="col" style={{ gap: 22 }}>
                <OSelect label="Your role" value={d.role} onChange={v => set('role', v)}
                  options={['Account Executive', 'SDR / BDR', 'Sales Manager', 'VP of Sales', 'Founder / CEO', 'RevOps']} />
                <div className="field">
                  <label>What does your product do?</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. Northwind is a sales engagement platform that helps B2B teams automate outbound prospecting using AI."
                    value={d.productDescription}
                    onChange={e => set('productDescription', e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
                  />
                  <span className="faint" style={{ fontSize: 12.5 }}>Used by Nexo to personalize every email it sends.</span>
                </div>
                <div className="field">
                  <label>Why do customers choose you?</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. 3x more meetings than traditional outreach tools, with zero manual effort from your team."
                    value={d.valueProp}
                    onChange={e => set('valueProp', e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
                  />
                  <span className="faint" style={{ fontSize: 12.5 }}>Your core value proposition — what makes you different.</span>
                </div>
              </div>
            )}

            {/* Step 1: Who you target */}
            {step === 1 && (
              <div className="col" style={{ gap: 24 }}>
                <OMulti label="Job titles you target" hint="Nexo will prioritize these roles in outreach."
                  options={['CEO / Founder', 'VP Sales', 'Head of Sales', 'Sales Manager', 'CTO', 'VP Marketing', 'RevOps / SalesOps', 'Director of Ops']}
                  value={d.titles} onChange={v => toggle('titles', v)} />
                <OMulti label="Target company sizes"
                  options={['Startup (1–20)', 'SMB (21–200)', 'Mid-Market (201–1k)', 'Enterprise (1k+)']}
                  value={d.companySizes} onChange={v => toggle('companySizes', v)} />
                <OMulti label="Geographies"
                  options={['North America', 'Europe', 'APAC', 'LATAM', 'Middle East', 'Global']}
                  value={d.geos} onChange={v => toggle('geos', v)} />
                <OSelect label="Writing tone" value={d.tone} onChange={v => set('tone', v)}
                  options={['Consultative', 'Direct & concise', 'Friendly & warm', 'Challenger', 'Formal']} />
                <OSelect label="Opening hook style" value={d.hookStyle} onChange={v => set('hookStyle', v)}
                  options={['Pain-based (problem-first)', 'Insight-based (data/trend)', 'Social proof (customer story)', 'Personalized signal (news/hire)', 'Question-led']} />
              </div>
            )}

            {/* Step 2: Review & launch */}
            {step === 2 && (
              <div className="col" style={{ gap: 20 }}>
                <Field label="Agent name" icon="spark" placeholder="Nexo" value={d.agentName} onChange={e => set('agentName', e.target.value)}
                  hint="What your AI agent is called inside the app." />
                <Field label="Booking link (optional)" icon="link" placeholder="https://cal.com/yourname"
                  value={d.bookingLink} onChange={e => set('bookingLink', e.target.value)}
                  hint="Nexo will include this when a prospect is ready to book." />
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>Your setup summary</span>
                  </div>
                  {reviewRows.map((r, i) => (
                    <div key={i} className="row spread" style={{ padding: '11px 16px', borderBottom: i < reviewRows.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                      <span className="faint" style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</span>
                      <span style={{ fontWeight: 700, fontSize: 13.5, textAlign: 'right', maxWidth: 300, color: 'var(--ink-2)' }}>{r.v}</span>
                    </div>
                  ))}
                </div>
                {error && (
                  <div style={{ padding: '12px 16px', borderRadius: 'var(--r-md)', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13.5, fontWeight: 600 }}>
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="row spread" style={{ padding: '16px 56px 28px', borderTop: '1px solid var(--line)', flex: 'none' }}>
          <button className="btn btn-ghost" onClick={back} disabled={loading}>
            <Icon name="arrowLeft" size={17} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={next}>
              Continue <Icon name="arrow" size={18} color="#06231a" />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={launch} disabled={loading}
              style={{ background: 'linear-gradient(135deg,var(--g-400),var(--teal))', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Launching…' : <><Icon name="bolt" size={18} color="#06231a" /> Launch my agent</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
