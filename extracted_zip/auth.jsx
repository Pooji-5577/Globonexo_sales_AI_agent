/* Auth screens only (splash, login, signup, forgot) → window */
const { useState: useStateA } = React;

function AuthAside({ kicker, headline, sub, bullets }) {
  return (
    <div style={{
      position: 'relative', width: 420, flex: 'none', overflow: 'hidden',
      background: 'linear-gradient(160deg, #06311f, #064d33 55%, #066b4a)',
      color: '#fff', padding: '42px 40px', display: 'flex', flexDirection: 'column',
    }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Logo size={32} light />
        <div style={{ marginTop: 'auto' }}>
          <div className="eyebrow" style={{ color: 'var(--g-300)' }}>{kicker}</div>
          <h1 className="display" style={{ fontSize: 38, marginTop: 14, color: '#fff', maxWidth: 320, lineHeight: 1.08 }}>{headline}</h1>
          <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.5, color: 'rgba(255,255,255,.78)', maxWidth: 310 }}>{sub}</p>
          <div className="col" style={{ gap: 12, marginTop: 28 }}>
            {bullets.map((b, i) => (
              <div key={i} className="row" style={{ gap: 11 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name="check" size={14} color="#6fe7b0" stroke={2.8} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 36, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.14)' }}>
          <div className="row">
            {['Mara Ito', 'Devon Cole', 'Priya Raman'].map((n, i) => (
              <div key={n} style={{ marginLeft: i ? -9 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px #064d33' }}>
                <Avatar name={n} size={28} />
              </div>
            ))}
          </div>
          <span className="nw" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>4,200+ revenue teams</span>
        </div>
      </div>
    </div>
  );
}

/* ============ SPLASH ============ */
function Splash({ go }) {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(165deg, #06311f, #064d33 60%, #075a3e)' }} />
      <Aurora />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: 40, animation: 'rise .5s both' }}>
        <div style={{ animation: 'pop .5s both' }}><Logo size={64} light /></div>
        <p style={{ marginTop: 22, fontSize: 18, color: 'rgba(255,255,255,.74)', maxWidth: 440, marginInline: 'auto', lineHeight: 1.55 }}>
          Your autonomous AI sales rep. It finds buyers, writes outreach, handles replies, and books the meeting.
        </p>
        <div className="row center" style={{ gap: 14, marginTop: 32 }}>
          <button className="btn btn-primary btn-lg" onClick={() => go('signup')}>
            Get started free <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <button className="btn btn-lg" onClick={() => go('login')} style={{ color: '#fff', border: '1px solid rgba(255,255,255,.28)', background: 'rgba(255,255,255,.08)' }}>
            Sign in
          </button>
        </div>
        <div className="row center" style={{ gap: 18, marginTop: 30, fontSize: 13, color: 'rgba(255,255,255,.55)', flexWrap: 'wrap' }}>
          {['No credit card', '14-day trial', 'Live in 5 minutes'].map(t => (
            <span key={t} className="row nw" style={{ gap: 6 }}><Icon name="check" size={14} color="var(--g-300)" /> {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ LOGIN ============ */
function Login({ go }) {
  const [email, setEmail] = useStateA('mara@northwind.io');
  const [pw, setPw] = useStateA('••••••••••');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Welcome back"
        headline="Your pipeline ran all night."
        sub="While you were away, your agent sent 84 emails, handled 19 replies and booked 3 meetings."
        bullets={['Autonomous outreach & follow-up', 'Real-time buying-intent signals', 'Meetings booked on autopilot']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <h2 className="display" style={{ fontSize: 30 }}>Sign in</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Welcome back. Let's get to work.</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 26 }}>
            <Icon name="google" size={19} /> Continue with Google
          </button>
          <div className="row center" style={{ gap: 14, margin: '20px 0' }}>
            <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
          </div>
          <div className="col" style={{ gap: 16 }}>
            <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Field label="Password" icon="lock" toggle placeholder="Your password" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="row spread" style={{ marginTop: 14 }}>
            <label className="row nw" style={{ gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16 }} /> Remember me
            </label>
            <button onClick={() => go('forgot')} className="nw" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--g-700)' }}>Forgot password?</button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => go('dashboard')}>
            Sign in <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 22, fontSize: 14 }}>
            New to Globonexo? <button onClick={() => go('signup')} className="nw" style={{ color: 'var(--g-700)', fontWeight: 800 }}>Create an account</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ SIGN UP ============ */
function Signup({ go }) {
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Start free"
        headline="Hire your AI sales rep in 5 minutes."
        sub="No credit card. Connect your inbox and the agent starts prospecting the same day."
        bullets={['14-day free trial, full access', '2-minute inbox & CRM connect', 'Cancel anytime']}
      />
      <div className="grow scroll" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 400, maxWidth: '100%' }}>
          <h2 className="display" style={{ fontSize: 30 }}>Create your account</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Let's build your autonomous pipeline.</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 24 }}>
            <Icon name="google" size={19} /> Sign up with Google
          </button>
          <div className="row center" style={{ gap: 14, margin: '18px 0' }}>
            <hr className="divider grow" /><span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>OR</span><hr className="divider grow" />
          </div>
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="First name" icon="user" placeholder="Mara" />
              <Field label="Last name" placeholder="Ito" />
            </div>
            <Field label="Work email" icon="mail" placeholder="you@company.com" />
            <Field label="Company" icon="building" placeholder="Northwind Inc." />
            <Field label="Password" icon="lock" toggle placeholder="8+ characters" hint="Use 8+ characters with a number and a symbol." />
          </div>
          <label className="row" style={{ gap: 9, fontSize: 13, color: 'var(--muted)', marginTop: 16, cursor: 'pointer', lineHeight: 1.4 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--g-500)', width: 16, height: 16, marginTop: 2, flex: 'none' }} />
            <span>I agree to the <b style={{ color: 'var(--g-700)' }}>Terms</b> and <b style={{ color: 'var(--g-700)' }}>Privacy Policy</b>.</span>
          </label>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => go('onboarding')}>
            Create account <Icon name="arrow" size={18} color="#06231a" />
          </button>
          <p className="text-c muted" style={{ marginTop: 18, fontSize: 14 }}>
            Already have an account? <button onClick={() => go('login')} style={{ color: 'var(--g-700)', fontWeight: 800 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ FORGOT PASSWORD ============ */
function Forgot({ go }) {
  const [sent, setSent] = useStateA(false);
  const [email, setEmail] = useStateA('');
  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      <AuthAside
        kicker="Account recovery"
        headline="Let's get you back in."
        sub="We'll email a secure link to reset your password. Expires in 15 minutes."
        bullets={['Encrypted reset link', 'No password shown to support', 'Back in under a minute']}
      />
      <div className="grow" style={{ display: 'grid', placeItems: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <button className="row" onClick={() => go('login')} style={{ gap: 8, color: 'var(--muted)', fontWeight: 700, fontSize: 14, marginBottom: 22 }}>
            <Icon name="arrowLeft" size={17} /> Back to sign in
          </button>
          {!sent ? (
            <>
              <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name="lock" size={26} color="var(--g-600)" />
              </span>
              <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Reset password</h2>
              <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>Enter your work email and we'll send a reset link.</p>
              <div style={{ marginTop: 24 }}>
                <Field label="Work email" icon="mail" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => setSent(true)}>
                Send reset link <Icon name="send" size={17} color="#06231a" />
              </button>
            </>
          ) : (
            <div style={{ animation: 'pop .4s both' }}>
              <span style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center' }}>
                <Icon name="checkCircle" size={34} color="var(--g-500)" stroke={2} />
              </span>
              <h2 className="display" style={{ fontSize: 30, marginTop: 18 }}>Check your inbox</h2>
              <p className="muted" style={{ marginTop: 10, fontSize: 15, lineHeight: 1.55 }}>
                We sent a reset link to <b style={{ color: 'var(--ink)' }}>{email || 'your email'}</b>. Expires in 15 minutes.
              </p>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 24 }} onClick={() => go('login')}>
                Back to sign in
              </button>
              <button className="btn btn-block" style={{ marginTop: 10, color: 'var(--g-700)', fontWeight: 700 }} onClick={() => setSent(false)}>
                Didn't get it? Resend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Splash, Login, Signup, Forgot });
