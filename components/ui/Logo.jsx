export function Logo({ size = 34, showWord = true, light = false }) {
  const glyphColor = light ? '#00E08A' : '#00A86B';

  return (
    <div className="row" style={{ gap: 11, alignItems: 'center' }}>
      <div style={{ width: size, height: size, position: 'relative', flex: 'none' }}>
        <svg width={size} height={size} viewBox="0 0 74 74" fill="none" aria-hidden="true">
          <g fill={glyphColor}>
            <path d="M36 36 8 12c-2-2 0-5 3-4l31 12c2 1 2 4 0 5z"/>
            <path d="M36 36 22 66c-1 2-4 2-5-1l-6-30c0-2 2-4 4-3z"/>
            <path d="M36 36 66 26c2-1 4 2 3 4L48 60c-1 2-4 2-5 0z"/>
          </g>
        </svg>
      </div>
      {showWord && (
        <span className="display" style={{ fontSize: size * .47, fontWeight: 500, letterSpacing: '-.02em', color: light ? '#fff' : 'var(--ink)', whiteSpace: 'nowrap' }}>
          GNX{' '}
          <span style={{ fontSize: size * .38, fontWeight: 500, color: light ? 'var(--g-300)' : 'var(--g-700)', letterSpacing: '-.02em' }}>Sales</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
