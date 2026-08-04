"use client";

import Link from "next/link";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";
import api from "../../lib/api";

export default function AdminShell({ children }) {
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    window.location.href = "/login";
  };

  return (
    <div className="screen admin-shell" style={{ background: "var(--bg)" }}>
      <header className="row spread admin-shell-header" style={{ height: 60, flex: "none", padding: "0 24px", borderBottom: "1px solid var(--line)", background: "#fff" }}>
        <Logo size={26} />
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn btn-ghost btn-sm" href="/dashboard">
            <Icon name="arrowLeft" size={15} /> Back to app
          </Link>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>
            <Icon name="logout" size={15} /> Log out
          </button>
        </div>
      </header>
      <div className="grow" style={{ minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
