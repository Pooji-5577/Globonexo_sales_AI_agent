export const metadata = {
  title: "No guessing — GNX Sales",
  description:
    "How GNX Sales keeps AI outreach truthful: context readiness gates, facts separated from hypotheses, and every draft validated before a human ever sees it.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const principles = [
  {
    icon: "doc",
    title: "The model is told what is missing",
    body: "Rather than a generic instruction not to hallucinate, the agent receives a concrete list of what is unavailable for this specific lead: no funding stage, no technology information, no headcount, no reliable first name. Naming the gaps is far stronger than warning against them.",
  },
  {
    icon: "target",
    title: "Facts and hypotheses are labelled apart",
    body: "A provider-reported headcount is a fact. “This company is struggling with pipeline efficiency” is a hypothesis. The two are kept separate, and hypotheses are only ever turned into questions — never asserted as things we know.",
  },
  {
    icon: "sliders",
    title: "Readiness is an ingredient list",
    body: "A lead is reported as “7 of 10 ready” with the missing pieces named, not as an arbitrary quality percentage. You can act on a missing job title. There is nothing you can do with “68%”.",
  },
  {
    icon: "lock",
    title: "Required facts are a hard gate",
    body: "Identity, role, company, and a work email are required. Without them nothing is drafted at all. Optional facts change how personalized a message can be; required facts decide whether one exists.",
  },
  {
    icon: "clock",
    title: "Scored only when enrichment is finished",
    body: "Readiness is calculated after enrichment reaches a terminal state. Scoring a lead mid-enrichment measures our own impatience rather than the data, and would write a thin email while richer context was moments away.",
  },
  {
    icon: "refresh",
    title: "Every message is explainable",
    body: "Context is captured as a stable, hashed snapshot. For any message that went out, the exact facts, campaign configuration, and model version behind it can be traced — rather than shrugging at a black box.",
  },
];

const validations = [
  { title: "Wrong recipient", body: "The greeting names someone other than the actual lead." },
  { title: "Foreign company", body: "The body describes a different company than the one being written to." },
  { title: "Unresolved placeholders", body: "Template variables that never got filled in." },
  { title: "Leaked formatting", body: "Markdown or HTML bleeding into a plain-text message." },
  { title: "Wrong sequence step", body: "Follow-up content saved against the first-touch slot." },
  { title: "Duplicate content", body: "The same message repeated across steps or leads." },
];

export default function AccuracyPage() {
  return (
    <div className="public-page">
      <PublicNav />

      <main>
        <section className="content-hero public-section">
          <span className="eyebrow">No guessing</span>
          <h1 className="display">It knows what it doesn&apos;t know.</h1>
          <p>
            The real risk with AI outreach is not a clumsy sentence. It is a confident, fluent message about
            something that was never true — sent under your name, to someone you wanted as a customer.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/voice">How voice is tested</Link>
          </div>
        </section>

        <section className="content-section public-section">
          <div className="accuracy-quote">
            <Icon name="alertCircle" size={22} color="var(--g-700)" />
            <blockquote>“I know your team is struggling with hiring velocity.”</blockquote>
            <p>
              Written by a system that never knew that. It is the line that makes a prospect distrust every other
              sentence in the message. GNX is built so it cannot write it.
            </p>
          </div>
        </section>

        <section className="content-section public-section">
          <div className="content-section-head">
            <h2>How that is enforced</h2>
            <p>Six decisions in how context is gathered, scored, and handed to the model.</p>
          </div>
          <div className="card-grid">
            {principles.map((item) => (
              <article key={item.title} className="content-card">
                <span className="content-card-icon"><Icon name={item.icon} size={20} color="var(--g-700)" /></span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section public-section">
          <div className="content-section-head">
            <h2>A draft is invalid until it proves otherwise</h2>
            <p>
              Generated content is not written straight to the wire. Each draft is checked, and a failure is
              regenerated once — then recorded as a failure rather than quietly shown to you as if it were fine.
            </p>
          </div>
          <div className="accuracy-checks">
            {validations.map((item) => (
              <div key={item.title}>
                <Icon name="close" size={16} color="#c0392b" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="voice-baseline">
            <Icon name="checkCircle" size={18} color="var(--g-700)" />
            <span>
              Someone approving thirty emails in a row should not be the last line of defence against one of them
              being addressed to the wrong person. That is what these checks are for.
            </span>
          </p>
        </section>

        <section className="content-section public-section">
          <div className="content-section-head">
            <h2>Autopilot changes who approves, not what is checked</h2>
            <p>
              Turning on autopilot for a campaign means messages are approved automatically instead of by you.
              It does not skip validation, suppression, or the send-time eligibility checks. Every message still
              passes the same pipeline — and a lead who replied, unsubscribed, booked, or asked not to be
              contacted is re-checked at the last possible moment before anything sends.
            </p>
          </div>
        </section>

        <section className="solutions-cta">
          <div>
            <h2>Outreach you can stand behind.</h2>
            <p>Choose a plan and see what the agent knows about a lead before it writes a word.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={16} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/pricing">View pricing</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
