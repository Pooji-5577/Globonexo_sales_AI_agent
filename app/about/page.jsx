export const metadata = {
  title: "About Us — Globonexo Sales AI",
  description: "Globonexo builds AI sales agents that find buyers, start conversations, and book meetings for small sales teams.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const values = [
  {
    icon: "target",
    title: "Outcomes, not activity",
    body: "Sending more email is not the goal. We measure ourselves on qualified conversations and meetings that actually land on a calendar.",
  },
  {
    icon: "user",
    title: "Humans stay in control",
    body: "Every AI reply can be reviewed before it goes out. Automation should remove busywork, not remove judgement from your pipeline.",
  },
  {
    icon: "lock",
    title: "Careful with your data",
    body: "Lead lists and customer conversations are sensitive. We keep integrations scoped, retention clear, and we never sell your data.",
  },
  {
    icon: "bolt",
    title: "Fast to first value",
    body: "Onboarding is measured in days, not quarters. A new team should have a working agent and a live campaign in the first week.",
  },
];

const milestones = [
  { year: "2025", title: "Started with one problem", body: "Small sales teams were losing hours a day to prospecting, follow-ups, and inbox triage instead of selling." },
  { year: "2026", title: "Launched the core loop", body: "Lead sourcing, AI email sequences, reply handling, and meeting booking shipped as one connected workflow." },
  { year: "Today", title: "Adding voice", body: "AI voice campaigns and deeper analytics are rolling out so teams can reach buyers on more than one channel." },
];

export default function AboutPage() {
  return (
    <div className="public-page">
      <PublicNav />

      <main>
        <section className="content-hero public-section">
          <span className="eyebrow">About us</span>
          <h1 className="display">We are building the sales rep that never drops a follow-up.</h1>
          <p>
            Globonexo Sales AI gives small teams the outbound capacity of a much larger one. Our agents find the right
            buyers, write messages worth replying to, handle the back and forth, and book the meeting, while your team
            stays focused on the conversations that close.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Start free trial <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/contact">Talk to us</Link>
          </div>
        </section>

        <section className="about-stats public-section" aria-label="Company at a glance">
          {[
            { value: "3.2x", label: "More meetings booked" },
            { value: "40+", label: "Hours saved per rep each month" },
            { value: "2–4 weeks", label: "To first booked meetings" },
            { value: "24/7", label: "Agents working your pipeline" },
          ].map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="content-section public-section">
          <div className="content-section-head">
            <h2>What we believe</h2>
            <p>The principles that decide what we build and what we refuse to ship.</p>
          </div>
          <div className="card-grid">
            {values.map((value) => (
              <article key={value.title} className="content-card">
                <span className="content-card-icon"><Icon name={value.icon} size={20} color="var(--g-700)" /></span>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section public-section">
          <div className="content-section-head">
            <h2>Where we are</h2>
            <p>A short history of how the product got here.</p>
          </div>
          <ol className="about-timeline">
            {milestones.map((item) => (
              <li key={item.year}>
                <span className="about-timeline-year">{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="content-cta public-section">
          <div>
            <h2>See it run on your pipeline.</h2>
            <p>Start a free trial, or reach out and we will walk through your outbound motion with you.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-dark" href="/signup">Create account</Link>
            <Link className="btn btn-ghost" href="/contact">Contact support</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
