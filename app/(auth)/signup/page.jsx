import { AuthAside } from "../../../components/layout/AuthAside";
import { SignupForm } from "../../../components/auth/SignupForm";

export const metadata = {
  title: "Create a GNX Sales account",
};

export default function SignupPage() {
  return (
    <div className="screen auth-screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Choose your plan"
        headline="Hire your AI sales rep in 5 minutes."
        sub="Create your account, complete billing, and connect your inbox to get started."
        bullets={['Monthly and annual plans', '2-minute inbox & CRM connect', 'Cancel whenever you want']}
      />
      <div className="grow scroll auth-main" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <SignupForm />
      </div>
    </div>
  );
}
