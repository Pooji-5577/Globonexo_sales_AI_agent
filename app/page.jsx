"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../components/ui/Logo";
import Aurora from "../components/ui/Aurora";
import Icon from "../components/ui/Icon";
import PublicNav from "../components/layout/PublicNav";
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

  const googleScopes = [
    {
      icon: 'send',
      scope: 'gmail.send',
      title: 'Send your outreach and follow-ups',
      text: 'GNX Sales sends the outreach emails and scheduled follow-ups you have approved from your own Gmail account, so prospects see your address and every message stays in your Sent mail.',
    },
    {
      icon: 'inbox',
      scope: 'gmail.readonly',
      title: 'Detect replies and stop follow-ups',
      text: 'GNX Sales reads the message threads it started on your behalf to detect when a prospect replies. That is how a pending follow-up is cancelled automatically and how the conversation appears in your Inbox view. We do not read unrelated mail in your mailbox.',
    },
    {
      icon: 'user',
      scope: 'userinfo.email',
      title: 'Show which account is connected',
      text: 'We read the email address of the Google account you connect so we can display it in Settings and send from the right mailbox.',
    },
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
                <span>{index + 1}</span>
                <div className="landing-step-icon"><Icon name={step.icon} size={22} color="var(--g-800)" /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="what-we-do" className="landing-usecase landing-section">
          <div className="landing-section-intro">
            <h2 className="display">What GNX Sales does</h2>
            <p>
              GNX Sales helps sales teams and founders write personalized outreach messages and automatically
              follow up with prospects at the right time. Instead of manually drafting emails or tracking who to
              follow up with, GNX Sales handles the writing and timing so you can focus on closing deals.
            </p>
          </div>

          <div className="landing-usecase-head">
            <h3>How GNX Sales uses your Google account data</h3>
            <p>
              Connecting Gmail is optional and takes one click in Settings. You can also use a custom SMTP + IMAP
              mailbox. When you connect Gmail, GNX Sales requests only the permissions below, and uses each one for
              a single purpose in the product.
            </p>
          </div>

          <div className="landing-usecase-grid">
            {googleScopes.map((item) => (
              <article key={item.scope}>
                <div className="landing-usecase-icon"><Icon name={item.icon} size={20} color="var(--g-800)" /></div>
                <code>{item.scope}</code>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="landing-usecase-note">
            <div className="landing-usecase-icon"><Icon name="lock" size={20} color="var(--g-800)" /></div>
            <div>
              <h4>Limited Use disclosure</h4>
              <p>
                GNX Sales&apos; use and transfer of information received from Google APIs to any other app will
                adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements. We do not sell Google user data, do not use it for
                advertising, and do not use it to train generalized AI or machine learning models. Google user data
                is used only to provide the sending and reply-tracking features described above.
              </p>
              <p>
                You can disconnect Google at any time from Settings, which deletes the access and refresh tokens we
                store, and you can also revoke access from your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Account permissions page
                </a>
                . See our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link> for
                full details.
              </p>
            </div>
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
