"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/ui/Logo";
import Aurora from "../components/ui/Aurora";
import Icon from "../components/ui/Icon";
import PublicNav from "../components/layout/PublicNav";
import PublicFooter from "../components/layout/PublicFooter";
import { useAuth } from "../hooks/useAuth";
import { PLAN_CONFIG, marketingCeilingsFor } from "../lib/plans";
import QualifyDemo from "../components/landing/QualifyDemo";
import VoiceTestDemo from "../components/landing/VoiceTestDemo";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const copilotPoints = [
    'Ask it in plain English — no hunting through screens',
    'Pause every live campaign with one sentence',
    'It keeps working between your campaigns, not just inside them',
    'Autopilot changes who approves a message, never what gets checked',
  ];

  const chat = [
    { from: 'you', text: 'Which leads need me today?' },
    { from: 'agent', text: 'Three replied overnight and are waiting on you.', rows: [
      { name: 'Head of RevOps · Bluepeak', note: 'Asked about pricing' },
      { name: 'VP Sales · Fernpoint', note: 'Wants a call Thursday' },
      { name: 'Founder · Oakline', note: 'Replied to step 2' },
    ] },
    { from: 'you', text: 'Pause everything until Monday.' },
    { from: 'agent', text: 'Paused 4 live campaigns. Nothing will send or dial until you resume.' },
  ];

  // Sourced from context-readiness.service.ts and email-validation.service.ts.
  const accuracy = [
    { icon: 'doc', title: 'It states what it does not know', text: 'The model is handed an explicit list of missing facts, not a vague instruction to avoid making things up. Telling it exactly what is absent is far stronger.' },
    { icon: 'target', title: 'Facts and guesses stay separate', text: 'A verified headcount is a fact. "They are struggling with pipeline" is a hypothesis, and hypotheses become questions, never claims.' },
    { icon: 'sliders', title: 'Readiness you can act on', text: 'A lead reads as "7 of 10 ready" with the missing pieces named. You can act on a missing fact. You cannot act on "68% quality".' },
    { icon: 'lock', title: 'Nothing is written on thin air', text: 'Without the required facts about a person and their company, no message is drafted at all. Silence beats a confident guess.' },
  ];

  const voicePoints = [
    'Adversarial scenarios, judged before a campaign dials, if you choose to test it',
    'Refuses to invent customers, pricing, or ROI it was never given',
    'Ends the call immediately on a do-not-call request',
    'Books only real calendar slots, never an invented time',
    'A calling number is provisioned for you automatically, nothing to set up',
  ];

  // Rotates through the real plan catalogue so the numbers can never drift from
  // what checkout actually sells. Every figure here comes from PLAN_CONFIG.
  const [planIndex, setPlanIndex] = React.useState(0);
  const [autoRotate, setAutoRotate] = React.useState(true);
  const plan = PLAN_CONFIG[planIndex];

  React.useEffect(() => {
    if (!autoRotate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setPlanIndex((i) => (i + 1) % PLAN_CONFIG.length), 4000);
    return () => clearInterval(id);
  }, [autoRotate]);

  const { emailsPerMonth, callsPerMonth } = marketingCeilingsFor(plan);
  const capacity = [
    { value: plan.voiceCampaigns, label: plan.voiceCampaigns === 1 ? 'voice campaign' : 'voice campaigns' },
    { value: plan.emailCampaigns, label: 'email campaigns' },
    { value: callsPerMonth.toLocaleString(), label: 'calls / month', prefix: 'Up to' },
    { value: emailsPerMonth.toLocaleString(), label: 'emails / month', prefix: 'Up to' },
  ];

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const handleSignIn = () => {
    const dest = localStorage.getItem('returning_user') ? '/login' : '/signup';
    router.push(dest);
  };

  return (
    <div className="screen landing-screen">
      <div className="landing-scroll">
        <section className="landing-hero">
          <Aurora />
          <PublicNav variant="dark" scrollTo={scrollTo} onSignIn={handleSignIn} />

          <div id="landing-top" className="landing-hero-inner">
            <div className="landing-hero-copy">
              <h1 className="display">
                Your AI sales rep.
                <span>Always prospecting.</span>
                <span>
                  Always <span className="landing-hero-rotator"><em>Calling</em><em aria-hidden="true">Mailing</em></span>.
                </span>
              </h1>
              <p>Finds buyers, researches why they would care, writes outreach, and reaches them by email or voice. You can focus on closing.</p>
              <div className="landing-hero-actions" style={loading ? { visibility: 'hidden' } : undefined} aria-hidden={loading || undefined}>
                {user ? (
                  <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')}>
                    Back to dashboard <Icon name="arrow" size={18} color="#06231a" />
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                      Start with a paid plan <Icon name="arrow" size={18} color="#06231a" />
                    </button>
                    <a
                      className="landing-outline-btn"
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Book a demo with GNX Sales"
                    >
                      <Icon name="calendar" size={17} />
                      Book a demo
                    </a>
                  </>
                )}
              </div>
              <div className="landing-assurances">
                <span><Icon name="check" size={15} color="var(--g-300)" /> For an individual, an agency, or a startup</span>
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
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--g-200)' }} />
                </div>
                <div className="landing-product-body">
                  <div className="landing-product-title">
                    <div><strong>Meetings</strong><span>Booked this week</span></div>
                    <button><Icon name="plus" size={12} /> Schedule meeting</button>
                  </div>
                  <div className="landing-today">
                    <span>Today</span>
                    <div>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--g-200)', flex: 'none' }} />
                      <p><strong>Discovery call</strong><small>Prospect · Company · 2:30 PM</small></p>
                      <button>Join call</button>
                    </div>
                  </div>
                  <span className="landing-list-label">Upcoming</span>
                  <div className="landing-upcoming">
                    {[
                      { day: 'Tomorrow', date: '10', initials: 'DC', type: 'Product demo', color: '#e5aa43' },
                      { day: 'Wed', date: '11', initials: 'AH', type: 'Follow-up call', color: '#70c98c' },
                      { day: 'Thu', date: '12', initials: 'LP', type: 'Technical review', color: '#69c2c0' },
                    ].map((meeting) => (
                      <div key={meeting.type}>
                        <time><b>{meeting.day}</b><strong>{meeting.date}</strong></time>
                        <span className="landing-preview-avatar" style={{ background: meeting.color }}>{meeting.initials}</span>
                        <p><strong>{meeting.type}</strong><small>30 min</small></p>
                        <em>Upcoming</em>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-problem landing-section">
          <QualifyDemo
            intro={(
              <div className="landing-section-intro">
                <h2 className="display">Volume was <em className="hl">never</em> the problem</h2>
                <p>A faster way to reach the wrong person is still the wrong person. Before anyone gets contacted, GNX works out:</p>
              </div>
            )}
          />
        </section>

        <section id="accuracy" className="landing-accuracy landing-section">
          <div className="landing-section-intro">
            <span className="landing-fit-label">No guessing</span>
            <h2 className="display">It won&apos;t write what it <em className="hl">doesn&apos;t know</em></h2>
            <p>Most AI outreach fails on a sentence that sounds confident and was never true. Yours is handed a list of the gaps instead.</p>
          </div>
          <div className="landing-accuracy-grid">
            {accuracy.map((item) => (
              <article key={item.title}>
                <div className="landing-usecase-icon landing-usecase-icon--accent">
                  <Icon name={item.icon} size={20} color="#fff" />
                </div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="landing-accuracy-note">
            <Icon name="alertCircle" size={16} color="var(--g-800)" />
            <span>The line every prospect has learned to distrust — &ldquo;I know your team is struggling with X&rdquo; — written by a system that never knew that. GNX is built so it cannot write it.</span>
          </p>
        </section>

        <section id="voice" className="landing-voice landing-section">
          <div className="landing-voice-copy">
            <span className="landing-fit-label">AI voice calling</span>
            <h2 className="display"><em className="hl">Tested</em> before it phones anyone</h2>
            <p>
              Before a voice campaign can go live, the agent is put through adversarial calls and scored on every
              transcript — the busy prospect, the skeptic, the wrong person, the one who asks where you got their number.
            </p>
            <ul className="landing-copilot-points">
              {voicePoints.map((point) => (
                <li key={point}>
                  <div className="landing-usecase-icon landing-usecase-icon--accent landing-usecase-icon--sm">
                    <Icon name="check" size={14} color="#fff" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
            <Link className="landing-text-link" href="/voice">
              How voice calling works <Icon name="arrow" size={15} color="var(--g-700)" />
            </Link>
          </div>
          <VoiceTestDemo />
        </section>

        <section id="copilot" className="landing-copilot landing-section">
          <div className="landing-copilot-copy">
            <span className="landing-fit-label">AI Co-Pilot</span>
            <h2 className="display">Just <em className="hl">tell it</em> what to do</h2>
            <p>
              Your co-pilot runs the outreach on its own — but you never have to hunt through screens to steer it.
              Ask in plain English and it does the work.
            </p>
            <ul className="landing-copilot-points">
              {copilotPoints.map((point) => (
                <li key={point}>
                  <div className="landing-usecase-icon landing-usecase-icon--accent landing-usecase-icon--sm">
                    <Icon name="check" size={14} color="#fff" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
            <Link className="landing-text-link" href="/platform">
              Everything the agent handles <Icon name="arrow" size={15} color="var(--g-700)" />
            </Link>
          </div>

          <div className="cp" aria-hidden="true">
            <div className="qd-bar"><span /><span /><span /><em>Agent</em></div>
            <div className="cp-thread">
              {chat.map((m) => (
                <div key={m.text} className={`cp-msg is-${m.from}`}>
                  {m.from === 'agent' && <span className="cp-ava"><Icon name="bolt" size={13} color="#fff" /></span>}
                  <div>
                    <p>{m.text}</p>
                    {m.rows && (
                      <div className="cp-rows">
                        {m.rows.map((r) => (
                          <div key={r.name}><strong>{r.name}</strong><span>{r.note}</span></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="cp-input"><Icon name="chat" size={13} color="var(--faint)" /><span>Ask your agent anything…</span></div>
          </div>
        </section>

        <section id="results" className="landing-results landing-section">
          <div className="landing-results-copy">
            <h2 className="display">
              What <span key={plan.id} className="landing-plan-price">${plan.monthly}</span> gets you
            </h2>
            <p>Every plan includes all three capabilities. Tiers differ by volume, never by locked features.</p>
            <div className="landing-plan-tabs" role="tablist" aria-label="Choose a plan to compare">
              {PLAN_CONFIG.map((p, i) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={i === planIndex}
                  className={i === planIndex ? 'is-active' : ''}
                  onClick={() => { setPlanIndex(i); setAutoRotate(false); }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div key={plan.id} className="landing-outcomes">
            {capacity.map((item) => (
              <div key={item.label}>
                {item.prefix && <em className="landing-outcome-prefix">{item.prefix}</em>}
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-cta landing-section">
          <div>
            <h2 className="display">Put your agent to work</h2>
            <p>Choose a plan, connect your inbox, and get moving.</p>
          </div>
          <div className="landing-cta-actions" style={loading ? { visibility: 'hidden' } : undefined} aria-hidden={loading || undefined}>
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')}>
                Back to dashboard <Icon name="arrow" size={18} color="#06231a" />
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Choose a plan <Icon name="arrow" size={18} color="#06231a" />
                </button>
                <Link className="landing-outline-btn" href="/pricing">View pricing</Link>
              </>
            )}
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
