"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { isValidEmail } from "../../../../lib/validation";
import DraftReview from "../../../../components/campaigns/DraftReview";
import CampaignPreparationPanel from "./CampaignPreparationPanel";
import { browserTimezone, campaignReadyCount, formatScheduledInTimezone, voiceLaunchGate } from "../../../../lib/campaign-display";

const STATUS_STYLES = {
  active: { label: "Active", bg: "var(--g-50)", color: "var(--g-700)", dot: "var(--g-500)" },
  paused: { label: "Paused", bg: "#fff7ed", color: "#9a3412", dot: "#f97316" },
  draft: { label: "Draft", bg: "var(--bg-2)", color: "var(--muted)", dot: "var(--faint)" },
  completed: { label: "Completed", bg: "#eef2ff", color: "#4338ca", dot: "#6366f1" },
};

const CHANNEL_STYLES = {
  email: { label: "Email", bg: "#e0f2fe", color: "#0369a1" },
  voice: { label: "Voice", bg: "#f0fdf4", color: "#15803d" },
  both: { label: "Email + Voice", bg: "#ede9fe", color: "#6d28d9" },
};

const usesEmail = channel => channel === "email" || channel === "both";
const usesVoice = channel => channel === "voice" || channel === "both";

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
      {usesEmail(channel) && <Icon name="mail" size={12} />}
      {usesVoice(channel) && <Icon name="phone" size={12} />}
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

function campaignEligibility(lead) {
  const membership = lead.campaignMembership;
  if (!membership || membership.qualificationStatus === "qualified") return null;
  const reason = membership.rejectionReason || lead.rejectionReason;
  const labels = {
    dnc_found: "Blocked: DNC match",
    dnc_pending: "Awaiting DNC check",
    dnc_missing: "DNC check required",
    internal_do_not_call: "Blocked: do not call",
    no_phone: "Missing phone",
    invalid_phone: "Invalid phone",
    enrichment_not_attempted_budget: "Not enriched: campaign budget reached",
    missing_identity: "Missing identity data",
  };
  return {
    label: labels[reason] || (membership.qualificationStatus === "pending" ? "Preparing" : "Not eligible"),
    blocked: membership.status === "blocked" || membership.qualificationStatus === "rejected",
  };
}

function CampaignLeadRow({ lead, attempt, displayTimezone, showEmail, showPhone, isAiVoice, actionKey, onEmailNow, onCallNow }) {
  const status = lead.status || "new";
  const hasEmail = isValidEmail(lead.email || "");
  const hasPhone = Boolean(lead.phone?.trim());
  const stopped = STOPPED_STATUSES.has(status);
  const eligibility = campaignEligibility(lead);
  const campaignBlocked = Boolean(eligibility?.blocked || (lead.campaignMembership && lead.campaignMembership.qualificationStatus !== "qualified"));
  const canEmailNow = showEmail && hasEmail && lead.campaignId && status !== "contacted" && !stopped && !campaignBlocked;
  const canCallNow = showPhone && isAiVoice && hasPhone && lead.campaignId && !stopped && !campaignBlocked;
  const sending = actionKey === `email:${lead.id}`;
  const calling = actionKey === `call:${lead.id}`;

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
      {showEmail && <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.email || "Not revealed"}</span></td>}
      {showPhone && <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.phone || "No phone"}</span></td>}
      <td>
        <div className="col" style={{ gap: 4, alignItems: "flex-start" }}>
          <span className="badge" style={leadStatusStyle(status)}>{LEAD_STATUS_LABELS[status] || status.replace(/_/g, " ")}</span>
          {eligibility && <span className="faint" style={{ fontSize: 11.5 }}>{eligibility.label}</span>}
        </div>
      </td>
      <td>
        {attempt ? (
          <div className="col" style={{ gap: 2 }}>
            <strong style={{ fontSize: 12.5 }}>{attempt.scheduled_at ? formatScheduledInTimezone(attempt.scheduled_at, displayTimezone) : "Not scheduled"}</strong>
            <span className="faint" style={{ fontSize: 11.5 }}>{attempt.blocked_reason ? attempt.blocked_reason.replace(/_/g, " ") : `${attempt.status} · ${attempt.lead_timezone || "timezone required"}`}</span>
          </div>
        ) : <span className="faint" style={{ fontSize: 12 }}>Not scheduled</span>}
      </td>
      <td>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {showEmail && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              disabled={!canEmailNow || Boolean(actionKey)}
              title={!hasEmail ? "Lead needs an email" : status === "contacted" ? "Step 1 has already been sent" : stopped ? "Sequence is stopped for this lead" : "Email this lead immediately"}
              style={{ height: 32, padding: "0 10px", fontSize: 12, whiteSpace: "nowrap" }}
              onClick={() => onEmailNow(lead.id)}
            >
              <Icon name="send" size={13} /> {sending ? "Sending..." : "Email immediately"}
            </button>
          )}
          {showPhone && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              disabled={!canCallNow || Boolean(actionKey)}
              title={!isAiVoice ? "Immediate calls are available for AI voice campaigns" : !hasPhone ? "Lead needs a phone number" : campaignBlocked ? eligibility?.label || "Lead is not ready" : stopped ? "Calls are stopped for this lead" : "Call this lead now"}
              style={{ height: 32, padding: "0 10px", fontSize: 12, whiteSpace: "nowrap" }}
              onClick={() => onCallNow(lead.id)}
            >
              <Icon name="phone" size={13} /> {calling ? "Calling..." : "Call immediately"}
            </button>
          )}
        </div>
      </td>
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
  const [actionKey, setActionKey] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [displayTimezone, setDisplayTimezone] = useState(browserTimezone());
  const [preparationData, setPreparationData] = useState(null);
  const handlePreparationChanged = useCallback(data => {
    setPreparationData(data);
    const status = data?.campaign?.status;
    if (status) setCampaign(current => current ? { ...current, status } : current);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [campaignRes, leadsRes, scheduleRes, settingsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get("/leads", { params: { campaignId: id, perPage: 500 } }),
        api.get(`/campaigns/${id}/schedule`),
        api.get("/settings").catch(() => ({ data: {} })),
      ]);
      setCampaign(campaignRes.data);
      setLeads(Array.isArray(leadsRes.data?.items) ? leadsRes.data.items : leadsRes.data ?? []);
      setSchedule(Array.isArray(scheduleRes.data?.items) ? scheduleRes.data.items : []);
      setDisplayTimezone(settingsRes.data?.displayTimezone || settingsRes.data?.profile?.displayTimezone || browserTimezone());
    } catch (err) {
      setError(err?.response?.data?.error ?? "Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleLaunch = async () => {
    setLaunching(true);
    setError("");
    try {
      const { data } = await api.post(`/campaigns/${id}/launch`);
      setCampaign(prev => ({ ...prev, status: "active" }));
      if (data.emailQueued !== undefined && data.voiceQueued !== undefined && usesEmail(data.channel) && usesVoice(data.channel)) {
        showToast(`Campaign launched. ${data.emailQueued} email${data.emailQueued === 1 ? "" : "s"} and ${data.voiceQueued} call${data.voiceQueued === 1 ? "" : "s"} queued${data.skipped ? `, ${data.skipped} skipped` : ""}.`);
      } else if (data.queued !== undefined) {
        showToast(`Campaign launched. ${data.queued} queued${data.skipped ? `, ${data.skipped} skipped` : ""}.`);
      } else {
        showToast("Campaign launched successfully.");
      }
      await load();
    } catch (err) {
      const message = err?.response?.data?.error ?? "Failed to launch campaign.";
      setError(message);
      showToast(message);
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
        // The send was started from the leads table, so come back to it
        // rather than dropping the customer on the default Emails tab.
        returnTo: `/campaigns/${id}?tab=leads`,
        sendLeadId: leadId,
      },
    });
    if (!data?.url) throw new Error("Gmail connection URL was not returned.");
    window.location.assign(data.url);
  }, [id]);

  const sendLeadNow = useCallback(async leadId => {
    setActionKey(`email:${leadId}`);
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
      setActionKey("");
    }
  }, [load, reconnectGmailForLead, showToast]);

  const callLeadNow = useCallback(async leadId => {
    setActionKey(`call:${leadId}`);
    setError("");
    try {
      await api.post(`/leads/${leadId}/call-now`);
      showToast("Calling this lead now.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not call this lead now.");
    } finally {
      setActionKey("");
    }
  }, [load, showToast]);

  useEffect(() => {
    const sendLeadId = searchParams.get("sendLeadId");
    if (!sendLeadId || searchParams.get("gmail") !== "connected" || autoSendStartedRef.current) return;
    autoSendStartedRef.current = true;
    sendLeadNow(sendLeadId);
  }, [searchParams, sendLeadNow]);

  // The tab lives in the URL so a reload, a shared link, and the Gmail
  // reconnect round-trip all land on the section the customer was reading.
  const activeTab = searchParams.get("tab") === "leads" ? "leads" : "emails";
  const selectTab = useCallback(tab => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "leads") params.set("tab", "leads");
    else params.delete("tab");
    const query = params.toString();
    router.push(query ? `/campaigns/${id}?${query}` : `/campaigns/${id}`, { scroll: false });
  }, [id, router, searchParams]);

  const metrics = useMemo(() => {
    const stats = campaign?.stats || {};
    const ready = campaignReadyCount({ channel: campaign?.channel, stats, preparationData });
    return [
      ["Enrolled", stats.enrolled ?? leads.length],
      ["Ready", ready],
      ["Missing email", stats.missingEmail ?? 0],
      ["Queued", stats.queued ?? 0],
      ["Sent", stats.sent ?? 0],
    ];
  }, [campaign, leads.length, preparationData]);
  const nextAttemptByLead = useMemo(() => {
    const map = new Map();
    for (const attempt of schedule) {
      if (!map.has(attempt.lead_id) && ["planned", "scheduled", "processing", "calling", "paused", "blocked", "rescheduling"].includes(attempt.status)) map.set(attempt.lead_id, attempt);
    }
    return map;
  }, [schedule]);

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

  const emailEnabled = usesEmail(campaign.channel);
  const voiceEnabled = usesVoice(campaign.channel);
  const dualChannel = emailEnabled && voiceEnabled;
  const isAiVoice = voiceEnabled && (campaign.voiceMode ?? "ai") === "ai";
  const launchGate = isAiVoice ? voiceLaunchGate(preparationData) : { blocked: false, message: "" };

  // A dual-channel campaign shows an Email and a Phone column, so the lead
  // table columns are derived rather than picked from two fixed layouts.
  const leadColumns = [
    { header: "Lead", width: dualChannel ? "25%" : "34%" },
    ...(emailEnabled ? [{ header: "Email", width: dualChannel ? "18%" : "22%" }] : []),
    ...(voiceEnabled ? [{ header: "Phone", width: dualChannel ? "14%" : "22%" }] : []),
    { header: "Status", width: dualChannel ? "11%" : "14%" },
    { header: "Next outreach", width: "19%" },
    { header: "Action", width: dualChannel ? "20%" : "16%" },
    { header: "Location", width: dualChannel ? "12%" : "14%" },
  ];

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--fg)", color: "var(--bg)", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className="row spread page-toolbar campaign-detail-toolbar">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <button className="btn btn-ghost btn-sm" type="button" style={{ width: 40, padding: 0 }} onClick={() => router.push("/campaigns")} aria-label="Back to campaigns">
            <Icon name="arrowLeft" size={16} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 className="display page-title ellip">{campaign.name}</h1>
            <div className="row" style={{ gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <StatusBadge status={campaign.status} />
              <ChannelBadge channel={campaign.channel} />
              <span className="faint" style={{ fontSize: 12 }}>Created {formatDate(campaign.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button className="btn btn-primary btn-sm" data-tour="campaign-launch" onClick={handleLaunch} disabled={launching || launchGate.blocked} title={launchGate.blocked ? launchGate.message : undefined}>
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
          <CampaignPreparationPanel campaignId={campaign.id} channel={campaign.channel} campaignStatus={campaign.status} onChanged={handlePreparationChanged} />

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
              {dualChannel ? "Email + voice configuration" : voiceEnabled ? "Voice configuration" : "Email configuration"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {emailEnabled && (
                <>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Daily send cap</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.dailySendCap ?? 100} emails</span></div>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Max leads</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.maxLeads ?? 25}</span></div>
                </>
              )}
              {voiceEnabled && (
                <>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Voice mode</span><span style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize" }}>{campaign.voiceMode ?? "ai"}</span></div>
                  <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Calls / hour</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.callCadencePerHour ?? 5}</span></div>
                </>
              )}
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Lead-local hours</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.businessHoursStart} - {campaign.businessHoursEnd}</span></div>
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Your display timezone</span><span style={{ fontSize: 14, fontWeight: 700 }}>{displayTimezone}</span></div>
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Campaign schedule timezone</span><span style={{ fontSize: 14, fontWeight: 700 }}>{campaign.timezone}</span></div>
              <div className="col" style={{ gap: 2 }}><span className="faint" style={{ fontSize: 11 }}>Contact days</span><span style={{ fontSize: 14, fontWeight: 700 }}>{(campaign.allowedWeekdays ?? [1,2,3,4,5]).map(day => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day]).join(", ")}</span></div>
            </div>
          </div>

          {/* A voice-only campaign has no drafts to review, so it keeps the
              single leads view rather than showing a lone dead tab. */}
          {emailEnabled && (
            <div className="segmented-control prospects-source-tabs" role="tablist" aria-label="Campaign sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "emails"}
                className={activeTab === "emails" ? "is-active" : ""}
                onClick={() => selectTab("emails")}
              >
                Emails
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "leads"}
                className={activeTab === "leads" ? "is-active" : ""}
                onClick={() => selectTab("leads")}
              >
                Leads
              </button>
            </div>
          )}

          {emailEnabled && activeTab === "emails" && (
            <DraftReview campaignId={campaign.id} displayTimezone={displayTimezone} onChanged={load} />
          )}

          {(!emailEnabled || activeTab === "leads") && (
          <div className="card table-shell" data-tour="campaign-leads">
            <div className="filter-bar">
              <div>
                <strong style={{ fontSize: 14 }}>Campaign leads</strong>
                <p className="faint" style={{ fontSize: 12, marginTop: 2 }}>{leads.length} leads attached to this campaign.</p>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table" style={{ minWidth: dualChannel ? 1300 : 980, tableLayout: "fixed" }}>
                <colgroup>
                  {leadColumns.map(column => <col key={column.header} style={{ width: column.width }} />)}
                </colgroup>
                <thead>
                  <tr>{leadColumns.map(column => <th key={column.header}>{column.header}</th>)}</tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr><td colSpan={leadColumns.length} className="table-empty">No leads are attached to this campaign.</td></tr>
                  ) : leads.map(lead => (
                    <CampaignLeadRow key={lead.id} lead={lead} attempt={nextAttemptByLead.get(lead.id)} displayTimezone={displayTimezone} showEmail={emailEnabled} showPhone={voiceEnabled} isAiVoice={isAiVoice} actionKey={actionKey} onEmailNow={sendLeadNow} onCallNow={callLeadNow} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
