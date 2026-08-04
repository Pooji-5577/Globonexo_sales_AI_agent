"use client";

import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";
import { cleanText } from "../../../lib/validation";

const SUPPORT_STATUSES = new Set(["open", "resolved", "closed"]);

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

function appendMessageOnce(messages = [], message) {
  if (!message || messages.some(item => item.id === message.id)) return messages;
  return [...messages, message];
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("orgs");
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.get("/admin/overview", { timeout: 10000 })
      .then(res => setData(res.data))
      .catch(err => {
        if (err.code === "ECONNABORTED") {
          setError("Admin API timed out. Confirm the backend is running on port 5001, then refresh.");
          return;
        }
        setError(err?.response?.status === 403 ? "Admin access required." : "Admin data could not be loaded.");
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

  const metrics = data?.metrics ?? {};
  const organizations = data?.organizations ?? [];
  const users = data?.users ?? [];
  const campaigns = data?.campaigns ?? [];

  const recentCampaigns = useMemo(() => campaigns.slice(0, 12), [campaigns]);

  const suspendOrg = async org => {
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

  const impersonateOrg = async org => {
    setError("");
    setNotice("");
    try {
      const { data: tokenData } = await api.post(`/admin/organizations/${org.id}/impersonate`);
      setNotice(`Impersonating ${tokenData.userEmail}. Redirecting to their dashboard...`);
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch (err) {
      setError(err?.response?.data?.error || "Impersonation token could not be created.");
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

  if (loading) {
    return (
      <div className="admin-screen">
        <p className="muted">Loading admin console...</p>
      </div>
    );
  }

  return (
    <div className="admin-screen">
      <div className="row spread page-head">
        <div>
          <h1 className="display page-title">Admin Console</h1>
          <p className="muted page-subtitle">Platform-wide organizations, users, campaigns, and support signals.</p>
        </div>
        <a className="btn btn-ghost btn-sm" href="/dashboard"><Icon name="arrowLeft" size={15} /> Back to app</a>
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

      <div className="admin-tabs">
        {[
          ["orgs", "Organizations"],
          ["users", "Users"],
          ["campaigns", "Campaigns"],
          ["support", "Support"],
        ].map(([value, label]) => (
          <button key={value} type="button" className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>

      {tab === "orgs" ? (
        <div className="card table-shell">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{["Organization", "Plan", "Status", "Usage", "Support", ""].map(header => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {organizations.map(org => (
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
                    <td><span className="chip">{org.planId}</span></td>
                    <td><StatusBadge value={org.subscriptionStatus} /></td>
                    <td><span className="faint">{org.counts.leads} leads · {org.counts.activeCampaigns} active · {org.counts.meetings} meetings</span></td>
                    <td><span className="faint">{org.counts.openTickets} open tickets</span></td>
                    <td>
                      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => impersonateOrg(org)}>Impersonate</button>
                        <button className="btn btn-ghost btn-sm danger-text" type="button" onClick={() => suspendOrg(org)}>Suspend</button>
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
              <thead><tr>{["User", "Organization", "Role", "Created"].map(header => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {users.map(user => (
                  <tr className="data-row" key={user.id}>
                    <td>
                      <div className="row" style={{ gap: 11 }}>
                        <Avatar name={user.name} size={34} />
                        <div className="col">
                          <strong style={{ fontSize: 14 }}>{user.name}</strong>
                          <span className="faint" style={{ fontSize: 12 }}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.organizationName}</td>
                    <td><span className="chip">{user.role}</span></td>
                    <td><span className="faint">{new Date(user.createdAt).toLocaleDateString()}</span></td>
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
                {recentCampaigns.map(campaign => (
                  <tr className="data-row" key={campaign.id}>
                    <td><strong style={{ fontSize: 14 }}>{campaign.name}</strong></td>
                    <td>{campaign.organizationName}</td>
                    <td><span className="chip">{campaign.channel}</span></td>
                    <td><StatusBadge value={campaign.status} /></td>
                    <td><span className="faint">{campaign.stats.leads} leads · {campaign.stats.emailsSent} sent · {campaign.stats.meetings} meetings</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div className="soft-empty">Loading support tickets...</div>
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
  );
}
