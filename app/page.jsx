"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/ui/Logo";
import Aurora from "../components/ui/Aurora";
import Icon from "../components/ui/Icon";
import PublicFooter from "../components/layout/PublicFooter";

export default function LandingPage() {
  const router = useRouter();

  const steps = [
    { icon: 'target', title: 'Find & qualify', text: 'Scans millions of signals to find your ideal buyers and qualify them automatically.' },
    { icon: 'doc', title: 'Write & outreach', text: 'Writes personalized messages that start conversations and follows up at the right time.' },
    { icon: 'chat', title: 'Handle replies', text: 'Replies like a human, answers questions, and keeps every prospect moving.' },
    { icon: 'calendar', title: 'Book meetings', text: 'Qualifies interest and books meetings directly on your team\'s calendar.' },
  ];

  const outcomes = [
    { value: '3.2x', label: 'More meetings booked' },
    { value: '75%', label: 'Reply-rate increase' },
    { value: '40+', label: 'Hours saved per rep/month' },
    { value: '2–4 weeks', label: 'Time to first meetings' },
  ];

  const upcoming = [
    { day: 'Tomorrow', date: '10', initials: 'DC', type: 'Product demo', color: '#e5aa43' },
    { day: 'Wed', date: '11', initials: 'AH', type: 'Follow-up call', color: '#70c98c' },
    { day: 'Thu', date: '12', initials: 'LP', type: 'Technical review', color: '#69c2c0' },
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
          <nav className="landing-nav">
            <button onClick={() => scrollTo('landing-top')} aria-label="Globonexo home"><Logo size={34} light /></button>
            <div className="landing-nav-links">
              <button onClick={() => scrollTo('product')}>Product</button>
              <button onClick={() => scrollTo('how-it-works')}>How it works</button>
              <button onClick={() => scrollTo('results')}>Results</button>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div className="landing-nav-actions">
              <button className="landing-signin" onClick={handleSignIn}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/signup')}>
                Choose a plan <Icon name="arrow" size={16} color="#06231a" />
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
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Start with a paid plan <Icon name="arrow" size={18} color="#06231a" />
                </button>
                <button className="landing-outline-btn" onClick={handleSignIn}>Sign in</button>
              </div>
              <div className="landing-assurances">
                <span><Icon name="check" size={15} color="var(--g-300)" /> Monthly or annual billing</span>
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
                    {upcoming.map((meeting) => (
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

        <section className="landing-cta landing-section">
          <div>
            <h2 className="display">Put your AI sales rep to work.</h2>
            <p>Choose a paid plan, connect your inbox, and get your outbound workflow moving.</p>
          </div>
          <div className="landing-cta-actions">
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
              Choose a plan <Icon name="arrow" size={18} color="#06231a" />
            </button>
            <Link className="landing-outline-btn" href="/pricing">View pricing</Link>
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
}
