import { Aurora } from '../ui/Aurora';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

export function AuthAside({ kicker, headline, sub, bullets }) {
  return (
    <div className="auth-aside" style={{
      position: 'relative', flex: 'none', overflow: 'hidden',
      background: 'linear-gradient(160deg, #06311f, #064d33 55%, #066b4a)',
      color: '#fff', padding: '42px 40px', display: 'flex', flexDirection: 'column',
    }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', minHeight: 0 }}>
        <div>
          <Logo size={32} light />
        </div>
        <div style={{ alignSelf: 'center', padding: '32px 0' }}>
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
        <div className="row" style={{ gap: 10, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.14)' }}>
          <Icon name="globe" size={18} color="rgba(255,255,255,.7)" stroke={1.8} />
          <span className="nw" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>Trusted by revenue teams</span>
        </div>
      </div>
    </div>
  );
}
