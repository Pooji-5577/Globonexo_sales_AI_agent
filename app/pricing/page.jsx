export const metadata = {
  title: "Pricing — Globonexo Sales AI",
  description: "Choose a Globonexo Sales AI plan for AI outbound, replies, voice calls, and booked meetings.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";

const plans = [
  {
    name: "Starter",
    price: "$99",
    description: "For founders validating outbound with one AI sales agent.",
    cta: "Start Starter",
    featured: false,
    features: [
      "1 user and 1 AI agent",
      "Up to 1,000 outbound emails/month",
      "Apollo search and CSV upload",
      "Human-approved AI replies",
      "Basic dashboard and inbox",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    description: "For small sales teams ready to run email and voice campaigns.",
    cta: "Start Growth",
    featured: true,
    features: [
      "3 users and 3 AI agents",
      "Up to 5,000 outbound emails/month",
      "AI voice campaigns via Retell",
      "Campaign analytics and hot lead tracking",
      "Priority onboarding support",
    ],
  },
  {
    name: "Scale",
    price: "$799",
    description: "For teams that need higher volume, tighter controls, and admin visibility.",
    cta: "Talk to sales",
    featured: false,
    features: [
      "10 users and 10 AI agents",
      "Up to 20,000 outbound emails/month",
      "Advanced send caps and approval controls",
      "Admin, support, and impersonation tools",
      "Dedicated launch review",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="public-page">
      <PublicNav />

      <main>
        <section className="pricing-hero public-section">
          <span className="eyebrow">Pricing</span>
          <h1 className="display">Hire your AI sales rep without adding headcount.</h1>
          <p>Start with email outbound, add voice when you are ready, and keep every AI reply under human control for v0.1.</p>
        </section>

        <section className="pricing-grid public-section" aria-label="Pricing plans">
          {plans.map((plan) => (
            <article key={plan.name} className={plan.featured ? "pricing-card featured" : "pricing-card"}>
              {plan.featured ? <span className="pricing-badge">Most popular</span> : null}
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="pricing-price"><strong>{plan.price}</strong><span>/month</span></div>
              <Link className={plan.featured ? "btn btn-primary btn-block" : "btn btn-ghost btn-block"} href="/signup">
                {plan.cta} <Icon name="arrow" size={16} color="currentColor" />
              </Link>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Icon name="checkCircle" size={18} color="var(--g-600)" />{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="pricing-note public-section">
          <div>
            <h2>Every plan includes the core sales loop.</h2>
            <p>Gmail sending, Apollo and CSV lead sourcing, AI-generated email sequences, reply drafting, inbox review, dashboard metrics, and support access are included.</p>
          </div>
          <Link className="btn btn-dark" href="/signup">Create account</Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
