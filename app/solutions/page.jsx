export const metadata = {
  title: "Solutions — GNX sales",
  description: "See how GNX sales fits SDR teams, founders and small teams, and agencies running outbound for clients.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const segments = [
  {
    id: "sdr-teams",
    icon: "users",
    eyebrow: "For SDR teams",
    title: "Give every rep an AI teammate that never lets a lead go cold.",
    intro: "Globonexo runs the repetitive half of prospecting — sourcing, sequencing, replies, and booking — so your reps spend their time on conversations that are already qualified.",
    steps: [
      { icon: "target", title: "Full pipelines, automatically", body: "Each rep's AI agent keeps sourcing and qualifying new accounts in the background, so quota never depends on how much manual prospecting time is left in the day." },
      { icon: "doc", title: "Consistent outreach at scale", body: "Every rep sends personalized sequences at the same quality bar, without spending hours a week writing and rewriting the same emails." },
      { icon: "chat", title: "No reply sits untouched", body: "The AI handles first-line replies and objections immediately, so an interested lead never goes cold waiting for a human to reach the inbox." },
      { icon: "calendar", title: "Meetings land on the calendar", body: "Qualified conversations convert straight into booked meetings, so reps walk into calls that are already warm." },
    ],
  },
  {
    id: "founders",
    icon: "spark",
    eyebrow: "For founders & small teams",
    title: "Run outbound like you already have an SDR team.",
    intro: "Globonexo gives founders and early sales hires the prospecting capacity of a much bigger team, without the hire, the ramp time, or the management overhead.",
    steps: [
      { icon: "target", title: "Find buyers without a research hire", body: "The agent scans millions of signals to find companies that look like your best customers, so you are not the one building lead lists by hand." },
      { icon: "doc", title: "Outreach that sounds like you", body: "Sequences are written in your product's voice and personalized per lead, so early customers hear from something that reads like a real founder, not a template." },
      { icon: "chat", title: "Replies handled while you build", body: "Common questions and objections get answered immediately, so you are not context-switching out of product work every time your inbox pings." },
      { icon: "calendar", title: "Wake up to booked meetings", body: "Interested leads convert straight into meetings on your calendar, so your day starts with calls instead of triage." },
    ],
  },
  {
    id: "agencies",
    icon: "building",
    eyebrow: "For agencies",
    title: "Run outbound for every client from one system.",
    intro: "Manage prospecting, sequencing, replies, and meetings for all of your clients' pipelines without multiplying your headcount for every new account you sign.",
    steps: [
      { icon: "target", title: "Qualify the right buyers per client", body: "Each client's agent sources and qualifies against that client's own ideal-customer profile, so accounts don't get mixed across pipelines." },
      { icon: "doc", title: "On-brand outreach for every account", body: "Sequences are written and personalized in each client's voice, so outreach reads as if it came from their own team, not a shared vendor." },
      { icon: "chat", title: "Replies handled without adding staff", body: "First-line replies and objections are handled automatically across every client account, so headcount does not have to grow with the client roster." },
      { icon: "calendar", title: "Meetings booked to each client's calendar", body: "Qualified conversations convert straight into meetings on the right client's calendar, so handoff stays clean between accounts." },
    ],
  },
];

export default function SolutionsPage() {
  return (
    <div className="public-page public-page--tinted">
      <PublicNav />

      <main>
        <section className="content-hero solutions-hero public-section">
          <span className="eyebrow">Solutions</span>
          <h1 className="display">Built for how your team actually sells.</h1>
          <p>
            The same AI sales agent, framed for how you run outbound today. Jump to the section closest to your team,
            or choose a plan and see it work on your own pipeline.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/contact">Talk to us</Link>
          </div>
          <nav className="solutions-jump" aria-label="Jump to segment">
            {segments.map((segment) => (
              <a key={segment.id} href={`#${segment.id}`}>{segment.eyebrow}</a>
            ))}
          </nav>
        </section>

        <section className="about-stats public-section" aria-label="Results at a glance">
          {[
            { value: "3.2x", label: "More meetings booked" },
            { value: "75%", label: "Reply-rate increase" },
            { value: "40+", label: "Hours saved per rep/month" },
            { value: "2–4 weeks", label: "Time to first meetings" },
          ].map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        {segments.map((segment, index) => (
          <section key={segment.id} id={segment.id} className={`content-section public-section solutions-segment${index > 0 ? " solutions-segment--divider" : ""}`}>
            <div className="content-section-head">
              <span className="content-card-icon"><Icon name={segment.icon} size={20} color="var(--g-700)" /></span>
              <span className="eyebrow">{segment.eyebrow}</span>
              <h2>{segment.title}</h2>
              <p>{segment.intro}</p>
            </div>
            <div className="card-grid solutions-values-grid">
              {segment.steps.map((step) => (
                <article key={step.title} className="content-card">
                  <span className="content-card-icon"><Icon name={step.icon} size={20} color="var(--g-700)" /></span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="solutions-cta">
          <div>
            <h2>See it run on your pipeline.</h2>
            <p>Start a free trial, or reach out and we will walk through your outbound motion with you.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Create account <Icon name="arrow" size={16} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/contact">Contact support</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
