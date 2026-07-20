import { AuthAside } from "../../../components/layout/AuthAside";
import { ForgotPasswordForm } from "../../../components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset password — Globonexo Sales AI",
};

export default function ForgotPasswordPage() {
  return (
    <div className="screen auth-screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Account recovery"
        headline="Let's get you back in."
        sub="We'll email a secure link to reset your password. Expires in 15 minutes."
        bullets={['Encrypted reset link', 'No password shown to support', 'Back in under a minute']}
      />
      <div className="grow auth-main" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
