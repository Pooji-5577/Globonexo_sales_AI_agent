"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import { isValidEmail } from "../../../../lib/validation";

const STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  draft: "Draft",
  completed: "Completed",
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

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function leadName(lead) {
  return lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed lead";
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

function CampaignLeadRow({ lead, sendingId, onSendNow }) {
  const status = lead.status || "new";
  const hasEmail = isValidEmail(lead.email || "");
  const canSendNow = hasEmail && lead.campaignId && status !== "contacted" && !STOPPED_STATUSES.has(status);
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
      <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.email || "Not revealed"}</span></td>
      <td><span className="badge" style={leadStatusStyle(status)}>{LEAD_STATUS_LABELS[status] || status}</span></td>
      <td>
        <div className="row" style={{ justifyContent: "flex-start", gap: 8 }}>
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
        </div>
      </td>
      <td><span className="faint" style={{ fontSize: 13 }}>{lead.location || "-"}</span></td>
    </tr>
  );
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params?.id;
  const autoSendStartedRef = useRef(false);
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDetail = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError("");
    try {
      const [{ data: campaignData }, { data: leadsData }] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get("/leads", { params: { perPage: 500 } }),
      ]);
      setCampaign(campaignData);
      setLeads((Array.isArray(leadsData?.items) ? leadsData.items : []).filter(lead => lead.campaignId === campaignId));
    } catch (err) {
      setError(err?.response?.data?.error || "Campaign could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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

  const reconnectGmailForLead = useCallback(async id => {
    const { data } = await api.get("/gmail/auth-url", {
      params: {
        returnTo: `/campaigns/${campaignId}`,
        sendLeadId: id,
      },
    });
    if (!data?.url) throw new Error("Gmail connection URL was not returned.");
    window.location.assign(data.url);
  }, [campaignId]);

  const sendLeadNow = useCallback(async id => {
    setSendingId(id);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post(`/leads/${id}/send-now`);
      if (data?.lead) {
        setLeads(current => current.map(lead => lead.id === id ? data.lead : lead));
      }
      setNotice("Email sent to this lead.");
      const { data: refreshedCampaign } = await api.get(`/campaigns/${campaignId}`);
      setCampaign(refreshedCampaign);
    } catch (err) {
      const message = err?.response?.data?.error || "Could not send this email now.";
      if (message.toLowerCase().includes("gmail connection is not authorized")) {
        setNotice("Reconnect Gmail to finish sending this email.");
        try {
          await reconnectGmailForLead(id);
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
  }, [campaignId, reconnectGmailForLead]);

  useEffect(() => {
    const sendLeadId = searchParams.get("sendLeadId");
    if (!sendLeadId || searchParams.get("gmail") !== "connected" || autoSendStartedRef.current) return;
    autoSendStartedRef.current = true;
    sendLeadNow(sendLeadId);
  }, [searchParams, sendLeadNow]);

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread page-toolbar">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <button className="btn btn-ghost btn-sm" type="button" style={{ width: 40, padding: 0 }} onClick={() => router.push("/campaigns")} aria-label="Back to campaigns">
            <Icon name="arrowLeft" size={16} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 className="display page-title ellip">{campaign?.name || "Campaign"}</h1>
            <p className="muted page-subtitle">
              {campaign ? `${campaign.channel === "voice" ? "Voice" : "Email"} - ${STATUS_LABELS[campaign.status] || campaign.status} - Created ${formatDate(campaign.createdAt)}` : "Loading campaign..."}
            </p>
          </div>
        </div>
      </div>

      {(error || notice) ? <div className={error ? "notice-warn" : "notice-good"}>{error || notice}</div> : null}

      <div className="scroll grow app-page">
        {loading ? (
          <div className="card" style={{ padding: 20, borderRadius: 8 }}>Loading campaign...</div>
        ) : !campaign ? (
          <div className="card" style={{ padding: 20, borderRadius: 8 }}>Campaign not found.</div>
        ) : (
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

            <div className="card table-shell">
              <div className="filter-bar">
                <div>
                  <strong style={{ fontSize: 14 }}>Campaign leads</strong>
                  <p className="faint" style={{ fontSize: 12, marginTop: 2 }}>{leads.length} leads attached to this campaign.</p>
                </div>
              </div>
              <div className="table-scroll">
                <table className="data-table" style={{ minWidth: 980, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "36%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>{["Lead", "Email", "Status", "Send", "Location"].map(header => <th key={header}>{header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr><td colSpan={5} className="table-empty">No leads are attached to this campaign.</td></tr>
                    ) : leads.map(lead => (
                      <CampaignLeadRow key={lead.id} lead={lead} sendingId={sendingId} onSendNow={sendLeadNow} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
