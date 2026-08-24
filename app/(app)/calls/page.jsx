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
    <div className="card calls-stat-card">
      <div className="calls-stat-card-head">
        <span className="calls-stat-label">{label}</span>
        <span className="calls-stat-icon"><Icon name={icon} size={16} /></span>
      </div>
      <strong className="display calls-stat-value">{value}</strong>
      <span className="calls-stat-detail">{tone === "warn" ? "Needs attention" : label === "connected" ? "Successful connections" : "Across this view"}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.queued;
  return (
    <span className="calls-status-badge" style={{ background: s.bg, color: s.color }}>
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
      return <span className="calls-pending-copy">Analyzing…</span>;
    }
    return <span className="calls-pending-copy">Not available</span>;
  }
  const d = DISPOSITION_STYLES[disposition];
  if (!d) return <span className="calls-pending-copy calls-pending-copy-strong">{disposition}</span>;
  return (
    <span className="calls-disposition-badge" style={{ background: d.bg, color: d.color }}>
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
    <div className="calls-modal-backdrop" onClick={onClose}>
      <div className="calls-modal" onClick={e => e.stopPropagation()}>
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
  const activityCount = calls.length === 1 ? "1 conversation" : `${calls.length} conversations`;

  return (
    <div className="col calls-page" style={{ gap: 24 }}>
      {toast && (
        <div className="row" style={{ position: "fixed", bottom: 24, right: 24, gap: 8, background: "var(--ink)", color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, maxWidth: 360, boxShadow: "var(--sh-lg)" }}>
          <Icon name="checkCircle" size={15} color="var(--g-300)" />
          {toast}
        </div>
      )}

      {selectedCall && <CallDetailsModal call={selectedCall} onClose={() => setSelectedCall(null)} />}

      <header className="calls-hero">
        <div className="calls-hero-copy">
          <div className="calls-kicker">
            <span className="calls-kicker-mark"><Icon name="phone" size={13} color="#06231a" /></span>
            <span>Voice workspace</span>
            <span className="calls-kicker-separator">/</span>
            <span>Activity</span>
          </div>
          <h1 className="display calls-title">Call history</h1>
          <p className="calls-subtitle">A clear view of every AI conversation, from first ring to final outcome.</p>
        </div>
        <div className="calls-hero-actions">
          <div className="calls-privacy-note">
            <span className="calls-privacy-icon"><Icon name="lock" size={14} /></span>
            <span className="calls-privacy-copy"><strong>Inbound privacy</strong><span>Recordings and transcripts are never retained.</span></span>
          </div>
          <button className="btn btn-ghost btn-sm calls-refresh" onClick={load} disabled={loading}>
            <Icon name="refresh" size={14} /> {loading ? "Refreshing…" : "Refresh activity"}
          </button>
        </div>
      </header>

      <section className="calls-overview">
        <div className="calls-section-head">
          <div>
            <div className="eyebrow">Live overview</div>
            <p className="calls-section-description">Keep an eye on connection health and conversations that need follow-up.</p>
          </div>
          <span className="calls-overview-note"><span className="calls-live-dot" /> Updates when you refresh</span>
        </div>
        <div className="calls-kpi-grid">
          <StatCard label="total calls" value={metrics.total} icon="phone" />
          <StatCard label="connected" value={metrics.connected} icon="checkCircle" />
          <StatCard label="in progress" value={metrics.inProgress} icon="clock" tone="warn" />
          <StatCard label="not connected" value={metrics.notConnected} icon="alertCircle" tone="warn" />
        </div>
      </section>

      <section className="card calls-activity-card">
        <div className="calls-activity-head">
          <div>
            <div className="eyebrow">Activity log</div>
            <div className="calls-activity-title">Recent conversations</div>
            <p className="calls-activity-description">Review outcomes, open a transcript, or retry a failed connection.</p>
          </div>
          <div className="calls-activity-count"><strong>{activityCount}</strong><span>{filter === "all" ? "All statuses" : `Filtered by ${FILTER_LABELS[filter]}`}</span></div>
        </div>

        <div className="calls-filter-bar">
          <div className="calls-filter-title"><Icon name="funnel" size={14} /> Filter by status</div>
          <div className="calls-filter-list" role="tablist" aria-label="Filter calls by status">
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={`calls-filter-chip${filter === f ? " is-active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="calls-list-wrap">
          {loading && calls.length > 0 && (
            <div className="calls-loading-overlay"><Spinner size={24} /><span>Refreshing activity…</span></div>
          )}
          {loading && calls.length === 0 ? (
            <div className="calls-list-loading"><Spinner size={22} /><span>Loading call activity…</span></div>
          ) : error ? (
            <div className="calls-empty calls-error-state">
              <span className="calls-empty-icon"><Icon name="alertCircle" size={22} /></span>
              <div className="calls-empty-copy"><strong>We couldn’t load this activity</strong><span>{error}</span></div>
              <button className="btn btn-ghost btn-sm" onClick={load}>Try again</button>
            </div>
          ) : calls.length === 0 ? (
            <div className="calls-empty">
              <span className="calls-empty-icon"><Icon name="phone" size={23} /></span>
              <div className="calls-empty-copy"><strong>{emptyCopy.title}</strong><span>{emptyCopy.body}</span></div>
            </div>
          ) : (
            <div className="calls-list" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto", transition: "opacity .15s" }}>
              {calls.map(call => (
                <article key={call.id} className="calls-activity-row" data-status={call.status}>
                  <div className="calls-activity-gutter">
                    <span className="calls-activity-icon" data-direction={call.direction || "outbound"}>
                      <Icon name="phone" size={17} />
                    </span>
                  </div>
                  <div className="calls-activity-main">
                    <div className="calls-activity-primary">
                      <div className="calls-person">
                        <Avatar name={leadName(call.leads)} size={38} />
                        <div className="calls-person-copy">
                          <strong className="calls-person-name">{leadName(call.leads)}</strong>
                          <span className="calls-person-secondary">{call.leads?.company || (call.direction === "inbound" ? call.from_number : call.to_number) || "Contact details unavailable"}</span>
                        </div>
                      </div>
                      <div className="calls-activity-badges">
                        <StatusBadge status={call.status} />
                        <DispositionBadge disposition={call.disposition} status={call.status} />
                      </div>
                    </div>
                    <div className="calls-activity-meta">
                      <span className="calls-meta-item">
                        <Icon name="arrow" size={13} color="var(--faint)" style={call.direction === "inbound" ? { transform: "rotate(135deg)" } : { transform: "rotate(-45deg)" }} />
                        {call.direction || "outbound"}
                      </span>
                      <span className="calls-meta-item"><Icon name="building" size={13} color="var(--faint)" />{call.campaigns?.name || "Campaign not provided"}</span>
                      <span className="calls-meta-item"><Icon name="clock" size={13} color="var(--faint)" />{formatDuration(call.started_at, call.ended_at, call.duration_seconds)}</span>
                      <span className="calls-meta-item"><Icon name="calendar" size={13} color="var(--faint)" />{formatDate(call.created_at)}</span>
                    </div>
                  </div>
                  <div className="calls-activity-actions">
                    {call.direction === "inbound" ? (
                      <span className="calls-privacy-inline" title="Inbound recordings and transcripts are not retained"><Icon name="lock" size={12} /> Privacy protected</span>
                    ) : (
                      <button className="calls-details-button" onClick={() => setSelectedCall(call)}>
                        Details <Icon name="arrow" size={13} />
                      </button>
                    )}
                    {call.status === "failed" && call.direction !== "inbound" && (
                      <button className="btn btn-ghost btn-sm calls-retry-button" onClick={() => handleRetry(call.id)} disabled={retrying === call.id}>
                        <Icon name="refresh" size={13} /> {retrying === call.id ? "Retrying…" : "Retry call"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
