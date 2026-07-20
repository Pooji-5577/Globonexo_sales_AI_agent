"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";

const STATUS_STYLES = {
  active: { label: "Active", bg: "var(--g-50)", color: "var(--g-700)", dot: "var(--g-500)" },
  paused: { label: "Paused", bg: "#fff7ed", color: "#9a3412", dot: "#f97316" },
  draft: { label: "Draft", bg: "var(--bg-2)", color: "var(--muted)", dot: "var(--faint)" },
  completed: { label: "Completed", bg: "#eef2ff", color: "#4338ca", dot: "#6366f1" },
};

const CHANNEL_LABELS = {
  email: "Email",
  voice: "Voice",
};

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function CampaignSkeleton() {
  return (
    <div className="col" style={{ gap: 12 }}>
      {[0, 1, 2].map(item => (
        <div key={item} className="card" style={{ padding: 18 }}>
          <div className="row spread">
            <div className="row" style={{ gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background: "var(--bg-2)" }} />
              <div className="col" style={{ gap: 8 }}>
                <span style={{ width: 220, height: 14, borderRadius: 99, background: "var(--bg-2)" }} />
                <span style={{ width: 150, height: 10, borderRadius: 99, background: "var(--line-2)" }} />
              </div>
            </div>
            <span style={{ width: 104, height: 30, borderRadius: 99, background: "var(--bg-2)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, enrolled: 0, sent: 0, meetings: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/campaigns");
      setCampaigns(Array.isArray(data?.items) ? data.items : []);
      setSummary(data?.summary ?? { total: 0, active: 0, enrolled: 0, sent: 0, meetings: 0 });
    } catch (err) {
      setError(err?.response?.data?.error || "Campaigns could not be loaded. Check the API server and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return campaigns.filter(campaign => {
      const statusMatch = statusFilter === "all" || campaign.status === statusFilter;
      const textMatch =
        !needle ||
        campaign.name?.toLowerCase().includes(needle) ||
        campaign.icpSource?.toLowerCase().includes(needle) ||
        CHANNEL_LABELS[campaign.channel]?.toLowerCase().includes(needle);
      return statusMatch && textMatch;
    });
  }, [campaigns, search, statusFilter]);

  const setCampaignInList = updated => {
    setCampaigns(current => current.map(campaign => (campaign.id === updated.id ? updated : campaign)));
  };

  const runAction = async (campaign, action) => {
    setBusyId(campaign.id + action);
    setError("");
    try {
      const { data } = await api.post(`/campaigns/${campaign.id}/${action}`);
      setCampaignInList(data);
      await loadCampaigns();
    } catch (err) {
      const details = err?.response?.data?.details;
      const detailText = details && typeof details === "object"
        ? ` Ready: ${details.ready ?? 0}, missing email: ${details.missingEmail ?? 0}, stopped: ${details.stopped ?? 0}.`
        : "";
      setError(`${err?.response?.data?.error || "Campaign action failed. Please try again."}${detailText}`);
    } finally {
      setBusyId("");
    }
  };

  const deleteCampaign = async campaign => {
    const ok = window.confirm(`Delete "${campaign.name}"? This cannot be undone.`);
    if (!ok) return;

    setBusyId(campaign.id + "delete");
    setError("");
    try {
      await api.delete(`/campaigns/${campaign.id}`);
      await loadCampaigns();
    } catch (err) {
      setError(err?.response?.data?.error || "Campaign could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  const metrics = [
    { k: "Campaigns", v: summary.total },
    { k: "Active", v: summary.active },
    { k: "Enrolled leads", v: summary.enrolled },
    { k: "Messages sent", v: summary.sent },
  ];

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff", gap: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Campaigns</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {summary.total} total - {summary.active} active - {summary.sent} messages sent
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => router.push("/campaigns/new")}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff" }}>
        {metrics.map(metric => (
          <div key={metric.k} className="card" style={{ padding: "12px 16px", borderRadius: 8 }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 800 }}>{metric.k}</div>
            <div className="display" style={{ fontSize: 26, marginTop: 5 }}>{metric.v}</div>
          </div>
        ))}
      </div>

      <div className="row spread" style={{ gap: 12, padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "#fff", flex: "none" }}>
        <div className="input-wrap" style={{ width: 320, maxWidth: "100%" }}>
          <span className="lead-ico"><Icon name="search" size={16} /></span>
          <input
            className="input has-ico"
            style={{ height: 40, fontSize: 14, background: "var(--bg)" }}
            placeholder="Search campaigns or ICP source..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {["all", "draft", "active", "paused", "completed"].map(status => (
            <button
              key={status}
              className="btn btn-ghost btn-sm"
              onClick={() => setStatusFilter(status)}
              style={{
                height: 34,
                padding: "0 12px",
                fontSize: 12.5,
                background: statusFilter === status ? "var(--g-50)" : "#fff",
                borderColor: statusFilter === status ? "var(--g-300)" : "var(--line)",
              }}
            >
              {status === "all" ? "All" : STATUS_STYLES[status].label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 24px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div className="scroll grow" style={{ padding: "16px 24px", minHeight: 0 }}>
        {loading ? (
          <CampaignSkeleton />
        ) : filteredCampaigns.length === 0 ? (
          <div className="card col center" style={{ minHeight: 320, padding: 28, textAlign: "center", borderRadius: 8 }}>
            <span style={{ width: 54, height: 54, borderRadius: 14, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
              <Icon name="send" size={25} />
            </span>
            <h2 className="display" style={{ fontSize: 22, marginTop: 16 }}>No campaigns found</h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 420, lineHeight: 1.5 }}>
              Create a campaign shell with a channel, name, ICP source, send cap, and working hours.
            </p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 18 }} onClick={() => router.push("/campaigns/new")}>
              <Icon name="plus" size={15} color="#06231a" /> New campaign
            </button>
          </div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {filteredCampaigns.map(campaign => {
              const statusStyle = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft;
              const primaryAction = campaign.status === "active" ? "pause" : "launch";
              const hasReadyLeads = (campaign.stats?.ready ?? 0) > 0;
              const launchBlocked = primaryAction === "launch" && campaign.channel === "email" && !hasReadyLeads;
              const primaryLabel = campaign.status === "active" ? "Pause" : launchBlocked ? "Needs email" : "Launch";
              const actionBusy = busyId === campaign.id + primaryAction;
              return (
                <div
                  key={campaign.id}
                  className="card"
                  style={{ padding: 18, borderRadius: 8, cursor: "pointer" }}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div className="row spread" style={{ gap: 16, alignItems: "flex-start" }}>
                    <div className="row" style={{ gap: 12, minWidth: 0 }}>
                      <span style={{ width: 42, height: 42, borderRadius: 12, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", flex: "none" }}>
                        <Icon name={campaign.channel === "voice" ? "phone" : "send"} size={20} color="var(--g-600)" />
                      </span>
                      <div className="col" style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }} className="ellip">{campaign.name}</span>
                        <span className="faint" style={{ fontSize: 12.5, marginTop: 3 }}>
                          {CHANNEL_LABELS[campaign.channel]} - Created {formatDate(campaign.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color, height: 26 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: statusStyle.dot, flex: "none" }} />
                        {statusStyle.label}
                      </span>
                      {campaign.status !== "completed" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={actionBusy || launchBlocked}
                          title={launchBlocked ? "Reveal or upload lead emails before launching." : undefined}
                          style={{ height: 32 }}
                          onClick={e => { e.stopPropagation(); runAction(campaign, primaryAction); }}
                        >
                          <Icon name={primaryAction === "pause" ? "pause" : "play"} size={14} />
                          {actionBusy ? "Working..." : primaryLabel}
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" disabled={busyId === campaign.id + "delete"} style={{ height: 32 }} onClick={e => { e.stopPropagation(); deleteCampaign(campaign); }}>Delete</button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(5,minmax(0,1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line-2)" }}>
                    <div className="col" style={{ minWidth: 0 }}>
                      <span className="faint" style={{ fontSize: 11.5, fontWeight: 800 }}>ICP source</span>
                      <span className="ellip" style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{campaign.icpSource || "Not set"}</span>
                    </div>
                    {[
                      ["Enrolled", campaign.stats?.enrolled ?? 0],
                      ["Ready", campaign.stats?.ready ?? 0],
                      ["Missing email", campaign.stats?.missingEmail ?? 0],
                      ["Queued", campaign.stats?.queued ?? 0],
                      ["Sent", campaign.stats?.sent ?? 0],
                    ].map(([key, value]) => (
                      <div key={key} className="col">
                        <span className="faint" style={{ fontSize: 11.5, fontWeight: 800 }}>{key}</span>
                        <span style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)", marginTop: 3 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
