export default function AdminShell({ children }) {
  return (
    <div className="screen admin-shell" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}
