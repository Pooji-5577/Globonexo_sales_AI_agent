export default function Spinner({ size = 16, style }) {
  return <span className="spinner" style={{ width: size, height: size, ...style }} role="status" aria-label="Loading" />;
}
