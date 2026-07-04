"use client";

import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

const STAGES = [
  { id: "new", label: "New leads", tint: "#9aa8a0" },
  { id: "queued", label: "Queued", tint: "#7c8bf0" },
  { id: "contacted", label: "Contacted", tint: "#15c4c0" },
  { id: "engaged", label: "Engaged", tint: "#00a86a" },
  { id: "meeting_booked", label: "Meeting set", tint: "#00c27a" },
  { id: "not_interested", label: "Not interested", tint: "#f59e0b" },
];

function leadName(lead) {
  return lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown";
}

function LeadCard({ lead }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const isHot = score >= 80 || lead.status === "engaged";
  const signal = isHot ? "High intent" : lead.source || "manual";

  return (
    <div className="pipeline-card">
      <div className="row spread" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 9, minWidth: 0 }}>
          <Avatar name={name} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="ellip">{name}</span>
            <span className="faint ellip" style={{ fontSize: 11.5 }}>{lead.title ? `${lead.title} · ` : ""}{lead.company || "No company"}</span>
          </div>
        </div>
        {isHot ? <Icon name="flame" size={16} color="#ef6f4e" /> : null}
      </div>
      <div className="row spread" style={{ marginTop: 12 }}>
        <span className="chip subtle-chip"><Icon name="bolt" size={11} color="var(--g-600)" /> {signal}</span>
        {lead.email ? <span className="faint" style={{ fontSize: 11.5, fontWeight: 800 }}>email</span> : null}
      </div>
      <div className="row" style={{ gap: 7, marginTop: 11 }}>
        <div className="score-bar"><span style={{ width: `${Math.min(100, score)}%` }} /></div>
        <span className="faint" style={{ fontSize: 11, fontWeight: 800 }}>{score}</span>
      </div>
      <div className="row spread" style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line-2)" }}>
        <button className="mini-action" type="button"><Icon name="mail" size={13} /> Email</button>
        <button className="mini-action" type="button"><Icon name="calendar" size={13} /> Book</button>
      </div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="pipeline-empty">
      <Icon name="funnel" size={22} color="var(--faint)" />
      <span>No leads here</span>
    </div>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hotOnly, setHotOnly] = useState(false);

  useEffect(() => {
    api.get("/leads", { params: { perPage: 500 } })
      .then(res => setLeads(res.data.items || []))
      .catch(() => setError("Pipeline could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const visibleLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter(lead => {
      const haystack = [leadName(lead), lead.company, lead.title, lead.email].filter(Boolean).join(" ").toLowerCase();
      const hot = (lead.score ?? 0) >= 80 || lead.status === "engaged";
      return (!needle || haystack.includes(needle)) && (!hotOnly || hot);
    });
  }, [leads, query, hotOnly]);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map(stage => [stage.id, []]));
    for (const lead of visibleLeads) {
      const stage = map[lead.status] ? lead.status : "new";
      map[stage].push(lead);
    }
    for (const stage of STAGES) {
      map[stage.id].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return map;
  }, [visibleLeads]);

  const metrics = useMemo(() => ({
    total: visibleLeads.length,
    hot: visibleLeads.filter(lead => (lead.score ?? 0) >= 80 || lead.status === "engaged").length,
    meetings: visibleLeads.filter(lead => lead.status === "meeting_booked").length,
    contacted: visibleLeads.filter(lead => ["contacted", "engaged", "meeting_booked"].includes(lead.status)).length,
  }), [visibleLeads]);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="scroll grow app-page">
      <div className="row spread page-head">
        <div>
          <h1 className="display page-title">Pipeline</h1>
          <p className="muted page-subtitle">{metrics.total} active leads · {metrics.hot} high-intent accounts</p>
        </div>
        <div className="row page-actions">
          <button className={hotOnly ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} type="button" onClick={() => setHotOnly(value => !value)}>
            <Icon name="flame" size={15} color={hotOnly ? "#06231a" : "currentColor"} /> Hot only
          </button>
          <a className="btn btn-dark btn-sm" href="/prospects">
            <Icon name="plus" size={15} color="#fff" /> Add leads
          </a>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card"><span className="metric-icon"><Icon name="users" size={16} /></span><div><strong>{metrics.total}</strong><span>visible leads</span></div></div>
        <div className="metric-card"><span className="metric-icon" data-tone="warn"><Icon name="flame" size={16} /></span><div><strong>{metrics.hot}</strong><span>hot leads</span></div></div>
        <div className="metric-card"><span className="metric-icon"><Icon name="chat" size={16} /></span><div><strong>{metrics.contacted}</strong><span>in conversation</span></div></div>
        <div className="metric-card"><span className="metric-icon"><Icon name="calendar" size={16} /></span><div><strong>{metrics.meetings}</strong><span>meetings set</span></div></div>
      </div>

      {error ? <div className="notice-warn">{error}</div> : null}

      <div className="card pipeline-filter-card">
        <div className="input-wrap">
          <span className="lead-ico"><Icon name="search" size={16} /></span>
          <input className="input has-ico" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search pipeline by lead, company, title, or email..." />
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="empty-state">
          <Icon name="funnel" size={42} color="var(--faint)" />
          <p className="muted">Your pipeline is empty</p>
          <span className="faint">Add leads from Prospects to start building the board.</span>
        </div>
      ) : (
        <div className="pipeline-board">
          {STAGES.map(stage => {
            const items = grouped[stage.id] || [];
            return (
              <section key={stage.id} className="pipeline-column">
                <div className="row spread pipeline-column-head">
                  <div className="row" style={{ gap: 8, minWidth: 0 }}>
                    <span className="stage-dot" style={{ background: stage.tint }} />
                    <strong className="ellip">{stage.label}</strong>
                  </div>
                  <span>{items.length}</span>
                </div>
                <div className="col" style={{ gap: 10 }}>
                  {items.length === 0 ? <EmptyColumn /> : items.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
