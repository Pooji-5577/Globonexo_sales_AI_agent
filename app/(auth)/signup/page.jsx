import { AuthAside } from "../../../components/layout/AuthAside";
import { SignupForm } from "../../../components/auth/SignupForm";

export const metadata = {
  title: "Create account — GNX sales",
};

export default function SignupPage() {
  return (
    <div className="screen auth-screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Start free"
        headline="Hire your AI sales rep in 5 minutes."
        sub="No credit card. Connect your inbox and the agent starts prospecting the same day."
        bullets={['14-day free trial, full access', '2-minute inbox & CRM connect', 'Cancel anytime']}
      />
      <div className="grow scroll auth-main" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <SignupForm />
      </div>
    </div>
  );
}
