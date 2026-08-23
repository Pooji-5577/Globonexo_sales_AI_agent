"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";
import Spinner from "../../../components/ui/Spinner";
import Avatar from "../../../components/ui/Avatar";

const STATUS_STYLES = {
  queued:      { label: "Queued",      bg: "var(--bg-2)",  color: "var(--muted)", dot: "var(--faint)" },
  in_progress: { label: "In Progress", bg: "#e0f2fe",      color: "#0369a1",      dot: "#0ea5e9" },
  completed:   { label: "Completed",   bg: "var(--g-50)",  color: "var(--g-700)", dot: "var(--g-500)" },
  failed:      { label: "Failed",      bg: "#fee2e2",      color: "#991b1b",      dot: "#ef4444" },
  voicemail:   { label: "Voicemail",   bg: "#f3f4f6",      color: "#374151",      dot: "#9ca3af" },
  rejected:    { label: "Rejected",    bg: "#f3f4f6",      color: "#374151",      dot: "#9ca3af" },
  no_answer:   { label: "No Answer",   bg: "#fff7ed",      color: "#9a3412",      dot: "#f97316" },
  busy:        { label: "Busy",        bg: "#fff7ed",      color: "#9a3412",      dot: "#f97316" },
  not_connected:{ label: "Not Connected", bg: "#f3f4f6",   color: "#4b5563",      dot: "#9ca3af" },
};

const DISPOSITION_STYLES = {
  meeting_booked:  { label: "Meeting Booked",  bg: "var(--g-50)",  color: "var(--g-700)" },
  interested:      { label: "Interested",      bg: "#e0f2fe",      color: "#0369a1" },
  callback:        { label: "Callback",        bg: "#fff7ed",      color: "#9a3412" },
  not_interested:  { label: "Not Interested",  bg: "#fee2e2",      color: "#991b1b" },
  voicemail:       { label: "Voicemail",       bg: "#f3f4f6",      color: "#374151" },
  no_answer:       { label: "No Answer",       bg: "#f3f4f6",      color: "#374151" },
  busy:            { label: "Busy",             bg: "#fff7ed",      color: "#9a3412" },
  no_connect:      { label: "Not Connected",    bg: "#f3f4f6",      color: "#4b5563" },
  technical_failure:{ label: "Technical Failure", bg: "#fee2e2",   color: "#991b1b" },
};

const FILTERS = ["all", "completed", "in_progress", "no_answer", "busy", "voicemail", "failed", "rejected"];

const FILTER_LABELS = {
  all: "All",
  completed: "Completed",
  in_progress: "In Progress",
  failed: "Failed",
  voicemail: "Voicemail",
  rejected: "Rejected",
  no_answer: "No answer",
  busy: "Busy",
};

const EMPTY_STATE_COPY = {
  all:         { title: "No calls yet",             body: "Launch a voice campaign to start making calls." },
  completed:   { title: "No completed calls yet",   body: "Calls will show up here once the conversation finishes." },
  in_progress: { title: "No calls in progress",      body: "Calls will appear here the moment they start dialing." },
  failed:      { title: "No failed calls",           body: "Nice. Nothing has failed to connect." },
  voicemail:   { title: "No voicemails yet",         body: "Calls that hit voicemail will show up here." },
  rejected:    { title: "No rejected calls",         body: "Calls declined by inbound safety and budget rules will show up here." },
  no_answer:   { title: "No unanswered calls",       body: "Calls that did not connect will show up here." },
  busy:        { title: "No busy calls",             body: "Calls that reached a busy destination will show up here." },
};

function StatCard({ label, value, icon, tone }) {
  const warn = tone === "warn";
  return (
    <div className="card kpi-card-accent" data-tone={warn ? "warn" : undefined} style={{ padding: "15px 16px", borderRadius: 14 }}>
      <div className="row spread">
        <span className="faint nw" style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
        <span className="kpi-icon-badge" data-tone={warn ? "warn" : undefined}><Icon name={icon} size={15} /></span>
      </div>
      <strong className="display" style={{ display: "block", fontSize: 28, marginTop: 10, color: "var(--ink)" }}>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.queued;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>
      <span className="calls-status-dot" style={{ "--dot-color": s.dot, width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function DispositionBadge({ disposition, status }) {
  if (!disposition) {
    // A connected call may still be waiting for Retell's post-call analysis;
    // terminal non-connected states now receive a provider disposition from
    // call_ended and should not look as if analysis is pending.
    if (status === "completed") {
      return <span style={{ fontSize: 11, color: "var(--faint)" }}>Analyzing…</span>;
    }
    return <span style={{ fontSize: 11, color: "var(--faint)" }}>Not available</span>;
  }
  const d = DISPOSITION_STYLES[disposition];
  if (!d) return <span style={{ fontSize: 11, color: "var(--muted)" }}>{disposition}</span>;
  return (
    <span style={{ padding: "3px 9px", borderRadius: 99, background: d.bg, color: d.color, fontSize: 11, fontWeight: 600 }}>
      {d.label}
    </span>
  );
}

function formatDuration(startedAt, endedAt, durationSeconds) {
  const seconds = Number.isFinite(Number(durationSeconds))
    ? Math.max(0, Math.floor(Number(durationSeconds)))
    : startedAt && endedAt
      ? Math.floor((new Date(endedAt) - new Date(startedAt)) / 1000)
      : null;
  if (seconds === null) return "Not available";
  if (seconds < 0) return "Not available";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function leadName(lead) {
  return [lead?.first_name, lead?.last_name].filter(Boolean).join(" ") || lead?.name || "Unknown";
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--line-2)" }}>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{label}</span>
      <span style={{ color: "var(--ink)", fontSize: 12, overflowWrap: "anywhere" }}>{String(value)}</span>
    </div>
  );
}

function formatProviderCost(cost) {
  const combined = Number(cost?.combined_cost);
  if (!Number.isFinite(combined)) return null;
  return `$${(combined / 100).toFixed(2)} provider cost`;
}

function formatAnalysisLabel(value) {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function CallDetailsModal({ call, onClose }) {
  const analysis = call.retell_analysis_data && typeof call.retell_analysis_data === "object"
    ? call.retell_analysis_data
    : {};
  const analysisEntries = Object.entries(analysis).filter(([, value]) => value !== null && value !== undefined && value !== "");
  const hasRecording = call.direction !== "inbound" && (call.recording_url || call.recording_multi_channel_url);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,23,18,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 26, maxWidth: 720, width: "100%", maxHeight: "82vh", overflow: "auto", boxShadow: "var(--sh-lg)" }} onClick={e => e.stopPropagation()}>
        <div className="row spread" style={{ marginBottom: 18 }}>
          <div className="row" style={{ gap: 12 }}>
            <Avatar name={leadName(call.leads)} size={38} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{leadName(call.leads)}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{call.leads?.company || ""}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: 34, height: 34, padding: 0, fontSize: 18, lineHeight: 1, borderRadius: "50%" }} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="row" style={{ gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <StatusBadge status={call.status} />
          <DispositionBadge disposition={call.disposition} status={call.status} />
          <span className="chip" style={{ fontSize: 11.5, height: 24 }}>{formatDuration(call.started_at, call.ended_at, call.duration_seconds)}</span>
        </div>

        {call.call_summary && (
          <section style={{ marginBottom: 18, padding: 14, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12 }}>
            <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>Call summary</div>
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{call.call_summary}</div>
          </section>
        )}

        <section style={{ marginBottom: 18 }}>
          <DetailRow label="Direction" value={call.direction || "outbound"} />
          <DetailRow label="Connection" value={call.disconnection_reason ? formatAnalysisLabel(call.disconnection_reason) : call.status === "completed" ? "Connected" : null} />
          <DetailRow label="Sentiment" value={call.user_sentiment} />
          <DetailRow label="Call success" value={typeof call.call_successful === "boolean" ? (call.call_successful ? "Yes" : "No") : null} />
          <DetailRow label="Callback" value={call.callback_requested_at ? formatDate(call.callback_requested_at) : null} />
          <DetailRow label="Provider cost" value={formatProviderCost(call.call_cost)} />
          <DetailRow label="Agent version" value={call.agent_version ? `${call.agent_id || "Retell agent"} · v${call.agent_version}` : null} />
        </section>

        {analysisEntries.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>Sales analysis</div>
            <div style={{ borderTop: "1px solid var(--line-2)" }}>
              {analysisEntries.map(([key, value]) => <DetailRow key={key} label={formatAnalysisLabel(key)} value={typeof value === "boolean" ? (value ? "Yes" : "No") : value} />)}
            </div>
          </section>
        )}

        {hasRecording && (
          <section style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>Recording</div>
            <audio controls preload="none" src={call.recording_multi_channel_url || call.recording_url} style={{ width: "100%" }} />
          </section>
        )}

        <section>
          <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>Transcript</div>
          {call.direction === "inbound" ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "18px 0" }}>Inbound transcripts and recordings are not retained.</div>
          ) : call.transcript ? (
            <pre style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--ink)", fontFamily: "inherit", margin: 0, padding: 14, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12 }}>{call.transcript}</pre>
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "18px 0" }}>Transcript is still being processed, or this call did not connect.</div>
          )}
        </section>

        {call.direction !== "inbound" && call.transcript_with_tool_calls?.length > 0 && (
          <details style={{ marginTop: 18 }}>
            <summary style={{ cursor: "pointer", color: "var(--muted)", fontSize: 12 }}>Show tool activity ({call.transcript_with_tool_calls.length} events)</summary>
            <pre style={{ fontSize: 11, lineHeight: 1.45, whiteSpace: "pre-wrap", color: "var(--muted)", marginTop: 8 }}>{JSON.stringify(call.transcript_with_tool_calls, null, 2)}</pre>
          </details>
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
  const [selectedCall, setSelectedCall] = useState(null);
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
    connected:  calls.filter(c => c.status === "completed").length,
    inProgress: calls.filter(c => c.status === "in_progress" || c.status === "queued").length,
    notConnected: calls.filter(c => ["no_answer", "busy", "not_connected", "voicemail", "failed", "rejected"].includes(c.status)).length,
  }), [calls]);

  const emptyCopy = EMPTY_STATE_COPY[filter] ?? EMPTY_STATE_COPY.all;

  return (
    <div className="col" style={{ gap: 20 }}>
      {toast && (
        <div className="row" style={{ position: "fixed", bottom: 24, right: 24, gap: 8, background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, maxWidth: 360, boxShadow: "var(--sh-lg)" }}>
          <Icon name="checkCircle" size={15} color="var(--g-300)" />
          {toast}
        </div>
      )}

      {selectedCall && <CallDetailsModal call={selectedCall} onClose={() => setSelectedCall(null)} />}

      {/* Header */}
      <div className="row spread" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(140deg,#29d68f,#15c4c0)", display: "grid", placeItems: "center", boxShadow: "var(--sh-green)", flex: "none" }}>
            <Icon name="phone" size={20} color="#06231a" />
          </span>
          <div>
            <h1 className="display" style={{ fontSize: 20, margin: 0 }}>Call History</h1>
            <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Inbound and outbound outcomes. Privacy-protected inbound calls do not retain transcripts or recordings.</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <Icon name="refresh" size={14} /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="calls-kpi-grid">
        <StatCard label="total calls" value={metrics.total} icon="phone" />
        <StatCard label="connected" value={metrics.connected} icon="checkCircle" />
        <StatCard label="in progress" value={metrics.inProgress} icon="clock" tone="warn" />
        <StatCard label="not connected" value={metrics.notConnected} icon="alertCircle" tone="warn" />
      </div>

      {/* Filter chips */}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            className="btn calls-filter-chip"
            onClick={() => setFilter(f)}
            style={{
              height: 32,
              padding: "0 15px",
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flex: "none",
              border: filter === f ? "none" : "1px solid var(--line)",
              background: filter === f ? "linear-gradient(180deg,var(--g-400),var(--g-500))" : "#fff",
              color: filter === f ? "#06231a" : "var(--ink-2)",
              boxShadow: filter === f ? "var(--sh-green)" : "var(--sh-xs)",
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative", borderRadius: 16 }}>
        {loading && calls.length > 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.6)", display: "grid", placeItems: "center", zIndex: 1 }}>
            <Spinner size={22} />
          </div>
        )}
        {loading && calls.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <Spinner size={20} />
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--stop)", fontSize: 13 }}>
            {error} <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        ) : calls.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center" }}>
            <span style={{ width: 52, height: 52, borderRadius: 16, display: "inline-grid", placeItems: "center", background: "var(--g-50)", color: "var(--g-600)", marginBottom: 14 }}>
              <Icon name="phone" size={24} />
            </span>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{emptyCopy.title}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{emptyCopy.body}</div>
          </div>
        ) : (
          <div className="scroll" style={{ overflowX: "auto", opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto", transition: "opacity .15s" }}>
            <table className="calls-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Lead", "Direction", "Campaign", "Status", "Outcome", "Duration", "Date", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calls.map((call, i) => (
                  <tr key={call.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line-2)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div className="row" style={{ gap: 9 }}>
                        <Avatar name={leadName(call.leads)} size={28} />
                        <div className="col" style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{leadName(call.leads)}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{call.leads?.company || (call.direction === "inbound" ? call.from_number : call.to_number)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                      <span className="row" style={{ gap: 5, textTransform: "capitalize" }}>
                        <Icon name="arrow" size={12} color="var(--faint)" style={call.direction === "inbound" ? { transform: "rotate(135deg)" } : { transform: "rotate(-45deg)" }} />
                        {call.direction || "outbound"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{call.campaigns?.name || "Campaign not provided"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={call.status} /></td>
                    <td style={{ padding: "12px 16px" }}><DispositionBadge disposition={call.disposition} status={call.status} /></td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{formatDuration(call.started_at, call.ended_at, call.duration_seconds)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDate(call.created_at)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="row" style={{ gap: 6 }}>
                        {call.direction === "inbound" ? (
                          <span title="Inbound recordings and transcripts are not retained" style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap" }}>Privacy protected</span>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelectedCall(call)}
                            style={{ fontSize: 11 }}
                          >
                            Details
                          </button>
                        )}
                        {call.status === "failed" && call.direction !== "inbound" && (
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
