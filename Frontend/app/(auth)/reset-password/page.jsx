import { AuthAside } from "../../../components/layout/AuthAside";
import { ResetPasswordForm } from "../../../components/auth/ResetPasswordForm";

export const metadata = {
  title: "Set a new password — Globonexo Sales AI",
};

export default function ResetPasswordPage() {
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Account recovery"
        headline="Almost there."
        sub="Choose a new password to get back into your account."
        bullets={['Encrypted reset link', 'No password shown to support', 'Back in under a minute']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
