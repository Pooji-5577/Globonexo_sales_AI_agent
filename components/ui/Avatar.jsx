export function Avatar({ name = '', size = 38, src, ring }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
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
