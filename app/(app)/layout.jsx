export const metadata = {
  title: "Globonexo Sales AI",
};

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      {/* TODO: migrate AppShell from GlobonexoPrototype.jsx */}
      {children}
    </div>
  );
}
