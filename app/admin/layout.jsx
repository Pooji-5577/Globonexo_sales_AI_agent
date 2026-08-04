import AdminShell from "../../components/layout/AdminShell";

export const metadata = {
  title: "Admin Console — GNX sales",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
