import AppShell from "../../components/layout/AppShell";

export const metadata = {
  title: "Globonexo Sales AI",
};

export default function AppLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
