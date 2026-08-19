import AdminShell from "../../components/layout/AdminShell";

export const metadata = {
  title: "GNX Sales admin console",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
