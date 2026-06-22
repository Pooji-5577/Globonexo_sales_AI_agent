/* Shared components → window */
const { useState, useRef, useEffect } = React;

/* ---- Brand logo ---- */
function Logo({ size = 34, showWord = true, light = false }) {
  return (
    <div className="row" style={{ gap: 11, alignItems: 'center' }}>
      <div style={{ width: size, height: size, position: 'relative', flex: 'none' }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="lg" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#29d68f"/><stop offset=".5" stopColor="#00c27a"/><stop offset="1" stopColor="#15c4c0"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lg)"/>
          <path d="M27 14.5a8.5 8.5 0 1 0 1.9 8.7" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="20" cy="20" r="3.1" fill="#fff"/>
          <path d="M20 6.5v4M20 29.5v4M6.5 20h4M29.5 20h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".9"/>
        </svg>
      </div>
      {showWord && (
        <div className="col" style={{ lineHeight: 1 }}>
          <span className="display" style={{ fontSize: size * .47, fontWeight: 600, letterSpacing: '-.02em', color: light ? '#fff' : 'var(--ink)' }}>Globonexo</span>
          <span style={{ fontSize: size * .26, fontWeight: 700, color: light ? 'var(--g-300)' : 'var(--g-700)', letterSpacing: '.02em', marginTop: 2 }}>Sales AI</span>
        </div>
      )}
    </div>
  );
}

/* ---- Aurora backdrop ---- */
function Aurora() {
  return (
    <div className="aurora">
      <span className="a1"/><span className="a2"/><span className="a3"/>
    </div>
  );
}

/* ---- Input field ---- */
function Field({ label, icon, type = 'text', placeholder, value, onChange, toggle, hint }) {
  const [show, setShow] = useState(false);
  const realType = toggle ? (show ? 'text' : 'password') : type;
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        {icon && <span className="lead-ico"><Icon name={icon} size={19} /></span>}
        <input
          className={'input' + (icon ? ' has-ico' : '')}
          type={realType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {toggle && (
          <button className="trail" type="button" onClick={() => setShow(s => !s)} aria-label="toggle password">
            <Icon name={show ? 'eyeoff' : 'eye'} size={19} />
          </button>
        )}
      </div>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{hint}</span>}
    </div>
  );
}

/* ---- Avatar (initials) ---- */
function Avatar({ name = '', size = 38, src, ring }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hues = ['#00c27a', '#15c4c0', '#7c8bf0', '#f0a93c', '#ef6f8e'];
  const hue = hues[(name.charCodeAt(0) || 0) % hues.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flex: 'none',
      display: 'grid', placeItems: 'center', fontWeight: 800,
      fontSize: size * .38, color: '#fff',
      background: src ? `center/cover url(${src})` : `linear-gradient(140deg, ${hue}, ${hue}cc)`,
      boxShadow: ring ? '0 0 0 3px #fff, 0 0 0 5px var(--g-300)' : 'none',
      fontFamily: 'var(--font-body)',
    }}>
      {!src && initials}
    </div>
  );
}

/* ---- Segmented control ---- */
function Segmented({ options, value, onChange }) {
  return (
    <div className="row" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-pill)', padding: 4, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          height: 34, padding: '0 16px', borderRadius: 'var(--r-pill)',
          fontSize: 13.5, fontWeight: 700,
          color: value === o.value ? '#06231a' : 'var(--muted)',
          background: value === o.value ? '#fff' : 'transparent',
          boxShadow: value === o.value ? 'var(--sh-xs)' : 'none',
          transition: 'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

/* ---- Animated counter ---- */
function Counter({ to, dur = 900, prefix = '', suffix = '', decimals = 0 }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}

/* ---- Typing dots ---- */
function Typing() {
  return (
    <div className="row" style={{ gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--g-500)',
          animation: 'pulse-dot 1.1s infinite', animationDelay: `${i * .18}s`,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, { Logo, Aurora, Field, Avatar, Segmented, Counter, Typing });
