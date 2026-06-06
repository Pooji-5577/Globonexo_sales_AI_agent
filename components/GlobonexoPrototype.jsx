"use client";

import React, { useEffect, useRef, useState } from "react";

const useStateS = useState;
const useRefS = useRef;
const useEffectS = useEffect;
const useStateA = useState;
const useStateO = useState;
const useStateSA = useState;
const useStateSB = useState;

function getAgentName() {
  if (typeof window === "undefined") return "Nexo";
  return window.__agentName || "Nexo";
}

/* Icons — consistent stroke set. Exposed on window.Icon */
const Icon = ({ name, size = 22, stroke = 1.8, color = 'currentColor', fill = 'none', style }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z"/></>,
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4M6.2 6.3A18 18 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-0.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    google: <><path d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" stroke="none"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4L6.4 14Z" fill="#FBBC05" stroke="none"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 12 2 10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4 5.6-4Z" fill="#EA4335" stroke="none"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6"/>,
    check: <path d="m4 12 5 5L20 6"/>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    chat: <path d="M21 11.5a8 8 0 0 1-11.6 7.1L3 20l1.4-6.4A8 8 0 1 1 21 11.5Z"/>,
    users: <><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.2A3.2 3.2 0 0 1 16 11M21 20a6 6 0 0 0-4-5.6"/></>,
    funnel: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>,
    cog: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4 7.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
    send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></>,
    phone: <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>,
    trend: <path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5"/>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></>,
    play: <path d="M7 4v16l13-8L7 4Z" fill="currentColor" stroke="none"/>,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none"/></>,
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    link: <><path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1M13 18l-1 1a4 4 0 0 1-6-6l1-1"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/></>,
    sliders: <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></>,
    star: <path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3Z"/>,
    inbox: <><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-7Z"/></>,
    flame: <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.6-2.7 1.3-3.6.4 1 1.2 1.6 1.7 1.6 0-2 .5-5 2-7Z"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
};

/* Shared components → window */

/* ---- Brand logo ---- */
function Logo({ size = 34, showWord = true, light = false }) {
  return (
    <div className="row" style={{ gap: 11, alignItems: 'center' }}>
      <div style={{ width: size, height: size, position: 'relative', flex: 'none' }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="lg" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#29d68f"/><stop offset=".5" stopColor="#00c27a"/><stop offset="1" stopColor="#15c4c0"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lg)"/>
          <path d="M27 14.5a8.5 8.5 0 1 0 1.9 8.7" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="20" cy="20" r="3.1" fill="#fff"/>
          <path d="M20 6.5v4M20 29.5v4M6.5 20h4M29.5 20h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".9"/>
        </svg>
      </div>
      {showWord && (
        <div className="col" style={{ lineHeight: 1 }}>
          <span className="display" style={{ fontSize: size * .47, fontWeight: 600, letterSpacing: '-.02em', color: light ? '#fff' : 'var(--ink)' }}>Globonexo</span>
          <span style={{ fontSize: size * .26, fontWeight: 700, color: light ? 'var(--g-300)' : 'var(--g-700)', letterSpacing: '.02em', marginTop: 2 }}>Sales AI</span>
        </div>
      )}
    </div>
  );
}

/* ---- Aurora backdrop ---- */
function Aurora() {
  return (
    <div className="aurora">
      <span className="a1"/><span className="a2"/><span className="a3"/>
    </div>
  );
}

/* ---- Input field ---- */
function Field({ label, icon, type = 'text', placeholder, value, onChange, toggle, hint }) {
  const [show, setShow] = useState(false);
  const realType = toggle ? (show ? 'text' : 'password') : type;
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        {icon && <span className="lead-ico"><Icon name={icon} size={19} /></span>}
        <input
          className={'input' + (icon ? ' has-ico' : '')}
          type={realType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {toggle && (
          <button className="trail" type="button" onClick={() => setShow(s => !s)} aria-label="toggle password">
            <Icon name={show ? 'eyeoff' : 'eye'} size={19} />
          </button>
        )}
      </div>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{hint}</span>}
    </div>
  );
}

/* ---- Avatar (initials) ---- */
function Avatar({ name = '', size = 38, src, ring }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hues = ['#00c27a', '#15c4c0', '#7c8bf0', '#f0a93c', '#ef6f8e'];
  const hue = hues[(name.charCodeAt(0) || 0) % hues.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flex: 'none',
      display: 'grid', placeItems: 'center', fontWeight: 800,
      fontSize: size * .38, color: '#fff',
      background: src ? `center/cover url(${src})` : `linear-gradient(140deg, ${hue}, ${hue}cc)`,
      boxShadow: ring ? '0 0 0 3px #fff, 0 0 0 5px var(--g-300)' : 'none',
      fontFamily: 'var(--font-body)',
    }}>
      {!src && initials}
    </div>
  );
}

/* ---- Segmented control ---- */
function Segmented({ options, value, onChange }) {
  return (
    <div className="row" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-pill)', padding: 4, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          height: 34, padding: '0 16px', borderRadius: 'var(--r-pill)',
          fontSize: 13.5, fontWeight: 700,
          color: value === o.value ? '#06231a' : 'var(--muted)',
          background: value === o.value ? '#fff' : 'transparent',
          boxShadow: value === o.value ? 'var(--sh-xs)' : 'none',
          transition: 'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

/* ---- Animated counter ---- */
function Counter({ to, dur = 900, prefix = '', suffix = '', decimals = 0 }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}

/* ---- Typing dots ---- */
function Typing() {
  return (
    <div className="row" style={{ gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--g-500)',
          animation: 'pulse-dot 1.1s infinite', animationDelay: `${i * .18}s`,
        }} />
      ))}
    </div>
  );
}

/* Auth screens only (splash, login, signup, forgot) → window */

function AuthAside({ kicker, headline, sub, bullets }) {
  return (
    <div style={{
      position: 'relative', width: 420, flex: 'none', overflow: 'hidden',
      background: 'linear-gradient(160deg, #06311f, #064d33 55%, #066b4a)',
      color: '#fff', padding: '42px 40px', display: 'flex', flexDirection: 'column',
    }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Logo size={32} light />
        <div style={{ marginTop: 'auto' }}>
          <div className="eyebrow" style={{ color: 'var(--g-300)' }}>{kicker}</div>
          <h1 className="display" style={{ fontSize: 38, marginTop: 14, color: '#fff', maxWidth: 320, lineHeight: 1.08 }}>{headline}</h1>
          <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.5, color: 'rgba(255,255,255,.78)', maxWidth: 310 }}>{sub}</p>
          <div className="col" style={{ gap: 12, marginTop: 28 }}>
            {bullets.map((b, i) => (
              <div key={i} className="row" style={{ gap: 11 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name="check" size={14} color="#6fe7b0" stroke={2.8} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 36, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.14)' }}>
          <div className="row">
            {['Mara Ito', 'Devon Cole', 'Priya Raman'].map((n, i) => (
              <div key={n} style={{ marginLeft: i ? -9 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px #064d33' }}>
                <Avatar name={n} size={28} />
              </div>
            ))}
          </div>
          <span className="nw" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>4,200+ revenue teams</span>
        </div>
      </div>
    </div>
  );
}

/* ============ SPLASH ============ */
function Splash({ go }) {
  const steps = [
    { icon: 'target', title: 'Find & qualify', text: 'Scans millions of signals to find your ideal buyers and qualify them automatically.' },
    { icon: 'doc', title: 'Write & outreach', text: 'Writes personalized messages that start conversations and follows up at the right time.' },
    { icon: 'chat', title: 'Handle replies', text: 'Replies like a human, answers questions, and keeps every prospect moving.' },
    { icon: 'calendar', title: 'Book meetings', text: 'Qualifies interest and books meetings directly on your team’s calendar.' },
  ];

  const outcomes = [
    { value: '3.2x', label: 'More meetings booked' },
    { value: '75%', label: 'Reply-rate increase' },
    { value: '40+', label: 'Hours saved per rep/month' },
    { value: '2–4 weeks', label: 'Time to first meetings' },
  ];

  const upcoming = [
    { day: 'Tomorrow', date: '10', name: 'Devon Cole', company: 'Brightloop', type: 'Product demo', color: '#e5aa43' },
    { day: 'Wed', date: '11', name: 'Amir Haddad', company: 'Acme', type: 'Follow-up call', color: '#70c98c' },
    { day: 'Thu', date: '12', name: 'Lena Park', company: 'Cobalt', type: 'Technical review', color: '#69c2c0' },
  ];

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="screen landing-screen">
      <div className="landing-scroll">
        <section className="landing-hero">
          <Aurora />
          <nav className="landing-nav">
            <button onClick={() => scrollTo('landing-top')} aria-label="Globonexo home"><Logo size={34} light /></button>
            <div className="landing-nav-links">
              <button onClick={() => scrollTo('product')}>Product</button>
              <button onClick={() => scrollTo('how-it-works')}>How it works</button>
              <button onClick={() => scrollTo('results')}>Results</button>
              <button onClick={() => scrollTo('pricing')}>Pricing</button>
            </div>
            <div className="landing-nav-actions">
              <button className="landing-signin" onClick={() => go('login')}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => go('signup')}>
                Start free trial <Icon name="arrow" size={16} color="#06231a" />
              </button>
            </div>
          </nav>

          <div id="landing-top" className="landing-hero-inner">
            <div className="landing-hero-copy">
              <h1 className="display">
                Your AI sales rep.
                <span>Always prospecting.</span>
                <span>Always closing.</span>
              </h1>
              <p>Finds buyers, writes outreach, handles replies, and books meetings while your team focuses on closing.</p>
              <div className="landing-hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => go('signup')}>
                  Start free trial <Icon name="arrow" size={18} color="#06231a" />
                </button>
                <button className="landing-outline-btn" onClick={() => go('login')}>Sign in</button>
              </div>
              <div className="landing-assurances">
                <span><Icon name="check" size={15} color="var(--g-300)" /> No credit card required</span>
                <span><Icon name="check" size={15} color="var(--g-300)" /> Live in 5 minutes</span>
              </div>
            </div>

            <div id="product" className="landing-product-shell">
              <div className="landing-product-sidebar">
                <Logo size={25} />
                <button className="landing-mini-campaign"><Icon name="plus" size={12} /> New campaign</button>
                {[
                  ['grid', 'Dashboard'],
                  ['spark', 'AI Agent'],
                  ['users', 'Prospects'],
                  ['funnel', 'Pipeline'],
                  ['send', 'Campaigns'],
                  ['inbox', 'Inbox'],
                  ['calendar', 'Meetings'],
                  ['trend', 'Analytics'],
                ].map(([icon, label]) => (
                  <div key={label} className={'landing-mini-nav ' + (label === 'Meetings' ? 'active' : '')}>
                    <Icon name={icon} size={13} /> <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="landing-product-main">
                <div className="landing-product-topbar">
                  <div><Icon name="search" size={13} /> Search leads, accounts, replies...</div>
                  <Avatar name="Mara Ito" size={24} />
                </div>
                <div className="landing-product-body">
                  <div className="landing-product-title">
                    <div><strong>Meetings</strong><span>18 booked this week · 3 today</span></div>
                    <button><Icon name="plus" size={12} /> Schedule meeting</button>
                  </div>
                  <div className="landing-today">
                    <span>Today · 1 meeting</span>
                    <div>
                      <Avatar name="Mara Ito" size={28} />
                      <p><strong>Discovery call</strong><small>Mara Ito · Northwind · 2:30 PM</small></p>
                      <button>Join call</button>
                    </div>
                  </div>
                  <span className="landing-list-label">Upcoming</span>
                  <div className="landing-upcoming">
                    {upcoming.map((meeting) => (
                      <div key={meeting.name}>
                        <time><b>{meeting.day}</b><strong>{meeting.date}</strong></time>
                        <span className="landing-preview-avatar" style={{ background: meeting.color }}>{meeting.name.split(' ').map(n => n[0]).join('')}</span>
                        <p><strong>{meeting.type}</strong><small>{meeting.name} · {meeting.company} · 30 min</small></p>
                        <em>Upcoming</em>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-how landing-section">
          <div className="landing-section-intro">
            <h2 className="display">How it works</h2>
            <p>Your AI agent runs end-to-end, so your team can focus on closing.</p>
          </div>
          <div className="landing-steps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <div className="landing-step-icon"><Icon name={step.icon} size={22} color="var(--g-800)" /></div>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="results" className="landing-results landing-section">
          <div className="landing-results-copy">
            <h2 className="display">Results that compound</h2>
            <p>More pipeline, more meetings, and more closed deals without adding more manual work.</p>
          </div>
          <div className="landing-outcomes">
            {outcomes.map((outcome) => (
              <div key={outcome.label}><strong>{outcome.value}</strong><span>{outcome.label}</span></div>
            ))}
          </div>
        </section>

        <section id="pricing" className="landing-cta landing-section">
          <div>
            <h2 className="display">Start your free trial</h2>
            <p>Hire your AI sales rep in five minutes. No credit card required.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => go('signup')}>
            Start free trial <Icon name="arrow" size={18} color="#06231a" />
          </button>
        </section>

        <footer className="landing-footer landing-section">
          <Logo size={30} />
          <div>
            <button onClick={() => scrollTo('product')}>Product</button>
            <button onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button onClick={() => scrollTo('results')}>Results</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
          </div>
          <span>© 2026 Globonexo, Inc.</span>
        </footer>
      </div>
    </div>
  );
}

/* ============ LOGIN ============ */
function Login({ go }) {
  const [email, setEmail] = useStateA('mara@northwind.io');
  const [pw, setPw] = useStateA('••••••••••');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Welcome back"
        headline="Your pipeline ran all night."
        sub="While you were away, your agent sent 84 emails, handled 19 replies and booked 3 meetings."
        bullets={['Autonomous outreach & follow-up', 'Real-time buying-intent signals', 'Meetings booked on autopilot']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <h2 className="display" style={{ fontSize: 30 }}>Sign in</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Welcome back. Let's get to work.</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 26 }}>
            <Icon name="google" size={19} /> Continue with Google
          </button>
          <div className="row center" style={{ gap: 14, margin: '20px 0' }}>
            <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
          </div>
          <div className="col" style={{ gap: 16 }}>
            <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Field label="Password" icon="lock" toggle placeholder="Your password" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="row spread" style={{ marginTop: 14 }}>
            <label className="row nw" style={{ gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16 }} /> Remember me
            </label>
            <button onClick={() => go('forgot')} className="nw" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--g-700)' }}>Forgot password?</button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => go('dashboard')}>
            Sign in <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
            New to Globonexo? <button onClick={() => go('signup')} className="nw" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ SIGN UP ============ */
function Signup({ go }) {
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
          <h2 className="display" style={{ fontSize: 30 }}>Create your account</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Let's build your autonomous pipeline.</p>
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
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => go('onboarding')}>
            Create account <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
            Already have an account? <button onClick={() => go('login')} style={{ color: 'var(--g-700)', fontWeight: 800 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ FORGOT PASSWORD ============ */
function Forgot({ go }) {
  const [sent, setSent] = useStateA(false);
  const [email, setEmail] = useStateA('');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Account recovery"
        headline="Let's get you back in."
        sub="We'll email a secure link to reset your password. Expires in 15 minutes."
        bullets={['Encrypted reset link', 'No password shown to support', 'Back in under a minute']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <button className="row" onClick={() => go('login')} style={{ gap: 8, color: 'var(--muted)', fontWeight: 700, fontSize: 14, marginBottom: 22 }}>
            <Icon name="arrowLeft" size={17} /> Back to sign in
          </button>
          {!sent ? (
            <>
              <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name="lock" size={26} color="var(--g-600)" />
              </span>
              <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Reset password</h2>
              <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Enter your work email and we'll send a reset link.</p>
              <div style={{ marginTop: 24 }}>
                <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => setSent(true)}>
                Send reset link <Icon name="send" size={17} color="#06231a" />
              </button>
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
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }} onClick={() => go('login')}>
                Back to sign in
              </button>
              <button className="btn btn-block" style={{ marginTop: 10, color: 'var(--g-700)', fontWeight: 700 }} onClick={() => setSent(false)}>
                Didn't get it? Resend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 7-step onboarding wizard + celebration → window */

const STEPS = [
  { title: 'About you', sub: 'Personalize your agent from the start.', ico: 'user' },
  { title: 'Your team', sub: 'Context that shapes how Nexo targets.', ico: 'users' },
  { title: 'Who you sell to', sub: 'Define your ideal customer profile.', ico: 'target' },
  { title: 'Your goals', sub: 'Set the targets Nexo optimizes for.', ico: 'trend' },
  { title: 'Your tone', sub: 'Make the agent sound like you.', ico: 'spark' },
  { title: 'Connect your tools', sub: 'Nexo works best with your stack.', ico: 'link' },
  { title: 'Review & launch', sub: 'Everything looks right? Let\'s go.', ico: 'checkCircle' },
];

const DEFAULTS = {
  firstName: 'Mara', lastName: 'Ito', role: 'Account Executive', company: 'Northwind',
  industry: 'SaaS / Software', companySize: '51–200', teamSize: '6–15',
  titles: ['VP Sales', 'Head of Sales'], companySizes: ['SMB', 'Mid-Market'], geos: ['North America'],
  meetingTarget: 15, dealSize: '$25k–$100k', salesCycle: '1–3 months',
  tone: 'Consultative', hook: 'Pain-based', followup: 'Standard 5-day',
  tools: ['Gmail', 'HubSpot', 'Google Calendar'],
  agentName: 'Nexo',
};

function OnboardingWizard({ go }) {
  const [step, setStep] = useStateO(0);
  const [d, setD] = useStateO(DEFAULTS);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k, v) => setD(prev => ({
    ...prev,
    [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v],
  }));

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : go('celebrate');
  const back = () => step > 0 ? setStep(step - 1) : go('signup');

  const s = STEPS[step];
  const pct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      {/* Left progress rail */}
      <div style={{
        width: 300, flex: 'none', background: 'linear-gradient(170deg,#06311f,#085c40)',
        color: '#fff', display: 'flex', flexDirection: 'column', padding: '32px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <Aurora />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={30} light />
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: 20, letterSpacing: '.05em', textTransform: 'uppercase' }}>Setup steps</div>
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
                    <span className="nw" style={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? '#fff' : done ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.45)' }}>
                      {st.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 28, position: 'relative' }}>
            <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: pct + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width .4s ease' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="grow col" style={{ background: '#fff', minWidth: 0 }}>
        <div className="scroll grow" style={{ padding: '44px 56px 24px' }}>
          <div style={{ maxWidth: 560, animation: 'rise .35s both' }} key={step}>
            {/* Step header */}
            <div className="row" style={{ gap: 14, marginBottom: 28 }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon name={s.ico} size={26} color="var(--g-600)" />
              </span>
              <div className="col">
                <h2 className="display" style={{ fontSize: 26 }}>{s.title}</h2>
                <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>{s.sub}</p>
              </div>
            </div>

            {/* Step content */}
            {step === 0 && <Step0 d={d} set={set} />}
            {step === 1 && <Step1 d={d} set={set} />}
            {step === 2 && <Step2 d={d} toggle={toggle} />}
            {step === 3 && <Step3 d={d} set={set} />}
            {step === 4 && <Step4 d={d} set={set} />}
            {step === 5 && <Step5 d={d} toggle={toggle} />}
            {step === 6 && <Step6 d={d} set={set} go={go} />}
          </div>
        </div>
        {/* Nav buttons */}
        <div className="row spread" style={{ padding: '16px 56px 28px', borderTop: '1px solid var(--line)', flex: 'none' }}>
          <button className="btn btn-ghost" onClick={back}>
            <Icon name="arrowLeft" size={17} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={next}>
              Continue <Icon name="arrow" size={18} color="#06231a" />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => go('celebrate')} style={{ background: 'linear-gradient(135deg,var(--g-400),var(--teal))' }}>
              <Icon name="bolt" size={18} color="#06231a" /> Launch my agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----- Step 0: About you ----- */
function Step0({ d, set }) {
  return (
    <div className="col" style={{ gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="First name" icon="user" placeholder="Mara" value={d.firstName} onChange={e => set('firstName', e.target.value)} />
        <Field label="Last name" placeholder="Ito" value={d.lastName} onChange={e => set('lastName', e.target.value)} />
      </div>
      <Field label="Company name" icon="building" placeholder="Northwind Inc." value={d.company} onChange={e => set('company', e.target.value)} />
      <OSelect label="Your role" value={d.role} onChange={v => set('role', v)}
        options={['Account Executive', 'SDR / BDR', 'Sales Manager', 'VP of Sales', 'Founder / CEO', 'RevOps']} />
    </div>
  );
}

/* ----- Step 1: Team context ----- */
function Step1({ d, set }) {
  return (
    <div className="col" style={{ gap: 22 }}>
      <OSelect label="Your industry" value={d.industry} onChange={v => set('industry', v)}
        options={['SaaS / Software', 'Financial services', 'Healthcare', 'Agency / Services', 'E-commerce', 'Manufacturing', 'Other']} />
      <OSelect label="Your company size" value={d.companySize} onChange={v => set('companySize', v)}
        options={['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+']} />
      <OSelect label="Sales team size" value={d.teamSize} onChange={v => set('teamSize', v)}
        options={['Solo', '2–5', '6–15', '16–50', '50+']} />
    </div>
  );
}

/* ----- Step 2: ICP ----- */
function Step2({ d, toggle }) {
  return (
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
    </div>
  );
}

/* ----- Step 3: Goals ----- */
function Step3({ d, set }) {
  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="field">
        <div className="row spread"><label>Meetings per week target</label><span style={{ fontWeight: 800, color: 'var(--g-700)', fontSize: 18 }}>{d.meetingTarget}</span></div>
        <input type="range" min={1} max={50} value={d.meetingTarget} onChange={e => set('meetingTarget', +e.target.value)} style={{ accentColor: 'var(--g-500)', width: '100%', marginTop: 8 }} />
        <span className="faint" style={{ fontSize: 12.5 }}>Nexo will pace daily outreach to hit this number.</span>
      </div>
      <OSelect label="Average deal size" value={d.dealSize} onChange={v => set('dealSize', v)}
        options={['Under $5k', '$5k–$25k', '$25k–$100k', '$100k–$500k', '$500k+']} />
      <OSelect label="Typical sales cycle" value={d.salesCycle} onChange={v => set('salesCycle', v)}
        options={['Under 1 week', '1–4 weeks', '1–3 months', '3–6 months', '6+ months']} />
    </div>
  );
}

/* ----- Step 4: Tone ----- */
function Step4({ d, set }) {
  return (
    <div className="col" style={{ gap: 24 }}>
      <OSelect label="Writing tone" value={d.tone} onChange={v => set('tone', v)}
        options={['Consultative', 'Direct & concise', 'Friendly & warm', 'Challenger', 'Formal']} />
      <OSelect label="Opening hook style" value={d.hook} onChange={v => set('hook', v)}
        options={['Pain-based (problem-first)', 'Insight-based (data/trend)', 'Social proof (customer story)', 'Personalized signal (news/hire)', 'Question-led']} />
      <OSelect label="Follow-up cadence" value={d.followup} onChange={v => set('followup', v)}
        options={['Aggressive (every 3 days)', 'Standard (every 5 days)', 'Gentle (every 7 days)', 'Custom (I\'ll configure later)']} />
      <div className="card" style={{ padding: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Sample opening line</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', fontStyle: 'italic' }}>
          "Hi [First Name] — noticed {d.company} is expanding into new markets. Most {d.role}s we talk to say their biggest challenge right now is booking enough qualified meetings. Worth a 20-min chat?"
        </p>
      </div>
    </div>
  );
}

/* ----- Step 5: Connect tools ----- */
function Step5({ d, toggle }) {
  const tools = [
    { t: 'Gmail', d: 'Send & track outreach emails', i: 'mail', group: 'Email' },
    { t: 'Outlook', d: 'Alternative email sender', i: 'mail', group: 'Email' },
    { t: 'HubSpot', d: 'Sync contacts, deals & activities', i: 'funnel', group: 'CRM' },
    { t: 'Salesforce', d: 'Enterprise CRM sync', i: 'funnel', group: 'CRM' },
    { t: 'Google Calendar', d: 'Auto-book meetings on open slots', i: 'calendar', group: 'Calendar' },
    { t: 'LinkedIn', d: 'Reach prospects via DM', i: 'users', group: 'Channels' },
    { t: 'Slack', d: 'Get notified on hot replies', i: 'chat', group: 'Notifications' },
  ];
  const groups = [...new Set(tools.map(t => t.group))];
  return (
    <div className="col" style={{ gap: 20 }}>
      {groups.map(g => (
        <div key={g}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{g}</div>
          <div className="col" style={{ gap: 8 }}>
            {tools.filter(t => t.group === g).map(c => {
              const on = d.tools.includes(c.t);
              return (
                <div key={c.t} className="row spread" style={{ padding: '12px 14px', border: '1.5px solid ' + (on ? 'var(--g-300)' : 'var(--line)'), borderRadius: 'var(--r-md)', background: on ? 'var(--g-50)' : '#fff', transition: 'all .14s' }}>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line)', color: on ? 'var(--g-600)' : 'var(--muted)' }}>
                      <Icon name={c.i} size={19} />
                    </span>
                    <div className="col">
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{c.t}</span>
                      <span className="faint" style={{ fontSize: 12 }}>{c.d}</span>
                    </div>
                  </div>
                  <button onClick={() => toggle('tools', c.t)} style={{
                    width: 44, height: 26, borderRadius: 99, padding: 3, flex: 'none',
                    background: on ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s',
                  }}>
                    <span style={{ display: 'block', width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.15)', transform: on ? 'translateX(18px)' : 'none', transition: 'transform .2s' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----- Step 6: Review ----- */
function Step6({ d, set }) {
  const rows = [
    { l: 'Name', v: `${d.firstName} ${d.lastName}` },
    { l: 'Role', v: d.role },
    { l: 'Company', v: d.company },
    { l: 'Industry', v: d.industry },
    { l: 'Target titles', v: d.titles.join(', ') || '—' },
    { l: 'Target market', v: d.companySizes.join(', ') || '—' },
    { l: 'Meeting goal', v: `${d.meetingTarget} / week` },
    { l: 'Deal size', v: d.dealSize },
    { l: 'Tone', v: d.tone },
    { l: 'Connected tools', v: d.tools.join(', ') || 'None' },
  ];
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="field">
        <label>Agent name</label>
        <div className="input-wrap">
          <span className="lead-ico"><Icon name="spark" size={19} /></span>
          <input className="input has-ico" value={d.agentName} onChange={e => set('agentName', e.target.value)} placeholder="Nexo" />
        </div>
        <span className="faint" style={{ fontSize: 12.5 }}>This is what your AI agent is called in the app.</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Your setup summary</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="row spread" style={{ padding: '11px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
            <span className="faint" style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</span>
            <span style={{ fontWeight: 700, fontSize: 13.5, textAlign: 'right', maxWidth: 280, color: 'var(--ink-2)' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- helpers ---- */
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

/* ============ CELEBRATION SCREEN ============ */
function CelebrationScreen({ go }) {
  const [tick, setTick] = useStateO(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    const stop = setTimeout(() => clearInterval(id), 2400);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, []);

  const items = [
    'ICP profile saved', 'Outreach templates generated', 'Cadence configured',
    'Tools connected', 'First 50 prospects queued', 'Agent ready',
  ];

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#f4fdf8,#e8f8f0 55%,#dff4ea)' }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '48px 40px', maxWidth: 580, animation: 'rise .5s both' }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', margin: '0 auto', boxShadow: '0 16px 40px rgba(0,194,122,.3)', animation: 'pop .6s both' }}>
          <Icon name="bolt" size={46} color="#06231a" />
        </div>
        <h1 className="display" style={{ fontSize: 46, marginTop: 24 }}>Your agent is ready.</h1>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.55, marginTop: 14, maxWidth: 440, marginInline: 'auto' }}>
          Nexo is fully configured and queuing your first outreach. Let's get those meetings in the calendar.
        </p>

        {/* Boot checklist */}
        <div className="card" style={{ padding: '14px 20px', marginTop: 28, textAlign: 'left' }}>
          {items.map((item, i) => {
            const done = tick > i * 4;
            return (
              <div key={item} className="row" style={{ gap: 12, padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: done ? 'var(--g-500)' : 'var(--bg-2)', transition: 'background .3s' }}>
                  {done ? <Icon name="check" size={13} color="#06231a" stroke={3} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--line)' }} />}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: done ? 'var(--ink)' : 'var(--faint)', transition: 'color .3s' }}>{item}</span>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary btn-lg" style={{ marginTop: 28 }} onClick={() => go('dashboard')}>
          Open dashboard <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </div>
    </div>
  );
}

/* App shell + Dashboard + Agent workspace → window */

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
      { id: 'agent', label: 'AI Agent', ico: 'spark' },
    ]
  },
  {
    label: 'Sales',
    items: [
      { id: 'prospects', label: 'Prospects', ico: 'users' },
      { id: 'pipeline', label: 'Pipeline', ico: 'funnel' },
      { id: 'campaigns', label: 'Campaigns', ico: 'send' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'inbox', label: 'Inbox', ico: 'inbox', badge: 9 },
      { id: 'meetings', label: 'Meetings', ico: 'calendar', badge: 3 },
    ]
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', ico: 'trend' },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', ico: 'star' },
      { id: 'settings', label: 'Settings', ico: 'sliders' },
    ]
  },
];

function AppShell({ tab, setTab, go, children }) {
  return (
    <div className="screen" style={{ flexDirection: 'row', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 248, flex: 'none', background: '#fff', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
        <div style={{ padding: '4px 6px 16px' }}><Logo size={28} /></div>
        <button className="btn btn-primary btn-sm" style={{ marginBottom: 14, fontSize: 13.5 }} onClick={() => setTab('campaigns')}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>

        <nav className="col scroll grow" style={{ gap: 0 }}>
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {g.label && <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', padding: '10px 10px 4px' }}>{g.label}</div>}
              {g.items.map(n => {
                const active = tab === n.id;
                return (
                  <button key={n.id} onClick={() => setTab(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 10px', width: '100%',
                    borderRadius: 10, fontWeight: 700, fontSize: 14, textAlign: 'left',
                    color: active ? '#06231a' : 'var(--ink-2)',
                    background: active ? 'var(--g-50)' : 'transparent',
                    boxShadow: active ? 'inset 0 0 0 1px var(--g-100)' : 'none', transition: 'all .12s',
                  }}>
                    <Icon name={n.ico} size={18} color={active ? 'var(--g-600)' : 'var(--muted)'} />
                    <span className="nw">{n.label}</span>
                    {n.badge && <span style={{ marginLeft: 'auto', background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '1px 7px', lineHeight: '18px' }}>{n.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Agent status */}
        <div className="card" style={{ marginTop: 8, padding: 12, background: 'linear-gradient(160deg,#06311f,#075a3e)', border: 'none', color: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#6fe7b0', animation: 'pulse-dot 1.4s infinite', boxShadow: '0 0 7px #6fe7b0', flex: 'none' }} />
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">Agent is working</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 5, lineHeight: 1.4 }}>Prospecting Tier-1 · next action 2m</p>
        </div>
        <button className="row nw" onClick={() => go('splash')} style={{ gap: 9, marginTop: 10, padding: '0 6px', height: 36, color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, flex: 'none' }}>
          <Icon name="logout" size={17} /> Log out
        </button>
      </aside>

      {/* Main */}
      <div className="grow col" style={{ minWidth: 0 }}>
        <header className="row spread" style={{ height: 62, flex: 'none', padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)' }}>
          <div className="input-wrap" style={{ width: 320 }}>
            <span className="lead-ico"><Icon name="search" size={17} /></span>
            <input className="input has-ico" style={{ height: 40, background: 'var(--bg)', fontSize: 14 }} placeholder="Search leads, accounts, replies…" />
          </div>
          <div className="row" style={{ gap: 14 }}>
            <button style={{ position: 'relative', color: 'var(--muted)' }}>
              <Icon name="bell" size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: 'var(--g-500)', boxShadow: '0 0 0 2px #fff' }} />
            </button>
            <div className="row" style={{ gap: 9 }}>
              <Avatar name="Mara Ito" size={34} />
              <div className="col" style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">Mara Ito</span>
                <span className="faint nw" style={{ fontSize: 11.5 }}>Northwind Inc.</span>
              </div>
            </div>
          </div>
        </header>
        <div className="grow" style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
      </div>
    </div>
  );
}

/* ===================== DASHBOARD ===================== */
const ACTIVITY = [
  { ico: 'send', text: 'Sent intro to Devon Cole · Brightloop', t: '2m', hot: false },
  { ico: 'chat', text: 'Positive reply from Mara Ito · Northwind', t: '14m', hot: true },
  { ico: 'target', text: '23 new accounts matched your ICP', t: '31m', hot: false },
  { ico: 'calendar', text: 'Meeting booked — Acme demo, Fri 9am', t: '1h', hot: true },
  { ico: 'send', text: 'Follow-up sent to Sara Nilsen · Polar Freight', t: '2h', hot: false },
  { ico: 'flame', text: 'Brightloop opened email 4× in 20 min', t: '3h', hot: true },
];

const TASKS = [
  { ico: 'chat', text: 'Approve reply to Mara Ito (Northwind)', cta: 'Review', hot: true },
  { ico: 'mail', text: 'Review 3 draft intros before sending', cta: 'Review', hot: false },
  { ico: 'calendar', text: 'Confirm Acme demo slot — Fri 9am', cta: 'Confirm', hot: false },
];

function Dashboard({ setTab }) {
  return (
    <div className="scroll grow" style={{ padding: '22px 24px', minHeight: 0 }}>
      {/* Welcome */}
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 26 }}>Good morning, Mara 👋</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>Your agent worked overnight. Here's where things stand.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setTab('agent')}>
          <Icon name="spark" size={16} color="#06231a" /> Talk to Nexo
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { k: 'Emails sent', v: '84', d: '+12 vs yesterday', ico: 'send', good: true },
          { k: 'Replies', v: '19', d: '22.6% reply rate', ico: 'chat', good: true },
          { k: 'Meetings', v: '3', d: 'booked today', ico: 'calendar', good: true },
          { k: 'Hot leads', v: '7', d: 'needs your attention', ico: 'flame', good: false },
          { k: 'Pipeline', v: '$1.24M', d: '+$56k this week', ico: 'trend', good: true },
        ].map(s => (
          <div key={s.k} className="card" style={{ padding: '14px 16px' }}>
            <div className="row spread">
              <span className="faint nw" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</span>
              <Icon name={s.ico} size={17} color="var(--g-600)" />
            </div>
            <div className="display" style={{ fontSize: 28, marginTop: 8, color: 'var(--ink)' }}>{s.v}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.good ? 'var(--g-700)' : '#d97706', marginTop: 4, display: 'block' }}>{s.d}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        {/* Activity feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="row spread" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Agent activity feed</span>
            <button onClick={() => setTab('agent')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--g-700)' }}>See all</button>
          </div>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="row" style={{ gap: 12, padding: '12px 18px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                <Icon name={a.ico} size={17} />
              </span>
              <span className="grow" style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-2)' }}>{a.text}</span>
              <span className="faint nw" style={{ fontSize: 12, fontWeight: 700 }}>{a.t}</span>
            </div>
          ))}
        </div>

        {/* Right col: tasks + goal */}
        <div className="col" style={{ gap: 14 }}>
          {/* Needs attention */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(90deg,var(--g-50),#fff)' }}>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="spark" size={16} color="var(--g-600)" />
                <span style={{ fontWeight: 800, fontSize: 14 }}>Needs your attention</span>
                <span style={{ marginLeft: 'auto', background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '1px 7px' }}>{TASKS.length}</span>
              </div>
            </div>
            {TASKS.map((t, i) => (
              <div key={i} className="row spread" style={{ padding: '11px 16px', borderBottom: i < TASKS.length - 1 ? '1px solid var(--line-2)' : 'none', gap: 10 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center', background: t.hot ? 'var(--g-50)' : 'var(--bg-2)', color: t.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                    <Icon name={t.ico} size={15} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.35 }}>{t.text}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12.5, height: 32, padding: '0 12px', flex: 'none' }}>{t.cta}</button>
              </div>
            ))}
          </div>

          {/* Weekly goal */}
          <div className="card" style={{ padding: 16, background: 'linear-gradient(160deg,#f4fdf8,#e8f8f0)' }}>
            <div className="row spread">
              <span style={{ fontWeight: 800, fontSize: 14 }}>Weekly meeting goal</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>18 / 25</span>
            </div>
            <div style={{ height: 8, background: '#fff', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '72%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width 1s ease' }} />
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>7 more meetings to hit your target. Nexo is on pace.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setTab('analytics')}>
              View analytics
            </button>
          </div>

          {/* Next meeting */}
          <div className="card" style={{ padding: 14 }}>
            <div className="eyebrow">Next meeting</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Northwind — Discovery call</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Today at 2:30 PM · 30 min</div>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <Avatar name="Mara Ito" size={28} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>with Mara Ito, VP Sales</span>
            </div>
            <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 12 }}>
              <Icon name="play" size={14} /> Join call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== AI AGENT ===================== */
const SEED_MSGS = [
  { who: 'agent', kind: 'text', text: "Morning, Mara 👋 Overnight I worked your Tier-1 list. Here's where things stand:" },
  { who: 'agent', kind: 'stats' },
  { who: 'agent', kind: 'text', text: "Northwind replied to our funding-angle email — asking about onboarding time. Want me to propose 3 meeting times and send a tailored reply?" },
  { who: 'agent', kind: 'draft' },
  { who: 'user', kind: 'text', text: "Looks great. Send it, and prioritize the accounts hiring SDRs." },
  { who: 'agent', kind: 'text', text: "Done ✅ Reply sent to Mara at Northwind. I've re-ranked your queue — 12 accounts actively hiring SDRs are now at the top. I'll book straight to your calendar when they reply." },
];

const QUICK = ['Draft follow-ups for no-replies', 'Find 50 new ICP accounts', 'Summarize hottest leads', 'Pause weekend sending'];

function AgentWorkspace() {
  const [msgs, setMsgs] = useStateS(SEED_MSGS);
  const [input, setInput] = useStateS('');
  const [typing, setTyping] = useStateS(false);
  const scrollRef = useRefS(null);
  const name = getAgentName();

  useEffectS(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const send = (text) => {
    const t = (text || input).trim(); if (!t) return;
    setMsgs(m => [...m, { who: 'user', kind: 'text', text: t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { who: 'agent', kind: 'text', text: "On it — I'll handle that and report back. Anything worth your attention will land in your Inbox with a summary." }]);
    }, 1400);
  };

  return (
    <div className="row" style={{ height: '100%', minHeight: 0 }}>
      <div className="grow col" style={{ minWidth: 0 }}>
        <div className="row spread" style={{ padding: '16px 24px 12px', flex: 'none', borderBottom: '1px solid var(--line)' }}>
          <div className="row" style={{ gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-green)', flex: 'none' }}>
              <Icon name="spark" size={22} color="#06231a" />
            </span>
            <div className="col">
              <div className="row" style={{ gap: 8 }}>
                <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{name}</span>
                <span className="chip"><span className="dot" style={{ animation: 'pulse-dot 1.4s infinite' }} /> Active</span>
              </div>
              <span className="faint" style={{ fontSize: 12.5 }}>Your autonomous sales agent</span>
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="scroll grow" style={{ padding: '16px 24px', minHeight: 0 }}>
          <div className="col" style={{ gap: 14, maxWidth: 700, margin: '0 auto', paddingBottom: 8 }}>
            {msgs.map((m, i) => <Bubble key={i} m={m} name={name} />)}
            {typing && (
              <div className="row" style={{ gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="spark" size={17} color="#06231a" /></span>
                <div className="card" style={{ padding: '10px 14px', borderTopLeftRadius: 4 }}><Typing /></div>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 'none', padding: '10px 24px 18px', borderTop: '1px solid var(--line)', background: '#fff' }}>
          <div className="row wrap" style={{ gap: 7, maxWidth: 700, margin: '0 auto 10px' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} className="chip" style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--line)', color: 'var(--ink-2)', height: 30, fontSize: 12.5 }}>
                <Icon name="bolt" size={12} color="var(--g-600)" /> {q}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 10, maxWidth: 700, margin: '0 auto' }}>
            <div className="input-wrap grow">
              <input className="input" style={{ height: 50 }} placeholder={`Ask ${name} to prospect, draft, or follow up…`} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            </div>
            <button className="btn btn-primary" style={{ width: 50, height: 50, padding: 0, borderRadius: 14, flex: 'none' }} onClick={() => send()}>
              <Icon name="send" size={19} color="#06231a" />
            </button>
          </div>
        </div>
      </div>

      {/* Right rail */}
      <aside className="scroll" style={{ width: 300, flex: 'none', borderLeft: '1px solid var(--line)', background: '#fff', padding: 18 }}>
        <span className="eyebrow">Today's impact</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[{ k: 'Emails sent', v: 84, ico: 'send' }, { k: 'Replies', v: 19, ico: 'chat' }, { k: 'Meetings', v: 3, ico: 'calendar' }, { k: 'Hot leads', v: 7, ico: 'flame' }].map(s => (
            <div key={s.k} className="card" style={{ padding: 12 }}>
              <Icon name={s.ico} size={16} color="var(--g-600)" />
              <div className="display" style={{ fontSize: 24, marginTop: 6 }}>{s.v}</div>
              <div className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.k}</div>
            </div>
          ))}
        </div>
        <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Live activity</span>
        <div className="col" style={{ gap: 2, marginTop: 10 }}>
          {[{ i: 'send', t: 'Sent to Devon Cole', s: 'Brightloop · 2m ago' }, { i: 'chat', t: 'Reply from Northwind', s: 'positive · 14m ago', hot: true }, { i: 'target', t: 'Found 23 new accounts', s: 'matching ICP · 31m ago' }, { i: 'calendar', t: 'Meeting booked', s: 'Acme demo, Fri · 1h ago' }].map((a, i) => (
            <div key={i} className="row" style={{ gap: 10, padding: '9px 6px', borderRadius: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                <Icon name={a.i} size={15} />
              </span>
              <div className="col" style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }} className="nw">{a.t}</span>
                <span className="faint" style={{ fontSize: 11.5 }}>{a.s}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 16, padding: 14, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
          <div className="row spread">
            <span style={{ fontWeight: 800, fontSize: 13 }}>Weekly goal</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--g-700)' }}>18 / 25</span>
          </div>
          <div style={{ height: 7, background: '#fff', borderRadius: 99, marginTop: 10 }}>
            <div style={{ height: '100%', width: '72%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>7 more to hit target. {name} is on pace.</p>
        </div>
      </aside>
    </div>
  );
}

function Bubble({ m, name }) {
  const isUser = m.who === 'user';
  const AgentAvatar = () => (
    <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none' }}>
      <Icon name="spark" size={17} color="#06231a" />
    </span>
  );
  if (m.kind === 'text') {
    return (
      <div className="row" style={{ gap: 9, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && <AgentAvatar />}
        <div style={{
          maxWidth: 480, padding: '12px 16px', fontSize: 14.5, lineHeight: 1.55,
          borderRadius: 18, fontWeight: isUser ? 600 : 500,
          background: isUser ? 'linear-gradient(180deg,var(--g-400),var(--g-500))' : '#fff',
          color: isUser ? '#06231a' : 'var(--ink)',
          border: isUser ? 'none' : '1px solid var(--line)',
          borderTopRightRadius: isUser ? 4 : 18, borderTopLeftRadius: isUser ? 18 : 4,
          boxShadow: isUser ? 'var(--sh-green)' : 'var(--sh-xs)',
        }}>{m.text}</div>
      </div>
    );
  }
  if (m.kind === 'stats') {
    return (
      <div className="row" style={{ gap: 9 }}>
        <AgentAvatar />
        <div className="row" style={{ gap: 9 }}>
          {[['84', 'emails sent'], ['19', 'replies'], ['3', 'meetings booked']].map(([v, k]) => (
            <div key={k} className="card" style={{ padding: '11px 14px', textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, color: 'var(--g-700)' }}>{v}</div>
              <div className="faint" style={{ fontSize: 11, fontWeight: 700 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m.kind === 'draft') {
    return (
      <div className="row" style={{ gap: 9 }}>
        <AgentAvatar />
        <div className="card" style={{ maxWidth: 460, padding: 0, overflow: 'hidden', borderTopLeftRadius: 4 }}>
          <div className="row spread" style={{ padding: '10px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
            <div className="row" style={{ gap: 8 }}><Icon name="mail" size={15} color="var(--g-600)" /><span style={{ fontWeight: 800, fontSize: 13 }} className="nw">Draft reply · Northwind</span></div>
            <span className="chip" style={{ height: 22, fontSize: 11 }}>AI written</span>
          </div>
          <div style={{ padding: '12px 14px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            Hi Mara — great question. Most teams your size are fully ramped in <b style={{ color: 'var(--g-700)' }}>under 2 weeks</b>. I'd love to walk you through it. Are you free Tue 10:00, Wed 14:30, or Fri 09:00?
          </div>
          <div className="row" style={{ gap: 9, padding: '10px 14px', borderTop: '1px solid var(--line)' }}>
            <button className="btn btn-primary btn-sm"><Icon name="send" size={14} color="#06231a" /> Approve & send</button>
            <button className="btn btn-ghost btn-sm">Edit</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* Prospects + Pipeline + Campaigns + Inbox → window */

/* =================== PROSPECTS =================== */
const PROSPECT_DATA = [
  { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', email: 'devon@brightloop.io', stage: 'Engaged', score: 88, sig: 'Opened 4×', last: '1h ago', hot: true },
  { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', email: 'mara@northwind.io', stage: 'Meeting set', score: 94, sig: 'Replied', last: '14m ago', hot: true },
  { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', email: 'lena@cobalt.com', stage: 'Engaged', score: 81, sig: 'Replied', last: '3h ago', hot: false },
  { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', email: 'tobias@vertexlabs.io', stage: 'New', score: 72, sig: 'Hiring SDRs', last: '5h ago', hot: false },
  { n: 'Amir Haddad', c: 'Acme', r: 'Director', email: 'amir@acme.com', stage: 'Meeting set', score: 79, sig: 'Call Wed', last: '2h ago', hot: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', email: 'sara@polar.com', stage: 'New', score: 64, sig: 'Visited pricing', last: '6h ago', hot: false },
  { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', email: 'marcus@hatch.io', stage: 'New', score: 58, sig: 'New funding', last: '1d ago', hot: false },
  { n: 'Priya Raman', c: 'Loom Health', r: 'COO', email: 'priya@loomhealth.com', stage: 'Won', score: 100, sig: 'Closed', last: '3d ago', hot: false },
];
const STAGE_COLORS = { New: '#9aa8a0', Engaged: '#15c4c0', 'Meeting set': '#00c27a', Won: '#088256', Nurture: '#f0a93c' };

function Prospects() {
  const [search, setSearch] = useStateSA('');
  const [filter, setFilter] = useStateSA('All');
  const filtered = PROSPECT_DATA.filter(p =>
    (filter === 'All' || p.stage === filter) &&
    (p.n.toLowerCase().includes(search.toLowerCase()) || p.c.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      {/* Toolbar */}
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff', gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Prospects</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{PROSPECT_DATA.length} leads · agent-sourced 64%</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="lead-ico"><Icon name="search" size={16} /></span>
            <input className="input has-ico" style={{ height: 38, fontSize: 13.5, background: 'var(--bg)' }} placeholder="Search prospects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Segmented options={['All','New','Engaged','Meeting set','Won'].map(v=>({label:v,value:v}))} value={filter} onChange={setFilter} />
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add</button>
        </div>
      </div>
      {/* Table */}
      <div className="scroll grow" style={{ minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
              {['Prospect','Stage','Signal','Score','Last action',''].map(h => (
                <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line-2)', transition: 'background .1s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--g-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 11 }}>
                    <Avatar name={p.n} size={34} />
                    <div className="col">
                      <div className="row" style={{ gap: 7 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }} className="nw">{p.n}</span>
                        {p.hot && <Icon name="flame" size={14} color="#ef6f4e" />}
                      </div>
                      <span className="faint" style={{ fontSize: 12 }}>{p.r} · {p.c}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="badge" style={{ background: STAGE_COLORS[p.stage] + '22', color: STAGE_COLORS[p.stage], border: '1px solid ' + STAGE_COLORS[p.stage] + '44' }}>{p.stage}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)', height: 26, fontSize: 12 }}>
                    <Icon name="bolt" size={12} color="var(--g-600)" />{p.sig}
                  </span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 6, background: 'var(--bg-2)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: p.score + '%', borderRadius: 99, background: p.score > 85 ? 'var(--g-500)' : 'var(--g-300)' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>{p.score}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.last}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="mail" size={14} /> Email</button>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="calendar" size={14} /> Book</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =================== PIPELINE =================== */
const STAGES = [
  { id: 'new', label: 'New leads', tint: '#9aa8a0' },
  { id: 'engaged', label: 'Engaged', tint: '#15c4c0' },
  { id: 'meeting', label: 'Meeting set', tint: '#00c27a' },
  { id: 'won', label: 'Won', tint: '#088256' },
];
const LEADS = {
  new: [
    { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', v: '$24k', score: 72, sig: 'Hiring SDRs' },
    { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', v: '$18k', score: 64, sig: 'Visited pricing' },
    { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', v: '$9k', score: 58, sig: 'New funding' },
  ],
  engaged: [
    { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', v: '$42k', score: 88, sig: 'Opened 4×', hot: true },
    { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', v: '$31k', score: 81, sig: 'Replied' },
  ],
  meeting: [
    { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', v: '$56k', score: 94, sig: 'Demo Fri', hot: true },
    { n: 'Amir Haddad', c: 'Acme', r: 'Director', v: '$38k', score: 79, sig: 'Call Wed' },
  ],
  won: [
    { n: 'Priya Raman', c: 'Loom Health', r: 'COO', v: '$72k', score: 100, sig: 'Closed' },
  ],
};

function Pipeline() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Pipeline</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>248 active leads · <b style={{ color: 'var(--g-700)' }}>$1.24M</b> open</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="sliders" size={15} /> Filters</button>
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add lead</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignItems: 'start' }}>
        {STAGES.map(st => (
          <div key={st.id} className="col" style={{ gap: 10 }}>
            <div className="row spread" style={{ padding: '0 4px 6px' }}>
              <div className="row" style={{ gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: st.tint, flex: 'none' }} />
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{st.label}</span>
              </div>
              <span className="faint" style={{ fontWeight: 800, fontSize: 13 }}>{LEADS[st.id].length}</span>
            </div>
            {LEADS[st.id].map(l => <LeadCard key={l.n} l={l} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
function LeadCard({ l }) {
  return (
    <div className="card" style={{ padding: 13, cursor: 'grab', transition: 'transform .12s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
      <div className="row spread">
        <div className="row" style={{ gap: 9 }}>
          <Avatar name={l.n} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">{l.n}</span>
            <span className="faint ellip" style={{ fontSize: 11.5 }}>{l.r} · {l.c}</span>
          </div>
        </div>
        {l.hot && <Icon name="flame" size={16} color="#ef6f4e" />}
      </div>
      <div className="row spread" style={{ marginTop: 10 }}>
        <span className="chip" style={{ height: 24, fontSize: 11, background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <Icon name="bolt" size={11} color="var(--g-600)" /> {l.sig}
        </span>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--g-700)' }}>{l.v}</span>
      </div>
      <div className="row" style={{ gap: 7, marginTop: 10, alignItems: 'center' }}>
        <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: 99, flex: 1 }}>
          <div style={{ height: '100%', width: l.score + '%', borderRadius: 99, background: l.score > 85 ? 'linear-gradient(90deg,var(--g-400),var(--teal))' : 'var(--g-300)' }} />
        </div>
        <span className="faint" style={{ fontSize: 11, fontWeight: 800 }}>{l.score}</span>
      </div>
    </div>
  );
}

/* =================== CAMPAIGNS =================== */
const CAMPAIGNS_DATA = [
  { name: 'SaaS VP Sales — Q3 push', status: 'Active', enrolled: 142, sent: 284, opens: '68%', replies: '24%', meetings: 18, created: '2 weeks ago' },
  { name: 'Series B funded — hiring signal', status: 'Active', enrolled: 87, sent: 174, opens: '72%', replies: '31%', meetings: 12, created: '10 days ago' },
  { name: 'Re-engage cold Q1 pipeline', status: 'Paused', enrolled: 63, sent: 126, opens: '54%', replies: '18%', meetings: 5, created: '3 weeks ago' },
  { name: 'Enterprise healthcare outbound', status: 'Draft', enrolled: 0, sent: 0, opens: '—', replies: '—', meetings: 0, created: '1 day ago' },
];
const STATUS_STYLES = {
  Active: { bg: 'var(--g-50)', color: 'var(--g-700)', dot: 'var(--g-500)' },
  Paused: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Draft: { bg: 'var(--bg-2)', color: 'var(--faint)', dot: 'var(--faint)' },
};

function Campaigns() {
  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Campaigns</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>4 sequences · 2 active · 30 meetings booked this month</p>
        </div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={15} color="#06231a" /> New campaign</button>
      </div>
      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        {[{ k: 'Total enrolled', v: '292' }, { k: 'Emails sent', v: '584' }, { k: 'Avg reply rate', v: '24%' }, { k: 'Meetings from campaigns', v: '30' }].map(s => (
          <div key={s.k} className="card" style={{ padding: '12px 16px' }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 26, marginTop: 5 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="scroll grow" style={{ padding: '16px 24px', minHeight: 0 }}>
        <div className="col" style={{ gap: 12 }}>
          {CAMPAIGNS_DATA.map((c, i) => {
            const ss = STATUS_STYLES[c.status];
            return (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div className="row spread">
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                      <Icon name="send" size={20} color="var(--g-600)" />
                    </span>
                    <div className="col">
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</span>
                      <span className="faint" style={{ fontSize: 12.5 }}>Created {c.created}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: ss.dot, flex: 'none' }} />{c.status}
                    </span>
                    <button className="btn btn-ghost btn-sm" style={{ height: 32 }}>{c.status === 'Active' ? 'Pause' : c.status === 'Paused' ? 'Resume' : 'Launch'}</button>
                    <button className="btn btn-ghost btn-sm" style={{ height: 32 }}>Edit</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
                  {[['Enrolled', c.enrolled], ['Emails sent', c.sent], ['Open rate', c.opens], ['Reply rate', c.replies], ['Meetings', c.meetings]].map(([k, v]) => (
                    <div key={k} className="col">
                      <span className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{k}</span>
                      <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginTop: 3 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =================== INBOX =================== */
const THREADS = [
  { n: 'Mara Ito', c: 'Northwind', sub: 'Re: Cutting ramp time for your 12 new AEs', prev: "This is helpful — can we do Friday at 9?", t: '14m', unread: true, hot: true, tag: 'Positive' },
  { n: 'Devon Cole', c: 'Brightloop', sub: "Re: Quick idea for Brightloop's Q3", prev: "Opened your deck. What's pricing for 40 seats?", t: '1h', unread: true, tag: 'Pricing' },
  { n: 'Lena Park', c: 'Cobalt', sub: 'Re: RevOps benchmark report', prev: "Thanks, forwarding to my VP.", t: '3h', tag: 'Forwarded' },
  { n: 'Amir Haddad', c: 'Acme', sub: 'Re: Following up', prev: "Not right now, circle back in Q4.", t: '5h', tag: 'Nurture' },
  { n: 'Sara Nilsen', c: 'Polar Freight', sub: "Re: Saw you're hiring", prev: "Who handles this on your end?", t: '1d', tag: 'Question' },
];

function Inbox() {
  const [sel, setSel] = useStateSA(0);
  const th = THREADS[sel];
  return (
    <div className="row" style={{ height: '100%', minHeight: 0 }}>
      <div className="scroll" style={{ width: 340, flex: 'none', borderRight: '1px solid var(--line)', background: '#fff' }}>
        <div className="row spread" style={{ padding: '16px 18px 12px' }}>
          <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
          <Segmented options={[{ label: 'All', value: 'a' }, { label: 'Hot', value: 'h' }]} value="a" onChange={() => {}} />
        </div>
        {THREADS.map((t, i) => (
          <button key={i} onClick={() => setSel(i)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '13px 18px',
            borderBottom: '1px solid var(--line-2)', borderLeft: '3px solid ' + (sel === i ? 'var(--g-500)' : 'transparent'),
            background: sel === i ? 'var(--g-50)' : '#fff', transition: 'all .12s',
          }}>
            <div className="row spread">
              <div className="row" style={{ gap: 9 }}>
                <Avatar name={t.n} size={34} />
                <div className="col">
                  <div className="row" style={{ gap: 6, fontWeight: 800, fontSize: 13.5 }}>
                    <span className="nw">{t.n}</span>{t.hot && <Icon name="flame" size={13} color="#ef6f4e" />}
                  </div>
                  <span className="faint nw" style={{ fontSize: 11.5 }}>{t.c}</span>
                </div>
              </div>
              <span className="faint nw" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.t}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 7, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sub}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.prev}</div>
            <span className="badge" style={{ marginTop: 7, background: 'var(--bg-2)', color: 'var(--ink-2)' }}>{t.tag}</span>
          </button>
        ))}
      </div>
      <div className="grow col" style={{ minWidth: 0, background: 'var(--bg)' }}>
        <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', background: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 11 }}>
            <Avatar name={th.n} size={40} />
            <div className="col">
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{th.n} · {th.c}</span>
              <span className="faint ellip" style={{ fontSize: 12.5 }}>{th.sub}</span>
            </div>
          </div>
          <span className="chip"><span className="dot" /> {th.tag}</span>
        </div>
        <div className="scroll grow" style={{ padding: '20px 24px' }}>
          <div className="card" style={{ padding: 18, maxWidth: 620 }}>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Avatar name={th.n} size={32} />
              <div className="col"><span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{th.n}</span><span className="faint" style={{ fontSize: 12 }}>to me · {th.t} ago</span></div>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>{th.prev} Looking forward to it — let me know what works.</p>
          </div>
          <div className="card" style={{ padding: 0, maxWidth: 620, marginTop: 16, overflow: 'hidden', boxShadow: 'var(--sh-md)' }}>
            <div className="row spread" style={{ padding: '11px 16px', background: 'linear-gradient(90deg,var(--g-50),#fff)', borderBottom: '1px solid var(--g-100)' }}>
              <div className="row" style={{ gap: 8 }}><Icon name="spark" size={16} color="var(--g-600)" /><span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{getAgentName()} drafted a reply</span></div>
              <span className="chip" style={{ height: 22, fontSize: 11 }}>Recommended</span>
            </div>
            <div style={{ padding: '14px 16px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
              Hi {th.n.split(' ')[0]} — Friday at 9:00 works perfectly. I'll send a calendar invite with a short agenda so we keep it to 25 minutes. Talk soon!
            </div>
            <div className="row" style={{ gap: 9, padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
              <button className="btn btn-primary btn-sm"><Icon name="send" size={14} color="#06231a" /> Approve & send</button>
              <button className="btn btn-ghost btn-sm"><Icon name="spark" size={14} /> Regenerate</button>
              <button className="btn btn-ghost btn-sm">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Meetings + Analytics + Billing + Settings → window */

/* =================== MEETINGS =================== */
const MTG_DATA = [
  { n: 'Mara Ito', c: 'Northwind', type: 'Discovery call', date: 'Today', time: '2:30 PM', dur: '30 min', status: 'Upcoming', link: true },
  { n: 'Devon Cole', c: 'Brightloop', type: 'Product demo', date: 'Tomorrow', time: '10:00 AM', dur: '45 min', status: 'Upcoming', link: true },
  { n: 'Amir Haddad', c: 'Acme', type: 'Follow-up call', date: 'Wed, Jun 11', time: '3:00 PM', dur: '30 min', status: 'Upcoming', link: false },
  { n: 'Lena Park', c: 'Cobalt', type: 'Technical review', date: 'Thu, Jun 12', time: '11:00 AM', dur: '60 min', status: 'Upcoming', link: false },
  { n: 'Priya Raman', c: 'Loom Health', type: 'Closing call', date: 'Mon, Jun 2', time: '2:00 PM', dur: '30 min', status: 'Completed', link: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', type: 'Intro call', date: 'Fri, May 30', time: '9:00 AM', dur: '20 min', status: 'Cancelled', link: false },
];
const MTG_STATUS = {
  Upcoming: { bg: 'var(--g-50)', color: 'var(--g-700)' },
  Completed: { bg: '#f0f9ff', color: '#0369a1' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

function Meetings() {
  const upcoming = MTG_DATA.filter(m => m.status === 'Upcoming');
  const past = MTG_DATA.filter(m => m.status !== 'Upcoming');
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Meetings</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>18 booked this week · 3 today</p>
        </div>
        <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Schedule meeting</button>
      </div>
      {/* Today highlight */}
      <div className="card" style={{ padding: 18, marginBottom: 20, background: 'linear-gradient(135deg,#f4fdf8,#eafaf2)', border: '1px solid var(--g-100)' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Today · {upcoming.filter(m=>m.date==='Today').length} meetings</div>
        <div className="col" style={{ gap: 10 }}>
          {upcoming.filter(m => m.date === 'Today').map((m, i) => (
            <div key={i} className="row spread" style={{ padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--g-100)' }}>
              <div className="row" style={{ gap: 12 }}>
                <Avatar name={m.n} size={38} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>{m.type}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {m.link && <button className="btn btn-primary btn-sm"><Icon name="play" size={14} /> Join call</button>}
                <button className="btn btn-ghost btn-sm">Prep brief</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming */}
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Upcoming</div>
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        {upcoming.filter(m => m.date !== 'Today').map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', gap: 12 }}>
            <div className="row" style={{ gap: 20 }}>
              <div style={{ width: 72, textAlign: 'center', flex: 'none' }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--g-700)', textTransform: 'uppercase' }}>{m.date.split(', ')[0]}</div>
                <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{m.date.split(' ').pop()}</div>
              </div>
              <div className="row" style={{ gap: 14, marginLeft: 14 }}>
                <Avatar name={m.n} size={36} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{m.type}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
      {/* Past */}
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Past meetings</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {past.map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', opacity: m.status === 'Cancelled' ? 0.55 : 1 }}>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={m.n} size={34} />
              <div className="col">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{m.type} · {m.n}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>{m.date} · {m.time} · {m.c}</span>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== ANALYTICS =================== */
const WEEKLY = [12, 15, 11, 18, 14, 20, 18];
const DAILY_EMAILS = [62, 78, 84, 91, 70, 88, 84];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const PIPELINE_TREND = [180, 340, 520, 680, 900, 1240];

function Analytics() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 22 }}>Analytics</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Performance over the last 30 days</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ k: 'Meetings booked', v: '18', d: '+38% vs last month' }, { k: 'Reply rate', v: '22.6%', d: '+4.2 pts' }, { k: 'Emails sent', v: '584', d: 'This month' }, { k: 'Pipeline added', v: '$1.24M', d: '+$380k vs last month' }].map(s => (
          <div key={s.k} className="card" style={{ padding: 16 }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{s.v}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g-700)', marginTop: 4, display: 'block' }}>{s.d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <BarChart title="Meetings booked (last 7 days)" data={WEEKLY} labels={['M','T','W','T','F','S','S']} color="var(--g-500)" max={25} />
        <BarChart title="Emails sent (last 7 days)" data={DAILY_EMAILS} labels={['M','T','W','T','F','S','S']} color="var(--teal)" max={120} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <LineChart title="Pipeline value growth ($k)" data={PIPELINE_TREND} labels={MONTHS} />
        <FunnelChart />
      </div>
    </div>
  );
}

function BarChart({ title, data, labels, color, max }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{title}</div>
      <div className="row" style={{ gap: 8, alignItems: 'flex-end', height: 100 }}>
        {data.map((v, i) => (
          <div key={i} className="col center grow" style={{ gap: 4 }}>
            <div style={{ width: '100%', height: (v / max) * 90, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height .5s ease' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--faint)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ title, data, labels }) {
  const w = 360, h = 100;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - 40) + 20},${h - (v / max) * (h - 20) - 10}`).join(' ');
  const area = `M${pts.split(' ').join('L')} L${(data.length - 1) / (data.length - 1) * (w - 40) + 20},${h} L20,${h} Z`;
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: 120 }}>
        <defs>
          <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--g-400)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--g-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg-area)" />
        <polyline points={pts} fill="none" stroke="var(--g-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * (w - 40) + 20;
          const y = h - (v / max) * (h - 20) - 10;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--g-500)" stroke="#fff" strokeWidth="1.5" />;
        })}
        {labels.map((l, i) => (
          <text key={i} x={(i / (labels.length - 1)) * (w - 40) + 20} y={h + 16} textAnchor="middle" fill="var(--faint)" fontSize="11" fontWeight="700">{l}</text>
        ))}
      </svg>
    </div>
  );
}

function FunnelChart() {
  const stages = [
    { label: 'Prospects found', v: 1284, pct: 100, color: '#d1fae5' },
    { label: 'Emailed', v: 584, pct: 45, color: 'var(--g-300)' },
    { label: 'Replied', v: 132, pct: 10, color: 'var(--g-400)' },
    { label: 'Meeting booked', v: 47, pct: 4, color: 'var(--g-500)' },
    { label: 'Closed', v: 8, pct: 0.6, color: 'var(--g-700)' },
  ];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Conversion funnel</div>
      <div className="col" style={{ gap: 8 }}>
        {stages.map((s, i) => (
          <div key={i} className="row" style={{ gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', width: 130, flex: 'none', textAlign: 'right' }}>{s.label}</span>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.max(s.pct, 1) + '%', background: s.color, borderRadius: 6, transition: 'width .6s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', width: 40 }}>{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== BILLING =================== */
function Billing() {
  const [annual, setAnnual] = useStateSB(true);
  const plans = [
    { name: 'Starter', price: annual ? 49 : 59, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'] },
    { name: 'Growth', price: annual ? 149 : 179, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], current: true },
    { name: 'Scale', price: annual ? 399 : 479, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'] },
  ];
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="row spread" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="display" style={{ fontSize: 22 }}>Billing & plan</h1>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>You're on the <b style={{ color: 'var(--g-700)' }}>Growth plan</b> · renews Jul 5, 2026</p>
          </div>
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 28, borderRadius: 99, padding: 3, background: annual ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s' }}>
              <span style={{ display: 'block', width: 22, height: 22, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-xs)', transform: annual ? 'translateX(20px)' : 'none', transition: 'transform .2s' }} />
            </button>
            <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Annual <span className="badge" style={{ background: 'var(--g-50)', color: 'var(--g-700)' }}>Save 20%</span></span>
          </div>
        </div>
        {/* Usage */}
        <div className="card" style={{ padding: 18, marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>Current usage</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[{ k: 'Emails sent this month', v: 584, max: 6000, unit: '' }, { k: 'Seats used', v: 3, max: 5, unit: '' }, { k: 'Active campaigns', v: 2, max: 'Unlimited', unit: '' }].map(u => (
              <div key={u.k}>
                <div className="row spread" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>{u.k}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--g-700)' }}>{u.v}{u.max !== 'Unlimited' ? ` / ${u.max}` : ' / ∞'}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: (u.max !== 'Unlimited' ? (u.v / u.max) * 100 : 10) + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{ padding: 22, border: p.current ? '2px solid var(--g-400)' : '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
              {p.current && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 10 }}>Current plan</div>}
              <div className="display" style={{ fontSize: 22 }}>{p.name}</div>
              <div style={{ marginTop: 8 }}>
                <span className="display" style={{ fontSize: 36 }}>${p.price}</span>
                <span className="muted" style={{ fontSize: 13, marginLeft: 4 }}>/mo</span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 16 }}>{p.desc}</p>
              <div className="col" style={{ gap: 8, marginBottom: 18 }}>
                {p.feats.map(f => (
                  <div key={f} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <Icon name="check" size={14} color="var(--g-500)" stroke={2.5} style={{ marginTop: 2, flex: 'none' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className={'btn btn-block ' + (p.current ? 'btn-ghost' : 'btn-primary')} style={{ fontSize: 14 }}>
                {p.current ? 'Current plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =================== SETTINGS =================== */
function Settings() {
  const [tone, setTone] = useStateSB('Consultative');
  const [vol, setVol] = useStateSB(120);
  const [chans, setChans] = useStateSB(['Email', 'LinkedIn']);
  const toggleChan = c => setChans(chans.includes(c) ? chans.filter(x => x !== c) : [...chans, c]);
  const [autos, setAutos] = useStateSB({ firstTouch: true, approveReplies: true, autoBook: true, weekends: false });
  const toggle = k => setAutos(a => ({ ...a, [k]: !a[k] }));
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="display" style={{ fontSize: 22 }}>Agent settings</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 20 }}>Tune how {getAgentName()} sells on your behalf. Changes apply immediately.</p>
        <SetCard title="Persona & tone" ico="user" sub="How your agent sounds in every message.">
          <div className="field">
            <label>Writing tone</label>
            <div className="row wrap" style={{ gap: 9 }}>
              {['Consultative', 'Friendly', 'Direct', 'Challenger', 'Formal'].map(t => (
                <button key={t} onClick={() => setTone(t)} className="nw" style={{ height: 40, padding: '0 16px', borderRadius: 99, fontWeight: 700, fontSize: 13.5, border: '1.5px solid ' + (tone === t ? 'var(--g-400)' : 'var(--line)'), background: tone === t ? 'var(--g-50)' : '#fff', color: tone === t ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .14s' }}>{t}</button>
              ))}
            </div>
          </div>
          <Field label="Email signature" placeholder="Mara Ito · VP Sales, Northwind" value="Mara Ito · VP Sales, Northwind" onChange={() => {}} />
        </SetCard>
        <SetCard title="Outreach volume" ico="send" sub="Daily caps keep deliverability healthy.">
          <div className="field">
            <div className="row spread"><label>Emails per day</label><span style={{ fontWeight: 800, color: 'var(--g-700)' }}>{vol}</span></div>
            <input type="range" min="20" max="300" value={vol} onChange={e => setVol(+e.target.value)} style={{ accentColor: 'var(--g-500)', width: '100%' }} />
            <span className="faint" style={{ fontSize: 12.5 }}>Recommended: 80–150 for a warmed-up inbox.</span>
          </div>
          <SToggle label="Pause on weekends" sub="No messages sent Sat–Sun." on={autos.weekends} onChange={() => toggle('weekends')} />
        </SetCard>
        <SetCard title="Channels" ico="link" sub="Where the agent can reach out.">
          <div className="col" style={{ gap: 10 }}>
            {[['Email', 'mail'], ['LinkedIn', 'users'], ['SMS', 'phone']].map(([c, i]) => (
              <SToggle key={c} ico={i} label={c} on={chans.includes(c)} onChange={() => toggleChan(c)} />
            ))}
          </div>
        </SetCard>
        <SetCard title="Autonomy" ico="spark" sub="How much the agent does without asking you.">
          <div className="col" style={{ gap: 10 }}>
            <SToggle label="Auto-send first touches" sub="Send approved-template intros without review." on={autos.firstTouch} onChange={() => toggle('firstTouch')} />
            <SToggle label="Require approval for replies" sub="You confirm replies to live conversations." on={autos.approveReplies} onChange={() => toggle('approveReplies')} />
            <SToggle label="Auto-book meetings" sub="Drop confirmed times straight on your calendar." on={autos.autoBook} onChange={() => toggle('autoBook')} />
          </div>
        </SetCard>
        <div className="row" style={{ gap: 10, margin: '24px 0 8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  );
}
function SetCard({ title, sub, ico, children }) {
  return (
    <div className="card" style={{ padding: 20, marginTop: 16 }}>
      <div className="row" style={{ gap: 11, marginBottom: 16 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={ico} size={19} color="var(--g-600)" /></span>
        <div className="col"><span style={{ fontWeight: 800, fontSize: 15 }}>{title}</span><span className="muted" style={{ fontSize: 13 }}>{sub}</span></div>
      </div>
      <div className="col" style={{ gap: 16 }}>{children}</div>
    </div>
  );
}
function SToggle({ label, sub, ico, on, onChange }) {
  return (
    <div className="row spread" style={{ padding: '4px 0' }}>
      <div className="row" style={{ gap: 10 }}>
        {ico && <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--muted)', flex: 'none' }}><Icon name={ico} size={17} /></span>}
        <div className="col"><span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>{sub && <span className="faint" style={{ fontSize: 12.5 }}>{sub}</span>}</div>
      </div>
      <button onClick={onChange} style={{ width: 46, height: 26, borderRadius: 99, padding: 3, flex: 'none', background: on ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s' }}>
        <span style={{ display: 'block', width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-xs)', transform: on ? 'translateX(20px)' : 'none', transition: 'transform .2s' }} />
      </button>
    </div>
  );
}

// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

const TWEAK_DEFAULTS = {
  accent: "#00c27a",
  auroraIntensity: 1,
  radius: "rounded",
  agentName: "Nexo",
};

const AUTH_SCREENS = ["splash", "login", "signup", "forgot"];
const ONB_SCREENS = ["onboarding", "celebrate"];
const APP_TABS = [
  "dashboard",
  "agent",
  "prospects",
  "pipeline",
  "campaigns",
  "inbox",
  "meetings",
  "analytics",
  "billing",
  "settings",
];

const JUMPER = [
  { id: "splash", label: "Splash" },
  { id: "signup", label: "Create account" },
  { id: "login", label: "Sign in" },
  { id: "forgot", label: "Forgot password" },
  { id: "onboarding", label: "Onboarding wizard" },
  { id: "celebrate", label: "Agent ready" },
  { id: "dashboard", label: "Dashboard" },
  { id: "agent", label: "AI Agent" },
  { id: "prospects", label: "Prospects" },
  { id: "pipeline", label: "Pipeline" },
  { id: "campaigns", label: "Campaigns" },
  { id: "inbox", label: "Inbox" },
  { id: "meetings", label: "Meetings" },
  { id: "analytics", label: "Analytics" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Settings" },
];

function ScreenJumper({ current, go }) {
  const [open, setOpen] = useState(false);
  const groups = [
    { label: "Pre-login", items: JUMPER.slice(0, 4) },
    { label: "Onboarding", items: JUMPER.slice(4, 6) },
    { label: "App screens", items: JUMPER.slice(6) },
  ];

  return (
    <div style={{ position: "absolute", right: 14, bottom: 14, zIndex: 50, fontFamily: "var(--font-body)" }}>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 0,
            width: 230,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "var(--sh-lg)",
            border: "1px solid var(--line)",
            padding: "10px 8px",
            animation: "pop .18s both",
            maxHeight: 480,
            overflowY: "auto",
          }}
        >
          {groups.map((group) => (
            <div key={group.label}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--faint)",
                  padding: "8px 10px 4px",
                }}
              >
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    go(item.id);
                    setOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: current === item.id ? "var(--g-700)" : "var(--ink-2)",
                    background: current === item.id ? "var(--g-50)" : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          height: 44,
          padding: "0 18px",
          borderRadius: 99,
          background: "var(--ink)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 13.5,
          boxShadow: "var(--sh-lg)",
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <Icon name="grid" size={16} color="#fff" /> Screens
      </button>
    </div>
  );
}

export default function GlobonexoPrototype() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("splash");

  useEffect(() => {
    const stored = window.localStorage.getItem("gx_screen") || "splash";
    const normalized = stored === "app" ? "dashboard" : stored;
    const all = [...AUTH_SCREENS, ...ONB_SCREENS, ...APP_TABS];
    setScreen(all.includes(normalized) ? normalized : "splash");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("gx_screen", screen);
  }, [screen]);

  useEffect(() => {
    window.__agentName = t.agentName || "Nexo";
  }, [t.agentName]);

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--g-500", t.accent);
    rootStyle.setProperty("--primary", t.accent);
    rootStyle.setProperty("--aurora-opacity", String(t.auroraIntensity));

    const radii =
      t.radius === "sharp"
        ? ["4px", "6px", "8px", "12px"]
        : t.radius === "soft"
          ? ["14px", "18px", "26px", "34px"]
          : ["10px", "14px", "20px", "28px"];

    ["--r-sm", "--r-md", "--r-lg", "--r-xl"].forEach((key, index) => {
      rootStyle.setProperty(key, radii[index]);
    });
  }, [t.accent, t.auroraIntensity, t.radius]);

  const go = (value) => setScreen(value);
  const isApp = APP_TABS.includes(screen);

  let view = null;
  if (screen === "splash") view = <Splash go={go} />;
  else if (screen === "login") view = <Login go={go} />;
  else if (screen === "signup") view = <Signup go={go} />;
  else if (screen === "forgot") view = <Forgot go={go} />;
  else if (screen === "onboarding") view = <OnboardingWizard go={go} />;
  else if (screen === "celebrate") view = <CelebrationScreen go={go} />;
  else if (isApp) {
    let page = null;
    if (screen === "dashboard") page = <Dashboard setTab={go} />;
    else if (screen === "agent") page = <AgentWorkspace />;
    else if (screen === "prospects") page = <Prospects />;
    else if (screen === "pipeline") page = <Pipeline />;
    else if (screen === "campaigns") page = <Campaigns />;
    else if (screen === "inbox") page = <Inbox />;
    else if (screen === "meetings") page = <Meetings />;
    else if (screen === "analytics") page = <Analytics />;
    else if (screen === "billing") page = <Billing />;
    else if (screen === "settings") page = <Settings />;
    view = (
      <AppShell tab={screen} setTab={go} go={go}>
        {page}
      </AppShell>
    );
  }

  return (
    <div className="stage">
      <div className="frame">
        {view}
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#00c27a", "#10b981", "#06b6d4", "#22c55e", "#0ea5a4"]}
          onChange={(value) => setTweak("accent", value)}
        />
        <TweakText label="Agent name" value={t.agentName} onChange={(value) => setTweak("agentName", value)} />
        <TweakSection label="Style" />
        <TweakSlider
          label="Aurora glow"
          value={t.auroraIntensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => setTweak("auroraIntensity", value)}
        />
        <TweakRadio
          label="Corners"
          value={t.radius}
          options={["sharp", "rounded", "soft"]}
          onChange={(value) => setTweak("radius", value)}
        />
      </TweaksPanel>
    </div>
  );
}
