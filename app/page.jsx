"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Logo from "../components/ui/Logo";
import Aurora from "../components/ui/Aurora";
import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";

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
              <button className="landing-signin" onClick={() => router.push('/login')}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/signup')}>
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
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Start free trial <Icon name="arrow" size={18} color="#06231a" />
                </button>
                <button className="landing-outline-btn" onClick={() => router.push('/login')}>Sign in</button>
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
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
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
