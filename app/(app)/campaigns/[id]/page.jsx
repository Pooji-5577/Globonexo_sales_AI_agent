"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { isValidEmail } from "../../../../lib/validation";

const STATUS_STYLES = {
  active: { label: "Active", bg: "var(--g-50)", color: "var(--g-700)", dot: "var(--g-500)" },
  paused: { label: "Paused", bg: "#fff7ed", color: "#9a3412", dot: "#f97316" },
  draft: { label: "Draft", bg: "var(--bg-2)", color: "var(--muted)", dot: "var(--faint)" },
  completed: { label: "Completed", bg: "#eef2ff", color: "#4338ca", dot: "#6366f1" },
};

const CHANNEL_STYLES = {
  email: { label: "Email", bg: "#e0f2fe", color: "#0369a1" },
  voice: { label: "Voice", bg: "#f0fdf4", color: "#15803d" },
};

const LEAD_STATUS_LABELS = {
  new: "New",
  queued: "Queued",
  contacted: "Contacted",
  engaged: "Engaged",
  meeting_booked: "Meeting set",
  not_interested: "Not interested",
  unsubscribed: "Unsubscribed",
  enrichment_failed: "Needs enrichment",
};

const STOPPED_STATUSES = new Set(["engaged", "meeting_booked", "not_interested", "unsubscribed"]);

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function ChannelBadge({ channel }) {
  const c = CHANNEL_STYLES[channel] ?? CHANNEL_STYLES.email;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: c.bg, color: c.color, fontSize: 12, fontWeight: 600 }}>
      <Icon name={channel === "voice" ? "phone" : "mail"} size={12} />
      {c.label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function leadName(lead) {
  return lead.name || [lead.firstName ?? lead.first_name, lead.lastName ?? lead.last_name].filter(Boolean).join(" ") || "Unnamed lead";
}

function leadStatusStyle(status) {
  const color = {
    new: "#9aa8a0",
    queued: "#7c8bf0",
    contacted: "#15c4c0",
    engaged: "#00a86a",
    meeting_booked: "#00c27a",
    not_interested: "#f59e0b",
    unsubscribed: "#ef4444",
    enrichment_failed: "#f97316",
  }[status] || "#9aa8a0";
  return { background: `${color}1f`, color, border: `1px solid ${color}45` };
}

function CampaignLeadRow({ lead, isVoice, sendingId, onSendNow }) {
  const status = lead.status || "new";
  const hasEmail = isValidEmail(lead.email || "");
  const canSendNow = !isVoice && hasEmail && lead.campaignId && status !== "contacted" && !STOPPED_STATUSES.has(status);
  const sending = sendingId === lead.id;

  return (
    <tr className="data-row">
      <td>
        <div className="row" style={{ gap: 11, minWidth: 0 }}>
          <Avatar name={leadName(lead)} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span className="ellip" style={{ fontWeight: 800, fontSize: 14 }}>{leadName(lead)}</span>
            <span className="faint ellip" style={{ fontSize: 12 }}>{lead.title || "No title"} - {lead.company || "No company"}</span>
          </div>
        </div>
      </td>
      <td><span style={{ fontWeight: 700, fontSize: 13 }}>{isVoice ? lead.phone || "No phone" : lead.email || "Not revealed"}</span></td>
      <td><span className="badge" style={leadStatusStyle(status)}>{LEAD_STATUS_LABELS[status] || status.replace(/_/g, " ")}</span></td>
      {!isVoice && (
        <td>
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            disabled={!canSendNow || sending}
            title={!hasEmail ? "Lead needs an email" : status === "contacted" ? "Step 1 has already been sent" : STOPPED_STATUSES.has(status) ? "Sequence is stopped for this lead" : "Send campaign email now"}
            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
            onClick={() => onSendNow(lead.id)}
          >
            <Icon name="send" size={13} /> {sending ? "Sending..." : "Send now"}
          </button>
        </td>
      )}
      <td><span className="faint" style={{ fontSize: 13 }}>{lead.location || "-"}</span></td>
    </tr>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSendStartedRef = useRef(false);

  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [launching, setLaunching] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [sendingId, setSendingId] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [campaignRes, leadsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get("/leads", { params: { campaignId: id, perPage: 500 } }),
      ]);
      setCampaign(campaignRes.data);
      setLeads(Array.isArray(leadsRes.data?.items) ? leadsRes.data.items : leadsRes.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.error ?? "Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const { data } = await api.post(`/campaigns/${id}/launch`);
      setCampaign(prev => ({ ...prev, status: "active" }));
      if (data.queued !== undefined) {
        showToast(`Campaign launched. ${data.queued} queued${data.skipped ? `, ${data.skipped} skipped` : ""}.`);
      } else {
        showToast("Campaign launched successfully.");
      }
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error ?? "Failed to launch campaign.");
    } finally {
      setLaunching(false);
    }
  };

  const handlePause = async () => {
    setPausing(true);
    try {
      await api.post(`/campaigns/${id}/pause`);
      setCampaign(prev => ({ ...prev, status: "paused" }));
      showToast("Campaign paused.");
    } catch (err) {
      showToast(err?.response?.data?.error ?? "Failed to pause campaign.");
    } finally {
      setPausing(false);
    }
  };

  const reconnectGmailForLead = useCallback(async leadId => {
    const { data } = await api.get("/gmail/auth-url", {
      params: {
        returnTo: `/campaigns/${id}`,
        sendLeadId: leadId,
      },
    });
    if (!data?.url) throw new Error("Gmail connection URL was not returned.");
    window.location.assign(data.url);
  }, [id]);

  const sendLeadNow = useCallback(async leadId => {
    setSendingId(leadId);
    setError("");
    try {
      const { data } = await api.post(`/leads/${leadId}/send-now`);
      if (data?.lead) {
        setLeads(current => current.map(lead => lead.id === leadId ? data.lead : lead));
      }
      showToast("Email sent to this lead.");
      await load();
    } catch (err) {
      const message = err?.response?.data?.error || "Could not send this email now.";
      if (message.toLowerCase().includes("gmail connection is not authorized")) {
        showToast("Reconnect Gmail to finish sending this email.");
        try {
          await reconnectGmailForLead(leadId);
          return;
        } catch {
          setError("Gmail reconnect could not be started.");
        }
      } else {
        setError(message);
      }
    } finally {
      setSendingId("");
    }
  }, [load, reconnectGmailForLead, showToast]);

  useEffect(() => {
    const sendLeadId = searchParams.get("sendLeadId");
    if (!sendLeadId || searchParams.get("gmail") !== "connected" || autoSendStartedRef.current) return;
    autoSendStartedRef.current = true;
    sendLeadNow(sendLeadId);
  }, [searchParams, sendLeadNow]);

  const metrics = useMemo(() => {
    const stats = campaign?.stats || {};
    return [
      ["Enrolled", stats.enrolled ?? leads.length],
      ["Ready", stats.ready ?? 0],
      ["Missing email", stats.missingEmail ?? 0],
      ["Queued", stats.queued ?? 0],
      ["Sent", stats.sent ?? 0],
    ];
  }, [campaign, leads.length]);

  if (loading) {
    return (
      <div className="col" style={{ gap: 16, padding: "32px 0" }}>
        <div style={{ width: 280, height: 20, borderRadius: 99, background: "var(--bg-2)" }} />
        <div className="card" style={{ padding: 24, height: 180, background: "var(--bg-2)" }} />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="card" style={{ padding: 24, color: "var(--error)", textAlign: "center" }}>
        {error}
        <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 12 }}>Retry</button>
      </div>
    );
  }

  if (!campaign) return null;

  const isVoice = campaign.channel === "voice";

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className="row spread page-toolbar">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <button className="btn btn-ghost btn-sm" type="button" style={{ width: 40, padding: 0 }} onClick={() => router.push("/campaigns")} aria-label="Back to campaigns">
            <Icon name="arrowLeft" size={16} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 className="display page-title ellip">{campaign.name}</h1>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <StatusBadge status={campaign.status} />
              <ChannelBadge channel={campaign.channel} />
              <span className="faint" style={{ fontSize: 12 }}>Created {formatDate(campaign.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button className="btn btn-primary btn-sm" onClick={handleLaunch} disabled={launching}>
              {launching ? "Launching..." : "Launch campaign"}
            </button>
          )}
          {campaign.status === "active" && (
            <button className="btn btn-ghost btn-sm" onClick={handlePause} disabled={pausing}>
              {pausing ? "Pausing..." : "Pause"}
            </button>
          )}
        </div>
      </div>

      {error ? <div className="notice-warn">{error}</div> : null}

      <div className="scroll grow app-page">
        <div className="col" style={{ gap: 16 }}>
          <div className="metric-grid">
            {metrics.map(([label, value]) => (
              <div key={label} className="metric-card">
                <span className="metric-icon"><Icon name={label === "Sent" ? "send" : "users"} size={16} /></span>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
              {isVoice ? "Voice configuration" : "Email configuration"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {isVoice ? (
                <>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Voice mode</span><span style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize" }}>{campaign.voiceMode ?? "ai"}</span></div>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Calls / hour</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.callCadencePerHour ?? 5}</span></div>
                </>
              ) : (
                <>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Daily send cap</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.dailySendCap ?? 100} emails</span></div>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Max leads</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.maxLeads ?? 100}</span></div>
                </>
              )}
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Business hours</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.businessHoursStart} - {campaign.businessHoursEnd}</span></div>
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Timezone</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.timezone}</span></div>
            </div>
          </div>

          <div className="card table-shell">
            <div className="filter-bar">
              <div>
                <strong style={{ fontSize: 14 }}>Campaign leads</strong>
                <p className="faint" style={{ fontSize: 12, marginTop: 2 }}>{leads.length} leads attached to this campaign.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: isVoice ? 760 : 980, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  {!isVoice && <col style={{ width: "12%" }} />}
                  <col style={{ width: isVoice ? "28%" : "16%" }} />
                </colgroup>
                <thead>
                  <tr>{["Lead", isVoice ? "Phone" : "Email", "Status", ...(!isVoice ? ["Send"] : []), "Location"].map(header => <th key={header}>{header}</th>)}</tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan={isVoice ? 4 : 5} className="table-empty">No leads are attached to this campaign.</td></tr>
                  ) : leads.map(lead => (
                    <CampaignLeadRow key={lead.id} lead={lead} isVoice={isVoice} sendingId={sendingId} onSendNow={sendLeadNow} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
