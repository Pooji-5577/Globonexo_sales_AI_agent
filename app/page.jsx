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

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const problems = [
    { icon: 'target', text: 'Which companies fit what you sell' },
    { icon: 'users', text: 'Which person there is worth reaching' },
    { icon: 'doc', text: 'Whether they have the problem now' },
    { icon: 'chat', text: 'Why they should care today' },
  ];

  const steps = [
    { icon: 'target', title: 'Target', text: 'You define the ICP once. GNX works from it.' },
    { icon: 'search', title: 'Find', text: 'Matches companies to your ICP, then finds the right person at each.' },
    { icon: 'doc', title: 'Research', text: 'Checks fit and context before contact, not after.' },
    { icon: 'chat', title: 'Draft', text: 'Writes the email sequence, grounded in what it found.' },
    { icon: 'check', title: 'Approve', text: 'You review before anything sends. Or let it run.' },
    { icon: 'send', title: 'Reach', text: 'Email or AI voice call. Replies stop follow-ups automatically.' },
  ];

  const differentiators = [
    { icon: 'search', title: 'Qualified before it costs you', text: 'Fit is checked against your ICP before a single enrichment credit is spent, so your allowance goes to people who could actually buy.' },
    { icon: 'link', title: 'One brain, both channels', text: 'Email and voice work from the same context. The call knows what the emails said, because neither one improvises its own version of the prospect.' },
    { icon: 'checkCircle', title: 'Checked before you see it', text: 'A draft addressed to the wrong person or describing the wrong company is caught automatically, not left for you to spot on the thirtieth review.' },
  ];

  // Sourced from context-readiness.service.ts and email-validation.service.ts.
  const accuracy = [
    { icon: 'doc', title: 'It states what it does not know', text: 'The model is handed an explicit list of missing facts, not a vague instruction to avoid making things up. Telling it exactly what is absent is far stronger.' },
    { icon: 'target', title: 'Facts and guesses stay separate', text: 'A verified headcount is a fact. "They are struggling with pipeline" is a hypothesis, and hypotheses become questions, never claims.' },
    { icon: 'sliders', title: 'Readiness you can act on', text: 'A lead reads as "7 of 10 ready" with the missing pieces named. You can act on a missing fact. You cannot act on "68% quality".' },
    { icon: 'lock', title: 'Nothing is written on thin air', text: 'Without the required facts about a person and their company, no message is drafted at all. Silence beats a confident guess.' },
  ];

  const voicePoints = [
    'Adversarial scenarios, judged before a campaign ever dials',
    'Refuses to invent customers, pricing, or ROI it was never given',
    'Ends the call immediately on a do-not-call request',
    'Books only real calendar slots, never an invented time',
  ];

  const trust = [
    { icon: 'check', title: 'You approve every send', text: 'Nothing reaches a prospect without your sign-off.' },
    { icon: 'lock', title: 'Suppression built in', text: 'Unsubscribed and bounced records are excluded before drafting.' },
    { icon: 'calendar', title: 'Do-not-call respected', text: 'Voice outreach checks status before dialing.' },
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
                    <button className="landing-outline-btn" onClick={() => scrollTo('how-it-works')}>See how it works</button>
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
          <div className="landing-section-intro">
            <h2 className="display">Volume was never the problem</h2>
            <p>A faster way to reach the wrong person is still the wrong person. Before anyone gets contacted, GNX works out:</p>
          </div>
          <div className="landing-problem-list">
            {problems.map((item, index) => (
              <div key={item.text} className="landing-problem-row">
                <span className="landing-problem-index">{String(index + 1).padStart(2, '0')}</span>
                <Icon name={item.icon} size={20} color="var(--g-600)" />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="copilot" className="landing-copilot landing-section">
          <div className="landing-copilot-copy">
            <span className="landing-fit-label">AI Co-Pilot</span>
            <h2 className="display">One agent runs the whole thing</h2>
            <p>Your co-pilot works the outreach cycle end to end. It picks the targets, does the research, writes the sequence, sends it, and handles the follow-ups. You step in only where you want to.</p>
            <ul className="landing-copilot-points">
              {[
                'Runs end to end, not step by step',
                'Keeps working between your campaigns',
                'Stops follow-ups the moment someone replies',
                'Hands you the controls whenever you want them',
              ].map((point) => (
                <li key={point}>
                  <div className="landing-usecase-icon landing-usecase-icon--accent landing-usecase-icon--sm">
                    <Icon name="check" size={14} color="#fff" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-copilot-visual" data-illustration="copilot" />
        </section>

        <section id="how-it-works" className="landing-how landing-section">
          <div className="landing-section-intro">
            <h2 className="display">How GNX works</h2>
            <p>Six stages, run for you. Your approval wherever you want it.</p>
          </div>
          <div className="landing-steps landing-steps-6">
            {steps.map((step, index) => (
              <article key={step.title}>
                <div className="landing-step-icon"><Icon name={step.icon} size={19} color="#fff" /></div>
                <h3><span className="landing-step-num">{String(index + 1).padStart(2, '0')}</span>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-usecase landing-section">
          <div className="landing-section-intro">
            <h2 className="display">What sets it apart</h2>
            <p>Not another email blaster with an AI label.</p>
          </div>
          <div className="landing-usecase-grid">
            {differentiators.map((item) => (
              <article key={item.title}>
                <div className="landing-usecase-icon landing-usecase-icon--accent">
                  <Icon name={item.icon} size={20} color="#fff" />
                </div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="accuracy" className="landing-accuracy landing-section">
          <div className="landing-section-intro">
            <span className="landing-fit-label">Accuracy</span>
            <h2 className="display">It knows what it doesn&apos;t know</h2>
            <p>The fastest way to lose a prospect is a confident message about something that was never true. Most of this system exists to stop that.</p>
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
            <Icon name="alertCircle" size={16} color="var(--g-700)" />
            <span>The classic bad AI sales line is &ldquo;I know your team is struggling with X&rdquo; — written by a system that never knew that. GNX is built so it cannot write that sentence.</span>
          </p>
        </section>

        <section id="voice" className="landing-voice landing-section">
          <div className="landing-voice-copy">
            <span className="landing-fit-label">AI voice calling</span>
            <h2 className="display">It gets tested before it calls anyone</h2>
            <p>
              Before a voice campaign goes live, the agent is put through adversarial scenarios and scored on each
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
          <div className="landing-voice-visual" data-illustration="voice" />
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

        <section className="landing-trust landing-section">
          <div className="landing-section-intro">
            <h2 className="display">Trust and control</h2>
            <p>The parts of outreach that are easy to get wrong, handled by default.</p>
          </div>
          <div className="landing-trust-band">
            {trust.map((item) => (
              <div key={item.title} className="landing-trust-item">
                <div className="landing-usecase-icon landing-usecase-icon--accent">
                  <Icon name={item.icon} size={20} color="#fff" />
                </div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-fit landing-section">
          <div className="landing-fit-grid">
            <div>
              <span className="landing-fit-label">Built for</span>
              <h3>An individual, agency, or startup with a defined target market.</h3>
            </div>
            <div>
              <span className="landing-fit-label">Not built for</span>
              <h3>Blasting a database and hoping volume covers relevance.</h3>
            </div>
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
