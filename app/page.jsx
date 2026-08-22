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
import { PLAN_CONFIG } from "../lib/plans";
import QualifyDemo from "../components/landing/QualifyDemo";
import VoiceTestDemo from "../components/landing/VoiceTestDemo";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const accuracyTalk = [
    { from: 'you', text: 'Write like you already know their pipeline is a mess.' },
    { from: 'gnx', text: 'I don’t know that. If it isn’t a verified fact, it never becomes a sentence in the email. I’ll ask — or I won’t send.' },
    { from: 'you', text: 'Then what do you actually know about this person?' },
    { from: 'gnx', text: 'What’s been verified: who they are, the company, a work email. A reported headcount is a fact. “They’re struggling with pipeline” is a guess. Guesses become questions. Never claims.' },
    { from: 'you', text: 'How do I know when it’s safe to send?' },
    { from: 'gnx', text: 'You’ll see 7 of 10 ready, with the missing pieces named. You can go find a title. You cannot act on “68% quality.”' },
    { from: 'you', text: 'And if you don’t even have the basics?' },
    { from: 'gnx', text: 'I draft nothing. Silence under your name beats a fluent line I invented.' },
  ];

  const voiceTalk = [
    { from: 'you', text: 'Don’t call my list until I trust this.' },
    { from: 'gnx', text: 'I won’t. Before a campaign goes live, I sit through adversarial calls — the busy prospect, the skeptic, the wrong person, the one who asks where I got the number — and every transcript is scored.' },
    { from: 'you', text: 'What if they ask which customers you’ve helped?' },
    { from: 'gnx', text: 'If you never gave me names, pricing, or ROI, I say I don’t have it. I will not invent a company and a 40% lift.' },
    { from: 'you', text: 'They said don’t call again.' },
    { from: 'gnx', text: 'The call ends on that sentence. No one more question. Their number is not dialed again.' },
    { from: 'you', text: 'Just pick a time that sounds free.' },
    { from: 'gnx', text: 'I only offer slots that are actually open on your calendar. If I can’t check, I say so. I don’t invent Tuesday at 10.' },
  ];

  const agentTalk = [
    { from: 'you', text: 'I don’t want to hunt through screens to steer this.' },
    { from: 'gnx', text: 'Then don’t. Tell me in English. I run the outreach; you steer it in a sentence.' },
    { from: 'you', text: 'Does this only work while a campaign is live?' },
    { from: 'gnx', text: 'No. I keep working between campaigns — who replied, who needs you, what to pause — not only inside a sequence.' },
    { from: 'you', text: 'If I turn on autopilot, will you skip the checks?' },
    { from: 'gnx', text: 'Autopilot changes who approves a message. It never changes what gets checked.' },
  ];

  const chat = [
    { from: 'you', text: 'Which leads need me today?' },
    { from: 'agent', text: 'Three replied overnight and are waiting on you.', rows: [
      { name: 'Head of RevOps · Bluepeak', note: 'Asked about pricing — wants a real answer, not a guess' },
      { name: 'VP Sales · Fernpoint', note: 'Asked for a call Thursday' },
      { name: 'Founder · Oakline', note: 'Replied to step 2' },
    ] },
    { from: 'you', text: 'Book Fernpoint Thursday from a real slot. Pause everything else until Monday.' },
    { from: 'agent', text: 'Booked VP Sales · Fernpoint from an open Thursday slot. Paused 4 live campaigns. Nothing will send or dial until you resume.' },
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

  const capacity = [
    { value: plan.monthlyCredits.toLocaleString(), label: 'credits / month, one shared pool' },
    { value: plan.emailCampaigns, label: 'email campaigns' },
    { value: plan.voiceCampaigns, label: plan.voiceCampaigns === 1 ? 'voice campaign' : 'voice campaigns' },
    { value: plan.dailyEmailCap, label: 'emails / day sending cap' },
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
                    <button className="landing-outline-btn" onClick={() => scrollTo('accuracy')}>See how it works</button>
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
            <h2 className="display">I won&apos;t write what I <em className="hl">don&apos;t know</em></h2>
            <p>You set the bar. I answer as the agent that would send it under your name.</p>
          </div>
          <Talk turns={accuracyTalk} layout="grid" />
          <p className="landing-accuracy-note">
            <Icon name="alertCircle" size={16} color="var(--g-800)" />
            <span>The line every prospect has learned to distrust — &ldquo;I know your team is struggling with X&rdquo; — written by a system that never knew that. I am built so I cannot write it.</span>
          </p>
        </section>

        <section id="voice" className="landing-voice landing-section">
          <div className="landing-voice-copy">
            <span className="landing-fit-label">AI calls</span>
            <h2 className="display">I don&apos;t call until I&apos;ve been <em className="hl">tested</em></h2>
            <p>You wouldn&apos;t hand a stranger your prospect list and a phone. Neither will I — not until the call has already failed somewhere safe.</p>
            <Talk turns={voiceTalk} layout="stack" />
            <Link className="landing-text-link" href="/voice">
              How voice calling works <Icon name="arrow" size={15} color="var(--g-700)" />
            </Link>
          </div>
          <VoiceTestDemo />
        </section>

        <section id="copilot" className="landing-copilot landing-section">
          <div className="landing-copilot-copy">
            <span className="landing-fit-label">The agent</span>
            <h2 className="display">Just <em className="hl">tell me</em> what to do</h2>
            <p>I keep prospecting. You talk to me the way you&apos;d talk to a colleague who already has the inbox open.</p>
            <Talk turns={agentTalk} layout="stack" />
            <Link className="landing-text-link" href="/platform">
              Everything I handle <Icon name="arrow" size={15} color="var(--g-700)" />
            </Link>
          </div>

          <div className="cp" aria-hidden="true">
            <div className="qd-bar"><span /><span /><span /><em>You · GNX</em></div>
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
            <div className="cp-input"><Icon name="chat" size={13} color="var(--faint)" /><span>Tell GNX what to do…</span></div>
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
              <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
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

function Talk({ turns, layout = "stack" }) {
  const pairs = [];
  for (let i = 0; i < turns.length; i += 2) {
    if (turns[i] && turns[i + 1]) pairs.push({ you: turns[i], gnx: turns[i + 1] });
  }
  return (
    <ol className={`landing-talk landing-talk--${layout}`}>
      {pairs.map((pair) => (
        <li key={pair.you.text} className="landing-talk-pair">
          <div className="landing-talk-q">
            <span>You</span>
            <p>{pair.you.text}</p>
          </div>
          <div className="landing-talk-a">
            <span>GNX</span>
            <p>{pair.gnx.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
