export const metadata = {
  title: "GNX Sales solutions",
  description: "See how GNX Sales fits an individual seller, an agency running outbound for clients, or a startup building outbound in-house.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";
import { PLAN_CONFIG } from "../../lib/plans";

// Segments mirror the real plan catalogue rather than inventing audience
// categories the product cannot actually serve (there is no seat/team system,
// so "per rep" framing would be selling something that does not exist).
const segments = [
  {
    id: "individual",
    planId: "starter",
    icon: "user",
    eyebrow: "For an individual",
    title: "Run outbound alone without it becoming your whole day.",
    intro:
      "One person can only research, write, and follow up so many times a week. GNX takes the repetitive half of that and leaves you the conversations.",
    steps: [
      { icon: "target", title: "Define the ICP once", body: "You describe who you sell to a single time. Every campaign after that works from it, so you are not rebuilding a lead list by hand each week." },
      { icon: "search", title: "Fit checked before spend", body: "Accounts are checked against your ICP before any enrichment is paid for, so your allowance goes toward people who could actually buy." },
      { icon: "doc", title: "Sequences written for you", body: "First touch, follow-up, and breakup are drafted as one coherent sequence, so later steps do not repeat the same pitch." },
      { icon: "check", title: "You stay in the loop", body: "Review and edit before anything sends, or turn on autopilot per campaign once you trust it." },
    ],
  },
  {
    id: "agency",
    planId: "growth",
    icon: "building",
    eyebrow: "For an agency",
    title: "Run outbound for every client from one system.",
    intro:
      "Each client gets its own campaigns, its own ideal-customer profile, and its own conversation flow, without accounts bleeding into one another.",
    steps: [
      { icon: "target", title: "A separate profile per client", body: "Each campaign carries its own targeting rules and qualification criteria, so one client's accounts never end up in another's pipeline." },
      { icon: "chat", title: "Outreach in each client's voice", body: "Campaigns store their own product description, value proposition, tone, and objection handling rather than sharing one global setting." },
      { icon: "lock", title: "Campaign settings stay frozen", body: "A campaign keeps the brief it launched with. Changing one client's positioning next month does not silently rewrite outreach you already sent." },
      { icon: "send", title: "Email and voice per client", body: "Voice campaigns get their own agent and conversation flow, so two clients with different offers never share one prompt." },
    ],
  },
  {
    id: "startup",
    planId: "scale",
    icon: "trend",
    eyebrow: "For a startup",
    title: "Build an in-house outbound motion at volume.",
    intro:
      "More campaigns running at once, a higher daily sending ceiling, and the same guardrails applied to every message that goes out.",
    steps: [
      { icon: "grid", title: "More campaigns in parallel", body: "Run separate motions for different segments, products, or regions at the same time instead of queueing them one after another." },
      { icon: "spark", title: "Autopilot where it is earned", body: "Turn autopilot on per campaign. It changes who approves the message, never whether the message was validated." },
      { icon: "phone", title: "Voice as a real channel", body: "Voice campaigns scale with the plan and draw from the same credit pool as email, so reaching by phone is never an upsell." },
      { icon: "trend", title: "Visibility into what ran", body: "Campaign and voice-call analytics, plus per-lead rejection reasons, so a shortfall shows up as a targeting insight instead of a silent gap." },
    ],
  },
];

export default function SolutionsPage() {
  const planFor = (id) => PLAN_CONFIG.find((p) => p.id === id);

  return (
    <div className="public-page story-page">
      <div className="story-hero-band">
        <PublicNav variant="dark" />
        <section className="story-hero public-section">
          <span className="eyebrow">Solutions</span>
          <h1 className="display">Built for how you actually sell.</h1>
          <p>
            The same AI sales agent, framed three ways. Every plan includes the full capability set — email
            sequences, lead enrichment, and AI voice calling. What changes is volume, not access.
          </p>
          <div className="content-hero-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={18} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/contact">Talk to us</Link>
          </div>
          <nav className="solutions-jump" aria-label="Jump to segment">
            {segments.map((segment) => (
              <a key={segment.id} href={`#${segment.id}`}>{segment.eyebrow}</a>
            ))}
          </nav>
        </section>
      </div>

      <main>

        {segments.map((segment, index) => {
          const plan = planFor(segment.planId);
          return (
            <section key={segment.id} id={segment.id} className={`content-section public-section solutions-segment${index > 0 ? " solutions-segment--divider" : ""}`}>
              <div className="content-section-head">
                <span className="content-card-icon"><Icon name={segment.icon} size={20} color="var(--g-700)" /></span>
                <span className="eyebrow">{segment.eyebrow}</span>
                <h2>{segment.title}</h2>
                <p>{segment.intro}</p>
                {plan && (
                  <div className="solutions-plan-line">
                    <strong>{plan.name} — ${plan.monthly}/mo</strong>
                    <span>
                      {plan.monthlyCredits.toLocaleString()} credits · {plan.emailCampaigns} email campaigns ·{" "}
                      {plan.voiceCampaigns} voice campaign{plan.voiceCampaigns === 1 ? "" : "s"} ·{" "}
                      {plan.dailyEmailCap} emails/day
                    </span>
                  </div>
                )}
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
          );
        })}

        <section className="solutions-cta">
          <div>
            <h2>See it run on your pipeline.</h2>
            <p>Choose a plan, connect your inbox, and put your agent to work.</p>
          </div>
          <div className="content-cta-actions">
            <Link className="btn btn-primary btn-lg" href="/signup">
              Choose a plan <Icon name="arrow" size={16} color="#06231a" />
            </Link>
            <Link className="landing-outline-btn" href="/contact">Contact support</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
