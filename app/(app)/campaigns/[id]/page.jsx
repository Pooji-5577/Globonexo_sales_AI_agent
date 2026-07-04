"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";

const STATUS_STYLES = {
  active:    { label: "Active",    bg: "var(--g-50)",  color: "var(--g-700)", dot: "var(--g-500)" },
  paused:    { label: "Paused",    bg: "#fff7ed",      color: "#9a3412",      dot: "#f97316" },
  draft:     { label: "Draft",     bg: "var(--bg-2)",  color: "var(--muted)", dot: "var(--faint)" },
  completed: { label: "Completed", bg: "#eef2ff",      color: "#4338ca",      dot: "#6366f1" },
};

const CHANNEL_STYLES = {
  email: { label: "Email",  bg: "#e0f2fe", color: "#0369a1" },
  voice: { label: "Voice",  bg: "#f0fdf4", color: "#15803d" },
};

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

function LeadStatusBadge({ status }) {
  const colors = {
    new:             { bg: "var(--bg-2)",  color: "var(--muted)" },
    queued:          { bg: "#e0f2fe",      color: "#0369a1" },
    contacted:       { bg: "#fef9c3",      color: "#854d0e" },
    engaged:         { bg: "#dcfce7",      color: "#166534" },
    meeting_booked:  { bg: "var(--g-50)",  color: "var(--g-700)" },
    not_interested:  { bg: "#fee2e2",      color: "#991b1b" },
  };
  const s = colors[status] ?? colors.new;
  const label = status?.replace(/_/g, " ") ?? "new";
  return (
    <span style={{ padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [launching, setLaunching] = useState(false);
  const [pausing, setPausing]     = useState(false);
  const [toast, setToast]         = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [campaignRes, leadsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/leads?campaignId=${id}`),
      ]);
      setCampaign(campaignRes.data);
      setLeads(leadsRes.data?.items ?? leadsRes.data ?? []);
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
        showToast(`Campaign launched! ${data.queued} calls queued${data.skipped ? `, ${data.skipped} skipped (no phone)` : ""}.`);
      } else {
        showToast("Campaign launched successfully.");
      }
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

  if (loading) {
    return (
      <div className="col" style={{ gap: 16, padding: "32px 0" }}>
        <div style={{ width: 280, height: 20, borderRadius: 99, background: "var(--bg-2)" }} />
        <div className="card" style={{ padding: 24, height: 180, background: "var(--bg-2)" }} />
      </div>
    );
  }

  if (error) {
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
    <div className="col" style={{ gap: 20 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="row spread" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 36, padding: 0 }} onClick={() => router.push("/campaigns")} aria-label="Back">
            <Icon name="arrow-left" size={16} />
          </button>
          <div className="col" style={{ gap: 4 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{campaign.name}</h1>
            <div className="row" style={{ gap: 8 }}>
              <StatusBadge status={campaign.status} />
              <ChannelBadge channel={campaign.channel} />
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button className="btn btn-primary btn-sm" onClick={handleLaunch} disabled={launching}>
              {launching ? "Launching…" : "Launch Campaign"}
            </button>
          )}
          {campaign.status === "active" && (
            <button className="btn btn-outline btn-sm" onClick={handlePause} disabled={pausing}>
              {pausing ? "Pausing…" : "Pause"}
            </button>
          )}
        </div>
      </div>

      {/* Campaign config card */}
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          {isVoice ? "Voice Configuration" : "Email Configuration"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {isVoice ? (
            <>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Voice Mode</span>
                <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{campaign.voiceMode ?? "ai"}</span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Calls / Hour</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.callCadencePerHour ?? 5}</span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Business Hours</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.businessHoursStart} – {campaign.businessHoursEnd}</span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Timezone</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.timezone}</span>
              </div>
            </>
          ) : (
            <>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Daily Send Cap</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.dailySendCap ?? 100} emails</span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Max Leads</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.maxLeads ?? 100}</span>
              </div>
            </>
          )}
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Enrolled Leads</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.stats?.enrolled ?? 0}</span>
          </div>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Meetings Booked</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.stats?.meetings ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-2)" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Assigned Leads</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{leads.length} total</span>
        </div>

        {leads.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            No leads assigned to this campaign yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["Name", "Company", isVoice ? "Phone" : "Email", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line-2)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {[lead.firstName ?? lead.first_name, lead.lastName ?? lead.last_name].filter(Boolean).join(" ") || lead.name || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{lead.company || "—"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                      {isVoice ? (lead.phone || <span style={{ color: "var(--error)", fontSize: 12 }}>No phone</span>) : (lead.email || "—")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <LeadStatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
