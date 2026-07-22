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

function LeadRow({ lead }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const isHot = score >= 80 || lead.status === "engaged";
  const signal = isHot ? "High intent" : lead.source || "manual";
  const stage = STAGES.find(item => item.id === lead.status) || STAGES[0];

  return (
    <div className="pipeline-lead-row">
      <div className="pipeline-lead-person row">
        <Avatar name={name} size={38} />
        <div className="col pipeline-lead-copy">
          <span className="pipeline-lead-name ellip">{name}</span>
          <span className="pipeline-lead-company ellip">{lead.title ? `${lead.title} · ` : ""}{lead.company || "No company"}</span>
        </div>
      </div>
      <span className="pipeline-stage-badge"><span className="stage-dot" style={{ background: stage.tint }} />{stage.label}</span>
      <div className="pipeline-intent-cell">
        <div className="row" style={{ gap: 8 }}>
          <div className="score-bar"><span style={{ width: `${Math.min(100, score)}%` }} /></div>
          <strong>{score}</strong>
        </div>
        <span className={isHot ? "pipeline-intent-hot" : "pipeline-intent-label"}>
          {isHot ? <Icon name="flame" size={12} /> : <Icon name="bolt" size={12} />} {signal}
        </span>
      </div>
      <span className="pipeline-source">{lead.source || "Manual"}</span>
      <div className="pipeline-row-actions">
        <button className="mini-action" type="button"><Icon name="mail" size={14} /> Email</button>
        <button className="mini-action" type="button"><Icon name="calendar" size={14} /> Book</button>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hotOnly, setHotOnly] = useState(false);
  const [selectedStage, setSelectedStage] = useState("all");

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
        <div className="pipeline-stage-tabs" role="tablist" aria-label="Filter pipeline stages">
          <button className={selectedStage === "all" ? "is-active" : ""} type="button" onClick={() => setSelectedStage("all")}>
            All stages <span>{visibleLeads.length}</span>
          </button>
          {STAGES.map(stage => (
            <button key={stage.id} className={selectedStage === stage.id ? "is-active" : ""} type="button" onClick={() => setSelectedStage(stage.id)}>
              <span className="stage-dot" style={{ background: stage.tint }} />
              {stage.label} <span>{grouped[stage.id]?.length ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="empty-state">
          <Icon name="funnel" size={42} color="var(--faint)" />
          <p className="muted">Your pipeline is empty</p>
          <span className="faint">Add leads from Prospects to start building the board.</span>
        </div>
      ) : (
        <section className="card pipeline-list-card">
          <div className="pipeline-list-head row spread">
            <div>
              <span className="eyebrow">Lead list</span>
              <h2 className="display">Your active conversations</h2>
            </div>
            <span className="chip subtle-chip">{visibleLeads.length} shown</span>
          </div>
          {visibleLeads.length === 0 ? (
            <div className="pipeline-list-empty">
              <Icon name="search" size={22} color="var(--faint)" />
              <strong>No leads match these filters.</strong>
              <span>Try another search or view all stages.</span>
            </div>
          ) : (
            <>
              <div className="pipeline-list-labels">
                <span>Lead</span><span>Stage</span><span>Intent</span><span>Source</span><span>Actions</span>
              </div>
              <div className="pipeline-list-rows">
                {visibleLeads.map(lead => <LeadRow key={lead.id} lead={lead} />)}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
