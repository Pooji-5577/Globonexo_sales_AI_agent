"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../../components/ui/Icon";
import Avatar from "../../components/ui/Avatar";
import Logo from "../../components/ui/Logo";
import RouteSkeleton from "../../components/ui/RouteSkeleton";
import Spinner from "../../components/ui/Spinner";
import { useFirstLoad } from "../../hooks/useFirstLoad";
import api from "../../lib/api";
import { cleanText } from "../../lib/validation";

const SUPPORT_STATUSES = new Set(["open", "resolved", "closed"]);
const PLAN_OPTIONS = [
  { id: "starter", label: "Individual" },
  { id: "growth", label: "Agency" },
  { id: "scale", label: "Startup" },
];

const NAV_ITEMS = [
  { id: "orgs", label: "Organizations", ico: "building" },
  { id: "users", label: "Users", ico: "users" },
  { id: "campaigns", label: "Campaigns", ico: "send" },
  { id: "apollo", label: "Lead database usage", ico: "chart" },
  { id: "costs", label: "Cost & margin", ico: "trend" },
  { id: "support", label: "Support", ico: "chat" },
];

function AdminSidebar({ tab, onTabChange, adminName, adminEmail, onLogout }) {
  return (
    <aside className="admin-sidebar" style={{ width: 200, flex: "none", background: "#fff", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "18px 14px" }}>
      <div style={{ padding: "4px 6px 16px" }}><Logo size={26} /></div>

      <nav className="col" style={{ gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, height: 40, padding: "0 10px", width: "100%",
                borderRadius: 10, fontWeight: 700, fontSize: 14, textAlign: "left",
                color: active ? "#06231a" : "var(--ink-2)",
                background: active ? "var(--g-50)" : "transparent",
                boxShadow: active ? "inset 0 0 0 1px var(--g-100)" : "none", transition: "all .12s",
              }}
            >
              <Icon name={item.ico} size={18} color={active ? "var(--g-600)" : "var(--muted)"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="grow" />

      {adminName && (
        <div className="col" style={{ gap: 2, padding: "10px 6px", borderTop: "1px solid var(--line)", marginBottom: 4 }}>
          <span className="ellip" style={{ fontWeight: 800, fontSize: 13 }}>{adminName}</span>
          <span className="faint ellip" style={{ fontSize: 11.5 }}>{adminEmail}</span>
        </div>
      )}
      <Link className="row nw" href="/dashboard" style={{ gap: 9, padding: "0 6px", height: 36, color: "var(--muted)", fontWeight: 700, fontSize: 13.5 }}>
        <Icon name="arrowLeft" size={16} /> Back to app
      </Link>
      <button type="button" className="row nw" onClick={onLogout} style={{ gap: 9, padding: "0 6px", height: 36, color: "var(--muted)", fontWeight: 700, fontSize: 13.5 }}>
        <Icon name="logout" size={16} /> Log out
      </button>
    </aside>
  );
}

function Metric({ label, value, icon, tone }) {
  return (
    <div className="metric-card">
      <span className="metric-icon" data-tone={tone || "green"}><Icon name={icon} size={16} /></span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const suspended = value === "suspended";
  const active = ["active", "past_due"].includes(value);
  const neutral = ["resolved", "closed"].includes(value);
  return (
    <span className="badge" style={{
      background: suspended ? "#fef2f2" : active ? "var(--g-50)" : neutral ? "var(--bg-2)" : "#fff7ed",
      color: suspended ? "#b91c1c" : active ? "var(--g-700)" : neutral ? "var(--muted)" : "#c2410c",
      border: `1px solid ${suspended ? "#fecaca" : active ? "var(--g-100)" : neutral ? "var(--line)" : "#fed7aa"}`,
    }}>
      <span className="dot" style={{ background: suspended ? "#ef4444" : active ? "var(--g-500)" : neutral ? "var(--faint)" : "#f97316" }} />
      {value}
    </span>
  );
}

function StatChips({ items }) {
  return (
    <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
      {items.map(item => (
        <span
          key={item.label}
          className="badge"
          style={{
            background: item.tone === "warn" ? "#fff7ed" : "var(--bg-2)",
            color: item.tone === "warn" ? "#c2410c" : "var(--ink-2)",
            border: `1px solid ${item.tone === "warn" ? "#fed7aa" : "var(--line)"}`,
          }}
        >
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}

function formatCredits(value) {
  return Number(value ?? 0).toLocaleString();
}

function formatProviderCost(cents) {
  return cents == null ? "Not available" : `$${(Number(cents) / 100).toFixed(4)}`;
}

function providerLabel(provider) {
  return {
    azure_openai: "AI generation",
    apollo: "Apollo",
    retell: "Retell",
  }[provider] || provider;
}

function attributionLabel(event) {
  if (!event.userId) return "Unattributed / system";
  if (event.isSelectedUser) {
    return event.attributionMethod === "actor" ? "This user · recorded actor" : "This user · historical sole member";
  }
  return `Other member${event.attributedUserName ? ` · ${event.attributedUserName}` : ""}`;
}

function CreditState({ value }) {
  const styles = {
    settled: { background: "var(--g-50)", color: "var(--g-700)", border: "var(--g-100)" },
    reserved: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    released: { background: "var(--bg-2)", color: "var(--muted)", border: "var(--line)" },
    rejected: { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    unmetered: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  };
  const tone = styles[value] || styles.released;
  return <span className="badge" style={{ background: tone.background, color: tone.color, border: `1px solid ${tone.border}` }}>{value}</span>;
}

function UserCreditDrawer({ user, usage, loading, error, onClose }) {
  if (!user) return null;

  const summary = usage?.summary;
  const attribution = usage?.attribution;
  const providerRows = Object.entries(summary?.byProvider ?? {});
  const events = usage?.events ?? [];

  return (
    <div
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6, 35, 26, .22)", display: "flex", justifyContent: "flex-end" }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-credit-drawer-title"
        style={{ width: "min(760px, 100vw)", height: "100%", overflowY: "auto", background: "#fff", boxShadow: "-18px 0 50px rgba(6, 35, 26, .16)", padding: 24 }}
      >
        <div className="row spread" style={{ alignItems: "flex-start", gap: 16 }}>
          <div className="row" style={{ gap: 12, minWidth: 0 }}>
            <Avatar name={user.name} size={44} />
            <div className="col" style={{ minWidth: 0, gap: 3 }}>
              <span className="eyebrow">Individual credit usage</span>
              <h2 id="user-credit-drawer-title" style={{ margin: 0, fontSize: 22 }}>{user.name}</h2>
              <span className="faint ellip">{user.email} · {user.organizationName}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose} aria-label="Close credit usage details">
            <Icon name="close" size={16} /> Close
          </button>
        </div>

        {loading ? (
          <div className="soft-empty" style={{ marginTop: 28 }}><Spinner size={18} /> Loading settled credit events…</div>
        ) : error ? (
          <div className="notice-warn" style={{ marginTop: 20 }}>{error}</div>
        ) : usage ? (
          <>
            <div className="row spread" style={{ marginTop: 20, alignItems: "baseline", gap: 12 }}>
              <div>
                <span className="eyebrow">Billing period</span>
                <strong style={{ display: "block", marginTop: 4 }}>{new Date(usage.period.start).toLocaleDateString()} – {new Date(usage.period.end).toLocaleDateString()}</strong>
              </div>
              <span className="chip">{usage.user.planId}</span>
            </div>

            <div className="metric-grid" style={{ marginTop: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <Metric label="attributed credits" value={formatCredits(summary?.creditsDebited)} icon="chart" />
              <Metric label="reported provider cost" value={formatProviderCost(summary?.reportedCostCents)} icon="trend" />
              <Metric label="settled events" value={summary?.settledEvents ?? 0} icon="check" />
              <Metric label="org credits not attributed here" value={formatCredits((attribution?.organizationCredits ?? 0) - (attribution?.thisUserCredits ?? 0))} icon="users" tone="warn" />
            </div>

            <div className="card" style={{ marginTop: 16, padding: 16, background: "#fbfdfc" }}>
              <div className="row spread" style={{ gap: 12 }}>
                <div>
                  <span className="eyebrow">Balance snapshot</span>
                  <p className="muted" style={{ margin: "5px 0 0", fontSize: 12.5 }}>Organization balance; the ledger does not maintain separate per-user balances.</p>
                </div>
                <strong style={{ color: "var(--g-700)" }}>{formatCredits(usage.balance.remainingCredits)} remaining</strong>
              </div>
              <div className="admin-pill-list" style={{ marginTop: 12 }}>
                <span className="chip">included · {formatCredits(usage.balance.includedCredits)}</span>
                <span className="chip">top-up · {formatCredits(usage.balance.topUpCredits)}</span>
                <span className="chip">used · {formatCredits(usage.balance.creditsUsed)}</span>
                <span className="chip">reserved · {formatCredits(usage.balance.creditsReserved)}</span>
              </div>
            </div>

            <div className="notice-good" style={{ marginTop: 16, lineHeight: 1.5 }}>
              Only <strong>settled</strong> provider events count as spend. Recorded actor events are verified user activity; historical sole-member rows are labeled as historical attribution. Organization spend is never silently presented as this user’s spend.
              {attribution?.unattributedCredits > 0 ? ` ${formatCredits(attribution.unattributedCredits)} organization credits remain unattributed.` : ""}
            </div>

            <div style={{ marginTop: 22 }}>
              <div className="row spread" style={{ marginBottom: 10 }}>
                <div>
                  <span className="eyebrow">Provider breakdown</span>
                  <p className="faint" style={{ margin: "4px 0 0" }}>Settled events attributed to this user.</p>
                </div>
                <span className="faint">{attribution?.attributionCoveragePercent ?? 100}% org coverage</span>
              </div>
              <div className="card table-shell">
                <div className="table-scroll">
                  <table className="data-table" style={{ minWidth: 520 }}>
                    <thead><tr>{["Provider", "Events", "Credits", "Reported cost"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>
                      {providerRows.length === 0 ? <tr><td colSpan={4} className="table-empty">No settled provider events for this user in the current period.</td></tr> : providerRows.map(([provider, row]) => (
                        <tr className="data-row" key={provider}>
                          <td><strong>{providerLabel(provider)}</strong><div className="faint">{provider}</div></td>
                          <td>{row.events}</td>
                          <td>{formatCredits(row.creditsDebited)}</td>
                          <td>{formatProviderCost(row.reportedCostCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <div className="row spread" style={{ marginBottom: 10, gap: 12 }}>
                <div>
                  <span className="eyebrow">Event ledger</span>
                  <p className="faint" style={{ margin: "4px 0 0" }}>Every current-period event for the organization, with attribution shown per row.</p>
                </div>
                <span className="faint">{events.length}{usage.truncated ? "+" : ""} events</span>
              </div>
              {usage.truncated ? <div className="notice-warn" style={{ marginBottom: 10 }}>This table is showing the newest 1,000 events. The totals above include the full current-period ledger.</div> : null}
              <div className="card table-shell">
                <div className="table-scroll">
                  <table className="data-table" style={{ minWidth: 900 }}>
                    <thead><tr>{["Time", "Provider / operation", "Campaign", "Credits", "Attribution", "State"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>
                      {events.length === 0 ? <tr><td colSpan={6} className="table-empty">No provider credit events in this billing period.</td></tr> : events.map(event => (
                        <tr className="data-row" key={event.id} style={{ background: event.isSelectedUser ? "#f0fdf4" : undefined }}>
                          <td><span className="faint">{new Date(event.createdAt).toLocaleString()}</span></td>
                          <td><strong>{providerLabel(event.provider)}</strong><div className="faint">{event.operation}</div></td>
                          <td>{event.campaignName || "System / no campaign"}</td>
                          <td>{event.status === "settled" ? formatCredits(event.creditsDebited) : `reserved ${formatCredits(event.reservedCredits)}`}</td>
                          <td><span style={{ fontSize: 12.5, color: event.isSelectedUser ? "var(--g-700)" : "var(--ink-2)" }}>{attributionLabel(event)}</span></td>
                          <td><CreditState value={event.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

function appendMessageOnce(messages = [], message) {
  if (!message || messages.some(item => item.id === message.id)) return messages;
  return [...messages, message];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("orgs");
  const [search, setSearch] = useState("");
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [apolloUsage, setApolloUsage] = useState(null);
  const [costUsage, setCostUsage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCreditUsage, setUserCreditUsage] = useState(null);
  const [userCreditLoading, setUserCreditLoading] = useState(false);
  const [userCreditError, setUserCreditError] = useState("");
  const [planBusyId, setPlanBusyId] = useState("");
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    api.get("/auth/me").then(res => setAdminUser(res.data.user)).catch(() => {});
  }, []);

  const adminName = adminUser ? [adminUser.first_name, adminUser.last_name].filter(Boolean).join(" ") || adminUser.email : "";
  const adminEmail = adminUser?.email || "";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    window.location.href = "/login";
  };

  const load = () => {
    setLoading(true);
    setError("");
    return api.get("/admin/overview", { timeout: 10000 })
      .then(res => setData(res.data))
      .catch(err => {
        if (err.code === "ECONNABORTED") {
          setError("Admin API timed out. Confirm the backend is running on port 5001, then refresh.");
          return;
        }
        if (err?.response?.status === 403) {
          router.replace("/dashboard");
          return;
        }
        setError("Admin data could not be loaded.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const loadSupportTickets = () => {
    setSupportLoading(true);
    return api.get("/support/admin/tickets")
      .then(res => {
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setSupportTickets(items);
        setSelectedTicketId(current => current || items[0]?.id || "");
      })
      .catch(() => setError("Support tickets could not be loaded."))
      .finally(() => setSupportLoading(false));
  };

  useEffect(() => {
    if (tab === "support") loadSupportTickets();
    if (tab === "apollo") {
      api.get("/admin/apollo-credits")
        .then(res => setApolloUsage(res.data))
        .catch(() => setError("Lead database credit usage could not be loaded."));
    }
    if (tab === "costs") {
      api.get("/admin/costs")
        .then(res => setCostUsage(res.data))
        .catch(() => setError("Provider cost usage could not be loaded."));
    }
  }, [tab]);

  useEffect(() => {
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return;
    }

    setSupportLoading(true);
    api.get(`/support/admin/tickets/${selectedTicketId}`)
      .then(res => setSelectedTicket(res.data))
      .catch(() => setError("Support ticket details could not be loaded."))
      .finally(() => setSupportLoading(false));
  }, [selectedTicketId]);

  useEffect(() => {
    if (!selectedUser) {
      setUserCreditUsage(null);
      setUserCreditError("");
      return undefined;
    }

    let active = true;
    setUserCreditLoading(true);
    setUserCreditUsage(null);
    setUserCreditError("");
    api.get(`/admin/users/${selectedUser.id}/credit-usage`)
      .then(res => { if (active) setUserCreditUsage(res.data); })
      .catch(err => { if (active) setUserCreditError(err?.response?.data?.error || "User credit usage could not be loaded."); })
      .finally(() => { if (active) setUserCreditLoading(false); });

    return () => { active = false; };
  }, [selectedUser]);

  const metrics = data?.metrics ?? {};
  const organizations = data?.organizations ?? [];
  const users = data?.users ?? [];
  const campaigns = data?.campaigns ?? [];
  const searchNeedle = search.trim().toLowerCase();

  const filteredOrganizations = useMemo(() => {
    if (!searchNeedle) return organizations;
    return organizations.filter(org =>
      org.name.toLowerCase().includes(searchNeedle) || (org.website || "").toLowerCase().includes(searchNeedle)
    );
  }, [organizations, searchNeedle]);

  const filteredUsers = useMemo(() => {
    if (!searchNeedle) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchNeedle) || user.email.toLowerCase().includes(searchNeedle)
    );
  }, [users, searchNeedle]);

  const visibleCampaigns = useMemo(() => {
    if (!searchNeedle) return campaigns.slice(0, 12);
    return campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchNeedle) || campaign.organizationName.toLowerCase().includes(searchNeedle)
    );
  }, [campaigns, searchNeedle]);

  const searchPlaceholder = tab === "orgs"
    ? "Search organizations by name or website..."
    : tab === "users"
      ? "Search users by name or email..."
      : tab === "costs" ? "Search costs by organization or provider..."
        : "Search campaigns by name or organization...";

  const suspendOrg = async org => {
    if (!window.confirm(`Suspend ${org.name}? They will immediately lose access to the app.`)) return;
    setError("");
    setNotice("");
    try {
      await api.post(`/admin/organizations/${org.id}/suspend`);
      setNotice(`${org.name} suspended.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Organization could not be suspended.");
    }
  };

  const unsuspendOrg = async org => {
    setError("");
    setNotice("");
    try {
      await api.post(`/admin/organizations/${org.id}/unsuspend`);
      setNotice(`${org.name} unsuspended.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Organization could not be unsuspended.");
    }
  };

  const changeOrgPlan = async (org, planId) => {
    if (!planId || planId === org.planId || planBusyId) return;
    const planLabel = PLAN_OPTIONS.find(plan => plan.id === planId)?.label || planId;
    if (!window.confirm(`Move ${org.name} to the ${planLabel} plan? This changes app limits and current-period included credits.`)) return;
    setPlanBusyId(org.id);
    setError("");
    setNotice("");
    try {
      await api.patch(`/admin/organizations/${org.id}/plan`, { planId });
      setNotice(`${org.name} moved to ${planLabel}.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Organization plan could not be changed.");
    } finally {
      setPlanBusyId("");
    }
  };

  const sendAdminReply = async event => {
    event.preventDefault();
    const safeBody = cleanText(replyBody, { max: 4000, multiline: true });
    if (!selectedTicketId || !safeBody) return;
    setReplying(true);
    setError("");
    setNotice("");
    try {
      const { data: message } = await api.post(`/support/admin/tickets/${selectedTicketId}/messages`, { body: safeBody });
      setSelectedTicket(current => current ? { ...current, messages: appendMessageOnce(current.messages, message) } : current);
      setReplyBody("");
      setNotice("Reply sent and email notification queued.");
      await loadSupportTickets();
    } catch (err) {
      setError(err?.response?.data?.error || "Admin reply could not be sent.");
    } finally {
      setReplying(false);
    }
  };

  const updateAdminTicketStatus = async status => {
    if (!selectedTicketId || !SUPPORT_STATUSES.has(status)) return;
    setError("");
    try {
      await api.patch(`/support/admin/tickets/${selectedTicketId}/status`, { status });
      setSelectedTicket(current => current ? { ...current, status } : current);
      await loadSupportTickets();
    } catch {
      setError("Support ticket status could not be updated.");
    }
  };

  if (showSkeleton) return <RouteSkeleton variant="admin" />;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <AdminSidebar
        tab={tab}
        onTabChange={(value) => { setTab(value); setSearch(""); setSelectedUser(null); }}
        adminName={adminName}
        adminEmail={adminEmail}
        onLogout={handleLogout}
      />
      <div className="admin-screen scroll grow" style={{ minHeight: 0 }}>
      <div className="page-head">
        <h1 className="display page-title">Admin Console</h1>
        <p className="muted page-subtitle">Platform-wide organizations, users, campaigns, and support signals.</p>
      </div>

      {(error || notice) ? <div className={error ? "notice-warn" : "notice-good"}>{error || notice}</div> : null}

      <div className="metric-grid">
        <Metric label="organizations" value={metrics.organizations ?? 0} icon="building" />
        <Metric label="users" value={metrics.users ?? 0} icon="users" />
        <Metric label="active campaigns" value={metrics.activeCampaigns ?? 0} icon="send" />
        <Metric label="open support" value={metrics.openTickets ?? 0} icon="inbox" tone="warn" />
      </div>

      <section className="admin-overview-grid">
        <div className="card admin-insight">
          <span className="eyebrow">Platform health</span>
          <div className="admin-health-list">
            <div><strong>{metrics.leads ?? 0}</strong><span>leads sourced</span></div>
            <div><strong>{metrics.hotLeads ?? 0}</strong><span>hot leads</span></div>
            <div><strong>{metrics.emailsSent ?? 0}</strong><span>emails sent</span></div>
            <div><strong>{metrics.meetings ?? 0}</strong><span>meetings booked</span></div>
          </div>
        </div>
        <div className="card admin-insight">
          <span className="eyebrow">Plans</span>
          <div className="admin-pill-list">
            {Object.entries(metrics.plans ?? {}).map(([plan, count]) => (
              <span className="chip" key={plan}>{plan} · {count}</span>
            ))}
            {Object.keys(metrics.plans ?? {}).length === 0 ? <span className="faint">No plans yet.</span> : null}
          </div>
        </div>
      </section>

      {tab !== "support" && tab !== "costs" && (
        <div className="input-wrap" style={{ width: 280, marginBottom: 12 }}>
          <span className="lead-ico"><Icon name="search" size={15} /></span>
          <input
            className="input has-ico"
            style={{ height: 36, fontSize: 13 }}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {tab === "orgs" ? (
        <div className="card table-shell">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{["Organization", "Plan", "Status", "Usage", "Support", ""].map(header => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {filteredOrganizations.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty">No organizations match your search.</td></tr>
                ) : filteredOrganizations.map(org => (
                  <tr className="data-row" key={org.id}>
                    <td>
                      <div className="row" style={{ gap: 11, minWidth: 240 }}>
                        <Avatar name={org.name} size={34} />
                        <div className="col" style={{ minWidth: 0 }}>
                          <strong className="ellip" style={{ fontSize: 14 }}>{org.name}</strong>
                          <span className="faint ellip" style={{ fontSize: 12 }}>{org.website || "No website"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="input"
                        value={org.planId || "starter"}
                        onChange={event => changeOrgPlan(org, event.target.value)}
                        disabled={planBusyId === org.id}
                        style={{ height: 34, minWidth: 130, fontSize: 12.5, fontWeight: 800 }}
                      >
                        {PLAN_OPTIONS.map(plan => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
                      </select>
                    </td>
                    <td><StatusBadge value={org.subscriptionStatus} /></td>
                    <td>
                      <StatChips items={[
                        { label: "leads", value: org.counts.leads },
                        { label: "active", value: org.counts.activeCampaigns },
                        { label: "meetings", value: org.counts.meetings },
                      ]} />
                    </td>
                    <td>
                      <StatChips items={[
                        { label: "open tickets", value: org.counts.openTickets, tone: org.counts.openTickets > 0 ? "warn" : undefined },
                      ]} />
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                        {org.subscriptionStatus === "suspended" ? (
                          <button className="btn btn-ghost btn-sm success-text" type="button" onClick={() => unsuspendOrg(org)}>Unsuspend</button>
                        ) : (
                          <button className="btn btn-ghost btn-sm danger-text" type="button" onClick={() => suspendOrg(org)}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "users" ? (
        <div className="card table-shell">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{["User", "Organization", "Role", "Created", "Credit spending"].map(header => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">No users match your search.</td></tr>
                ) : filteredUsers.map(user => (
                  <tr className="data-row" key={user.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        aria-label={`View credit spending for ${user.name}`}
                        style={{ display: "flex", alignItems: "center", gap: 11, padding: 0, border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }}
                      >
                        <Avatar name={user.name} size={34} />
                        <div className="col">
                          <strong style={{ fontSize: 14 }}>{user.name}</strong>
                          <span className="faint" style={{ fontSize: 12 }}>{user.email}</span>
                        </div>
                      </button>
                    </td>
                    <td>{user.organizationName}</td>
                    <td><span className="chip">{user.role}</span></td>
                    <td><span className="faint">{new Date(user.createdAt).toLocaleDateString()}</span></td>
                    <td><button className="btn btn-ghost btn-sm" type="button" onClick={() => setSelectedUser(user)}>View details <Icon name="arrow" size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "campaigns" ? (
        <div className="card table-shell">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{["Campaign", "Organization", "Channel", "Status", "Stats"].map(header => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {visibleCampaigns.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">No campaigns match your search.</td></tr>
                ) : visibleCampaigns.map(campaign => (
                  <tr className="data-row" key={campaign.id}>
                    <td><strong style={{ fontSize: 14 }}>{campaign.name}</strong></td>
                    <td>{campaign.organizationName}</td>
                    <td><span className="chip">{campaign.channel}</span></td>
                    <td><StatusBadge value={campaign.status} /></td>
                    <td>
                      <StatChips items={[
                        { label: "leads", value: campaign.stats.leads },
                        { label: "sent", value: campaign.stats.emailsSent },
                        { label: "meetings", value: campaign.stats.meetings },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "apollo" ? (
        <div className="col" style={{ gap: 16 }}>
          <div className="metric-grid">
            <Metric label="total credits" value={apolloUsage?.summary?.totalCredits ?? 0} icon="chart" />
            <Metric label="lead database calls" value={apolloUsage?.summary?.calls ?? 0} icon="send" />
            <Metric label="email credits" value={apolloUsage?.summary?.emailCredits ?? 0} icon="mail" />
            <Metric label="voice credits" value={apolloUsage?.summary?.voiceCredits ?? 0} icon="phone" />
          </div>
          <div className="card table-shell">
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: 1180 }}>
                <thead><tr>{["Time", "Organization", "Campaign", "Operation", "Channel", "Requested", "Returned", "Credits", "State", "Duration"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {(apolloUsage?.items ?? []).length === 0 ? <tr><td colSpan={10} className="table-empty">No lead database calls recorded yet.</td></tr> : (apolloUsage?.items ?? []).map(call => (
                    <tr className="data-row" key={call.id}>
                      <td>{new Date(call.started_at).toLocaleString()}</td>
                      <td>{call.organizationName}</td>
                      <td>{call.campaignName || "Campaign not provided"}</td>
                      <td><strong>{call.operation}</strong><div className="faint">{call.endpoint}</div></td>
                      <td><span className="chip">{call.channel || "shared"}</span></td>
                      <td>{call.requested_records}</td>
                      <td>{call.channel === "voice" ? call.phone_records : call.email_records}</td>
                      <td>{call.credit_status === "final" ? Number(call.credits_consumed ?? 0) : call.credit_status}</td>
                      <td><StatusBadge value={call.status} /></td>
                      <td>{call.duration_ms == null ? "Not available" : `${call.duration_ms} ms`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : tab === "costs" ? (
        <div className="col" style={{ gap: 16 }}>
          <div className="metric-grid">
            <Metric label="reported provider cost" value={`$${((costUsage?.summary?.reportedCostCents ?? 0) / 100).toFixed(2)}`} icon="trend" />
            <Metric label="credits debited" value={(costUsage?.summary?.creditsDebited ?? 0).toLocaleString()} icon="chart" />
            <Metric label="settled events" value={costUsage?.summary?.settledEvents ?? 0} icon="check" />
            <Metric label="unmetered events" value={costUsage?.summary?.unmeteredEvents ?? 0} icon="alertCircle" tone="warn" />
          </div>
          <div className="card table-shell">
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: 980 }}>
                <thead><tr>{["Organization", "Plan", "Reported cost", "Credits", "Est. margin", "Events"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {(costUsage?.organizations ?? []).length === 0 ? <tr><td colSpan={6} className="table-empty">No provider cost events recorded this period.</td></tr> : (costUsage?.organizations ?? []).map(org => (
                    <tr className="data-row" key={org.organizationId}>
                      <td><strong>{org.organizationName}</strong></td>
                      <td><span className="chip">{org.planId}</span></td>
                      <td>${(org.reportedCostCents / 100).toFixed(2)}</td>
                      <td>{org.creditsDebited.toLocaleString()}</td>
                      <td style={{ color: org.estimatedMarginCents < 0 ? "#b42318" : "var(--g-700)", fontWeight: 800 }}>${(org.estimatedMarginCents / 100).toFixed(2)}</td>
                      <td>{org.events}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card table-shell">
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: 1080 }}>
                <thead><tr>{["Time", "Organization", "Provider", "Operation", "Reported cost", "Credits", "State"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {(costUsage?.items ?? []).slice(0, 100).map(item => (
                    <tr className="data-row" key={item.id}>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>{item.organizationName}</td>
                      <td><span className="chip">{item.provider}</span></td>
                      <td>{item.operation}</td>
                      <td>{item.reportedCostCents == null ? "Not reported" : `$${(item.reportedCostCents / 100).toFixed(4)}`}</td>
                      <td>{item.creditsDebited.toLocaleString()}</td>
                      <td><StatusBadge value={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <section className="admin-support-grid">
          <div className="card admin-support-list">
            <div className="row spread" style={{ padding: 14, borderBottom: "1px solid var(--line)" }}>
              <div>
                <strong style={{ fontSize: 14 }}>Support queue</strong>
                <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>{supportTickets.length} tickets</p>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={loadSupportTickets}>Refresh</button>
            </div>
            {supportLoading && supportTickets.length === 0 ? (
              <div className="soft-empty"><Spinner size={16} /></div>
            ) : supportTickets.length === 0 ? (
              <div className="soft-empty">No support tickets yet.</div>
            ) : supportTickets.map(ticket => (
              <button
                key={ticket.id}
                type="button"
                className={`support-ticket-button ${selectedTicketId === ticket.id ? "is-active" : ""}`}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="row spread" style={{ gap: 10 }}>
                  <strong className="ellip">{ticket.subject}</strong>
                  <StatusBadge value={ticket.status} />
                </div>
                <p className="muted ellip">{ticket.organizationName} · {ticket.user?.email || "unknown user"}</p>
                <span className="faint">{ticket.lastMessage?.body || "No messages yet"}</span>
              </button>
            ))}
          </div>

          <div className="card admin-support-detail">
            {selectedTicket ? (
              <>
                <div className="row spread admin-support-head">
                  <div className="row" style={{ gap: 12, minWidth: 0 }}>
                    <Avatar name={selectedTicket.user?.name || selectedTicket.subject} size={38} />
                    <div className="col" style={{ minWidth: 0 }}>
                      <strong className="ellip">{selectedTicket.subject}</strong>
                      <span className="faint ellip">{selectedTicket.organizationName} · {selectedTicket.user?.email}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <StatusBadge value={selectedTicket.status} />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => updateAdminTicketStatus(selectedTicket.status === "resolved" ? "open" : "resolved")}>
                      {selectedTicket.status === "resolved" ? "Reopen" : "Resolve"}
                    </button>
                  </div>
                </div>

                <div className="admin-support-messages">
                  {(selectedTicket.messages || []).map(message => (
                    <div key={message.id} className={`support-message ${message.senderType === "admin" ? "is-admin" : "is-user"}`}>
                      <div className="support-bubble">{message.body}</div>
                      <span className="faint support-time">
                        {message.senderType === "admin" ? "Admin" : selectedTicket.user?.name || "User"} · {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <form className="admin-support-composer" onSubmit={sendAdminReply}>
                  <textarea
                    value={replyBody}
                    onChange={event => setReplyBody(event.target.value)}
                    placeholder="Write an admin reply. The user will receive an email notification."
                    disabled={replying || selectedTicket.status === "closed"}
                  />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={replying || !replyBody.trim() || selectedTicket.status === "closed"}>
                    <Icon name="send" size={14} color="#06231a" /> {replying ? "Sending..." : "Send reply"}
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state">
                <Icon name="inbox" size={42} color="var(--faint)" />
                <p className="muted">No ticket selected</p>
                <span className="faint">Select a ticket from the queue to reply.</span>
              </div>
            )}
          </div>
        </section>
      )}
      </div>
      <UserCreditDrawer
        user={selectedUser}
        usage={userCreditUsage}
        loading={userCreditLoading}
        error={userCreditError}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
