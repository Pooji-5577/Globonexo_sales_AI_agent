import { AuthAside } from "../../../components/layout/AuthAside";
import { LoginForm } from "../../../components/auth/LoginForm";

export const metadata = {
  title: "Sign in to GNX Sales",
};

export default function LoginPage() {
  return (
    <div className="screen auth-screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Welcome back"
        headline="Your pipeline ran all night."
        sub="While you were away, your agent sent 84 emails, handled 19 replies and booked 3 meetings."
        bullets={['Autonomous outreach & follow-up', 'Real-time buying-intent signals', 'Meetings booked on autopilot']}
      />
      <div className="grow auth-main" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <LoginForm />
      </div>
    </div>
  );
}
