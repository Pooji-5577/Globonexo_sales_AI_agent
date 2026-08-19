export const metadata = {
  title: "GNX Sales pricing",
  description: "Choose a GNX sales plan for AI outbound, replies, voice calls, and booked meetings.",
};

import Link from "next/link";
import Icon from "../../components/ui/Icon";
import PublicNav from "../../components/layout/PublicNav";
import PublicFooter from "../../components/layout/PublicFooter";
import PlanCards from "../../components/marketing/PlanCards";

// The contrast that used to sit on the landing page. It belongs here, next to
// the prices, where someone is actually deciding.
const comparison = [
  { them: 'Buy a list and send to all of it', us: 'Every account checked against your profile first' },
  { them: 'Pay to enrich, then find out they were a bad fit', us: 'Fit is settled before a credit is spent' },
  { them: 'Email only — calling is a different tool and a second bill', us: 'Email and AI voice from one shared pool' },
  { them: 'The model writes whatever sounds convincing', us: 'It is handed an explicit list of what it does not know' },
  { them: 'A voice agent goes live untested', us: 'Stress-tested against adversarial calls before it dials' },
  { them: 'You remember to stop the sequence after a reply', us: 'A reply stops the follow-ups on its own' },
];

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
          <PlanCards />
        </section>

        <section className="pricing-compare public-section">
          <div className="content-section-head">
            <h2>Why this costs less than the alternative</h2>
            <p>Not a cheaper version of the same thing. A different way of deciding who gets contacted.</p>
          </div>
          <div className="cmp">
            <div className="cmp-head">
              <span>The usual way</span>
              <span className="cmp-head-us">GNX Sales</span>
            </div>
            {comparison.map((row) => (
              <div key={row.us} className="cmp-row">
                <div className="cmp-them"><Icon name="close" size={15} color="var(--stop)" /><p>{row.them}</p></div>
                <div className="cmp-us"><Icon name="check" size={15} color="var(--g-800)" /><p>{row.us}</p></div>
              </div>
            ))}
          </div>
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
