export const metadata = {
  title: "Pricing — GNX sales",
  description: "Choose a GNX sales plan for AI outbound, replies, voice calls, and booked meetings.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";
import { MOST_POPULAR_PLAN_ID, PLAN_CONFIG } from "../../lib/plans";

const plans = PLAN_CONFIG.map((plan) => ({
  ...plan,
  price: `$${plan.monthly}`,
  annual: `$${plan.annualTotal.toLocaleString()}/year`,
  cta: `Start ${plan.name}`,
  featured: plan.id === MOST_POPULAR_PLAN_ID,
  features: plan.feats,
}));

export default function PricingPage() {
  return (
    <div className="public-page public-page--tinted">
      <PublicNav />

      <main>
        <section className="pricing-hero public-section">
          <span className="eyebrow">Pricing</span>
          <h1 className="display">Hire your AI sales rep without adding headcount.</h1>
          <p>Choose a monthly or annual paid plan. Every tier includes the same core sales loop; credits set the ceiling and flex across enrichment, drafting, and calling.</p>
        </section>

        <section className="pricing-grid public-section" aria-label="Pricing plans">
          {plans.map((plan) => (
            <article key={plan.name} className={plan.featured ? "pricing-card featured" : "pricing-card"}>
              {plan.featured ? <span className="pricing-badge">Most popular</span> : null}
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="pricing-price"><strong>{plan.price}</strong><span>/month</span></div>
              <p className="muted" style={{ marginTop: 6 }}>or {plan.annual}</p>
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
            <p>Every plan includes AI email sequences, lead enrichment from verified data providers, AI voice calling, human-approved replies, inbox review, dashboard metrics, and support access. One credit is one cent of reported provider cost.</p>
          </div>
          <Link className="btn btn-primary btn-lg" href="/signup">
            Create account <Icon name="arrow" size={16} color="#06231a" />
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
