export function Logo({ size = 34, showWord = true, light = false }) {
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
