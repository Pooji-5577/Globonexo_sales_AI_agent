"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";

const STATUS_STYLES = {
  queued:      { label: "Queued",      bg: "var(--bg-2)",  color: "var(--muted)", dot: "var(--faint)" },
  in_progress: { label: "In Progress", bg: "#e0f2fe",      color: "#0369a1",      dot: "#0ea5e9" },
  completed:   { label: "Completed",   bg: "var(--g-50)",  color: "var(--g-700)", dot: "var(--g-500)" },
  failed:      { label: "Failed",      bg: "#fee2e2",      color: "#991b1b",      dot: "#ef4444" },
  voicemail:   { label: "Voicemail",   bg: "#f3f4f6",      color: "#374151",      dot: "#9ca3af" },
};

const DISPOSITION_STYLES = {
  meeting_booked:  { label: "Meeting Booked",  bg: "var(--g-50)",  color: "var(--g-700)" },
  interested:      { label: "Interested",      bg: "#e0f2fe",      color: "#0369a1" },
  callback:        { label: "Callback",        bg: "#fff7ed",      color: "#9a3412" },
  not_interested:  { label: "Not Interested",  bg: "#fee2e2",      color: "#991b1b" },
  voicemail:       { label: "Voicemail",       bg: "#f3f4f6",      color: "#374151" },
  no_answer:       { label: "No Answer",       bg: "#f3f4f6",      color: "#374151" },
};

const FILTERS = ["all", "completed", "in_progress", "failed", "voicemail"];

const FILTER_LABELS = {
  all: "All",
  completed: "Completed",
  in_progress: "In Progress",
  failed: "Failed",
  voicemail: "Voicemail",
};

const EMPTY_STATE_COPY = {
  all:         { title: "No calls yet",             body: "Launch a voice campaign to start making calls." },
  completed:   { title: "No completed calls yet",   body: "Calls will show up here once the conversation finishes." },
  in_progress: { title: "No calls in progress",      body: "Calls will appear here the moment they start dialing." },
  failed:      { title: "No failed calls",           body: "Nice — nothing has failed to connect." },
  voicemail:   { title: "No voicemails yet",         body: "Calls that hit voicemail will show up here." },
};

function StatCard({ label, value, icon, tone }) {
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

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.queued;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function DispositionBadge({ disposition, status }) {
  if (!disposition) {
    // Retell only analyzes calls that actually completed - a failed, queued,
    // or still-in-progress call has no transcript to analyze yet, so showing
    // "Analyzing..." for those is misleading; only a completed call is
    // genuinely waiting on the post-call analysis webhook.
    if (status === "completed") {
      return <span style={{ fontSize: 11, color: "var(--faint)" }}>Analyzing…</span>;
    }
    return <span style={{ fontSize: 11, color: "var(--faint)" }}>—</span>;
  }
  const d = DISPOSITION_STYLES[disposition];
  if (!d) return <span style={{ fontSize: 11, color: "var(--muted)" }}>{disposition}</span>;
  return (
    <span style={{ padding: "3px 9px", borderRadius: 99, background: d.bg, color: d.color, fontSize: 11, fontWeight: 600 }}>
      {d.label}
    </span>
  );
}

function formatDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "—";
  const seconds = Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000);
  if (seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function leadName(lead) {
  return [lead?.first_name, lead?.last_name].filter(Boolean).join(" ") || lead?.name || "Unknown";
}

function TranscriptModal({ call, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "var(--bg)", borderRadius: 14, padding: 24, maxWidth: 600, width: "100%", maxHeight: "70vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
        <div className="row spread" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{leadName(call.leads)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{call.leads?.company || ""}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0, fontSize: 18, lineHeight: 1 }} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {call.transcript ? (
          <pre style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--fg)", fontFamily: "inherit", margin: 0 }}>
            {call.transcript}
          </pre>
        ) : (
          <div style={{ textAlign: "center", color: "var(--muted)", padding: "32px 0", fontSize: 13 }}>
            Transcript is still being processed. Check back in a minute.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallsPage() {
  const [calls, setCalls]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [filter, setFilter]         = useState("all");
  const [toast, setToast]           = useState("");
  const [transcript, setTranscript] = useState(null);
  const [retrying, setRetrying]     = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const { data } = await api.get(`/calls${params}`);
      setCalls(Array.isArray(data) ? data : []);
    } catch {
      setCalls([]);
      setError("Failed to load calls.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleRetry = async (callId) => {
    setRetrying(callId);
    try {
      await api.post(`/calls/${callId}/retry`);
      showToast("Call re-queued successfully.");
      load();
    } catch (err) {
      showToast(err?.response?.data?.error ?? "Failed to retry call.");
    } finally {
      setRetrying("");
    }
  };

  const metrics = useMemo(() => ({
    total:      calls.length,
    completed:  calls.filter(c => c.status === "completed").length,
    inProgress: calls.filter(c => c.status === "in_progress" || c.status === "queued").length,
    failed:     calls.filter(c => c.status === "failed").length,
  }), [calls]);

  const emptyCopy = EMPTY_STATE_COPY[filter] ?? EMPTY_STATE_COPY.all;

  return (
    <div className="col" style={{ gap: 20 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      {transcript && <TranscriptModal call={transcript} onClose={() => setTranscript(null)} />}

      {/* Header */}
      <div className="row spread" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Call History</h1>
          <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Outcomes, transcripts, and recordings from every voice call.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="metric-grid">
        <StatCard label="total calls" value={metrics.total} icon="phone" />
        <StatCard label="completed" value={metrics.completed} icon="checkCircle" />
        <StatCard label="in progress" value={metrics.inProgress} icon="clock" tone="warn" />
        <StatCard label="failed" value={metrics.failed} icon="alertCircle" tone="warn" />
      </div>

      {/* Filter chips */}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              border: "1px solid",
              borderColor: filter === f ? "var(--fg)" : "var(--line-2)",
              background: filter === f ? "var(--fg)" : "transparent",
              color: filter === f ? "var(--bg)" : "var(--muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flex: "none",
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--error)", fontSize: 13 }}>
            {error} <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        ) : calls.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📞</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{emptyCopy.title}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{emptyCopy.body}</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["Lead", "Campaign", "Status", "Outcome", "Duration", "Date", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call, i) => (
                  <tr key={call.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line-2)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500 }}>{leadName(call.leads)}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{call.leads?.company || call.to_number}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{call.campaigns?.name || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={call.status} /></td>
                    <td style={{ padding: "12px 16px" }}><DispositionBadge disposition={call.disposition} status={call.status} /></td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{formatDuration(call.started_at, call.ended_at)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDate(call.created_at)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setTranscript(call)}
                          style={{ fontSize: 11 }}
                        >
                          Transcript
                        </button>
                        {call.status === "failed" && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRetry(call.id)}
                            disabled={retrying === call.id}
                            style={{ fontSize: 11 }}
                          >
                            {retrying === call.id ? "…" : "Retry"}
                          </button>
                        )}
                      </div>
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
