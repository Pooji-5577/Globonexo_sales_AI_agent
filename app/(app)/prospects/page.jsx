"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";
import { cleanText, isValidEmail, normalizeUrl } from "../../../lib/validation";

const COMPANY_SIZE_OPTIONS = ["1,10", "11,50", "51,200", "201,500", "501,1000", "1001,5000", "5001,10000", "10001,"];
const STAGE_OPTIONS = ["all", "new", "queued", "contacted", "engaged", "meeting_booked", "not_interested", "unsubscribed"];
const SOURCE_OPTIONS = ["all", "apollo", "csv", "manual"];
const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest" },
  { value: "created_asc", label: "Oldest" },
  { value: "score_desc", label: "Score high-low" },
  { value: "score_asc", label: "Score low-high" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "company_asc", label: "Company A-Z" },
];
const STAGE_LABELS = {
  all: "All",
  new: "New",
  queued: "Queued",
  contacted: "Contacted",
  engaged: "Engaged",
  meeting_booked: "Meeting set",
  not_interested: "Not interested",
  unsubscribed: "Unsubscribed",
};
const STOPPED_STATUSES = new Set(["engaged", "meeting_booked", "not_interested", "unsubscribed"]);
const STAGE_COLORS = {
  new: "#9aa8a0",
  queued: "#7c8bf0",
  contacted: "#15c4c0",
  engaged: "#00a86a",
  meeting_booked: "#00c27a",
  not_interested: "#f59e0b",
  unsubscribed: "#ef4444",
};
const DEFAULT_MANUAL_LEAD = {
  firstName: "",
  lastName: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
};

function splitList(value) {
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getValue(row, headerMap, candidates) {
  const key = candidates.map(normalizeHeader).find(candidate => headerMap[candidate] !== undefined);
  return key ? row[headerMap[key]] || "" : "";
}

function safeExternalUrl(value) {
  try {
    return normalizeUrl(value);
  } catch {
    return "";
  }
}

function csvToLeads(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeHeader(header), index]));

  return rows.slice(1).map(row => {
    const email = cleanText(getValue(row, headerMap, ["email", "work email"]), { max: 254 }).toLowerCase();
    return {
      firstName: cleanText(getValue(row, headerMap, ["first name", "firstname", "first"]), { max: 80 }),
      lastName: cleanText(getValue(row, headerMap, ["last name", "lastname", "last"]), { max: 80 }),
      name: cleanText(getValue(row, headerMap, ["name", "full name", "fullname"]), { max: 160 }),
      title: cleanText(getValue(row, headerMap, ["title", "job title", "role"]), { max: 160 }),
      company: cleanText(getValue(row, headerMap, ["company", "organization", "account"]), { max: 160 }),
      email: isValidEmail(email) ? email : "",
      phone: cleanText(getValue(row, headerMap, ["phone", "mobile", "phone number"]), { max: 40 }),
      location: cleanText(getValue(row, headerMap, ["location", "city", "geo"]), { max: 160 }),
      linkedinUrl: safeExternalUrl(getValue(row, headerMap, ["linkedin", "linkedin url", "linkedinurl"])),
      rawData: Object.fromEntries(headers.map((header, index) => [
        cleanText(header, { max: 120 }),
        cleanText(row[index] || "", { max: 500, multiline: true }),
      ])),
    };
  }).filter(lead => lead.name || lead.firstName || lead.lastName || lead.email || lead.company);
}

function leadName(lead) {
  return lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed lead";
}

function stageStyle(status) {
  const color = STAGE_COLORS[status] || "#9aa8a0";
  return { background: `${color}1f`, color, border: `1px solid ${color}45` };
}

function LeadRow({ lead, onDelete, onEnrich, onSendNow, enriching, sending }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const status = lead.status || "new";
  const source = lead.source || "manual";
  const safeEmail = isValidEmail(lead.email) ? lead.email : "";
  const hasEmail = Boolean(safeEmail);
  const safeLinkedIn = safeExternalUrl(lead.linkedinUrl);
  const sendReady = hasEmail && !STOPPED_STATUSES.has(status);
  const canSendNow = sendReady && Boolean(lead.campaignId) && status !== "contacted";
  const canRevealEmail = !hasEmail && source === "apollo";

  return (
    <tr className="data-row">
      <td>
        <div className="row" style={{ gap: 11, minWidth: 0 }}>
          <Avatar name={name} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }} className="ellip">{name}</span>
            <span className="faint ellip" style={{ fontSize: 12 }}>{lead.title || "No title"} · {lead.company || "No company"}</span>
          </div>
        </div>
      </td>
      <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.email || "Not revealed"}</span></td>
      <td><span className="badge" style={stageStyle(status)}>{STAGE_LABELS[status] || status}</span></td>
      <td>
        <span className={`chip ${sendReady ? "chip-ready" : "chip-blocked"}`}>
          {sendReady ? "Ready" : hasEmail ? "Stopped" : "Needs email"}
        </span>
      </td>
      <td>
        <div className="row" style={{ gap: 8, minWidth: 86 }}>
          <div className="score-bar"><span style={{ width: `${Math.min(100, score)}%` }} /></div>
          <strong style={{ fontSize: 13 }}>{score}</strong>
        </div>
      </td>
      <td><span className="faint" style={{ fontSize: 13 }}>{lead.location || "-"}</span></td>
      <td>
        <div className="row" style={{ gap: 6, justifyContent: "flex-end", minWidth: 168, flexWrap: "wrap" }}>
          {canRevealEmail ? (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              disabled={enriching}
              onClick={() => onEnrich(lead.id)}
              style={{ height: 32, padding: "0 10px", fontSize: 12 }}
            >
              {enriching ? "Revealing..." : "Reveal email"}
            </button>
          ) : null}
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            disabled={!canSendNow || sending}
            onClick={() => onSendNow(lead.id)}
            title={!hasEmail ? "Lead needs an email" : !lead.campaignId ? "Attach lead to an email campaign first" : status === "contacted" ? "Step 1 has already been sent" : STOPPED_STATUSES.has(status) ? "Sequence is stopped for this lead" : "Send campaign email now"}
            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
          >
            <Icon name="send" size={13} /> {sending ? "Sending..." : "Send now"}
          </button>
          {safeEmail ? <a className="icon-btn" href={`mailto:${safeEmail}`} title="Email lead"><Icon name="mail" size={14} /></a> : null}
          {safeLinkedIn ? <a className="icon-btn" href={safeLinkedIn} target="_blank" rel="noreferrer" title="Open LinkedIn"><Icon name="link" size={14} /></a> : null}
          <button className="icon-btn danger" type="button" onClick={() => onDelete(lead.id)} title="Delete lead"><Icon name="logout" size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function LeadMobileCard({ lead, onDelete, onEnrich, onSendNow, enriching, sending }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const status = lead.status || "new";
  const source = lead.source || "manual";
  const safeEmail = isValidEmail(lead.email) ? lead.email : "";
  const hasEmail = Boolean(safeEmail);
  const safeLinkedIn = safeExternalUrl(lead.linkedinUrl);
  const sendReady = hasEmail && !STOPPED_STATUSES.has(status);
  const canSendNow = sendReady && Boolean(lead.campaignId) && status !== "contacted";
  const canRevealEmail = !hasEmail && source === "apollo";

  return (
    <article className="prospect-mobile-card card">
      <div className="row" style={{ gap: 11, minWidth: 0 }}>
        <Avatar name={name} size={36} />
        <div className="col" style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }} className="ellip">{name}</span>
          <span className="faint ellip" style={{ fontSize: 12 }}>{lead.title || "No title"} · {lead.company || "No company"}</span>
        </div>
      </div>

      <div className="prospect-mobile-meta">
        <div>
          <span>Stage</span>
          <strong><span className="badge" style={stageStyle(status)}>{STAGE_LABELS[status] || status}</span></strong>
        </div>
        <div>
          <span>Send ready</span>
          <strong><span className={`chip ${sendReady ? "chip-ready" : "chip-blocked"}`}>{sendReady ? "Ready" : hasEmail ? "Stopped" : "Needs email"}</span></strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{lead.location || "-"}</strong>
        </div>
      </div>

      <div className="prospect-mobile-email">{lead.email || "Email not revealed"}</div>

      <div className="row prospect-mobile-actions">
        {canRevealEmail ? (
          <button className="btn btn-ghost btn-sm" type="button" disabled={enriching} onClick={() => onEnrich(lead.id)}>
            {enriching ? "Revealing..." : "Reveal email"}
          </button>
        ) : null}
        <button className="btn btn-ghost btn-sm" type="button" disabled={!canSendNow || sending} onClick={() => onSendNow(lead.id)}>
          <Icon name="send" size={14} /> {sending ? "Sending..." : "Send now"}
        </button>
        {safeEmail ? <a className="icon-btn" href={`mailto:${safeEmail}`} title="Email lead"><Icon name="mail" size={14} /></a> : null}
        {safeLinkedIn ? <a className="icon-btn" href={safeLinkedIn} target="_blank" rel="noreferrer" title="Open LinkedIn"><Icon name="link" size={14} /></a> : null}
        <button className="icon-btn danger" type="button" onClick={() => onDelete(lead.id)} title="Delete lead"><Icon name="logout" size={14} /></button>
      </div>
    </article>
  );
}

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

export default function ProspectsPage() {
  const [tab, setTab] = useState("table");
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [titles, setTitles] = useState("VP Sales, Head of Revenue");
  const [locations, setLocations] = useState("United States");
  const [companySizes, setCompanySizes] = useState(["51,200", "201,500"]);
  const [keywords, setKeywords] = useState("B2B SaaS");
  const [leads, setLeads] = useState([]);
  const [csvLeads, setCsvLeads] = useState([]);
  const [leadLoading, setLeadLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enrichingId, setEnrichingId] = useState("");
  const [sendingId, setSendingId] = useState("");
  const [bulkEnriching, setBulkEnriching] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [manualLead, setManualLead] = useState(DEFAULT_MANUAL_LEAD);
  const [manualLoading, setManualLoading] = useState(false);

  const refreshLeads = () => {
    setLeadLoading(true);
    api.get("/leads", { params: { perPage: 500 } })
      .then(({ data }) => setLeads(Array.isArray(data?.items) ? data.items : []))
      .catch(() => {
        setLeads([]);
        setError("Prospects could not be loaded.");
      })
      .finally(() => setLeadLoading(false));
  };

  useEffect(() => {
    api.get("/campaigns")
      .then(({ data }) => setCampaigns(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setCampaigns([]));
    refreshLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = leads.filter(lead => {
      const haystack = [leadName(lead), lead.company, lead.title, lead.email, lead.location].filter(Boolean).join(" ").toLowerCase();
      return (!needle || haystack.includes(needle))
        && (stageFilter === "all" || lead.status === stageFilter)
        && (sourceFilter === "all" || lead.source === sourceFilter);
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "score_desc") return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === "score_asc") return (a.score ?? 0) - (b.score ?? 0);
      if (sortBy === "name_asc") return leadName(a).localeCompare(leadName(b));
      if (sortBy === "company_asc") return (a.company || "").localeCompare(b.company || "");
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return sortBy === "created_asc" ? aTime - bTime : bTime - aTime;
    });
  }, [leads, search, stageFilter, sourceFilter, sortBy]);

  const metrics = useMemo(() => ({
    total: leads.length,
    hot: leads.filter(lead => (lead.score ?? 0) >= 80 || lead.status === "engaged").length,
    meetings: leads.filter(lead => lead.status === "meeting_booked").length,
    revealed: leads.filter(lead => Boolean(lead.email)).length,
  }), [leads]);

  const canSearch = useMemo(() => splitList(titles).length > 0 || splitList(locations).length > 0 || keywords.trim().length > 0, [titles, locations, keywords]);
  const revealableLeads = useMemo(
    () => filteredLeads.filter(lead => lead.source === "apollo" && !lead.email),
    [filteredLeads]
  );
  const toggleSize = size => setCompanySizes(current => current.includes(size) ? current.filter(item => item !== size) : [...current, size]);

  const runApolloSearch = async event => {
    event.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/leads/apollo-search", {
        campaignId: campaignId || undefined,
        titles: splitList(titles),
        locations: splitList(locations),
        companySizes,
        keywords,
        page: 1,
        perPage: 25,
      });
      setNotice(`${data?.inserted ?? 0} Apollo leads saved${data?.skipped ? `, ${data.skipped} already existed` : ""}.`);
      refreshLeads();
      setTab("table");
    } catch (err) {
      setError(err?.response?.data?.error || "Apollo search failed. Check APOLLO_API_KEY on the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCsv = async event => {
    const file = event.target.files?.[0];
    setError("");
    setNotice("");
    setCsvLeads([]);
    if (!file) return;
    const text = await file.text();
    const rows = csvToLeads(text).slice(0, 1000);
    setCsvLeads(rows);
    setNotice(`${rows.length} rows ready to import from ${file.name}.`);
  };

  const uploadCsv = async () => {
    if (csvLeads.length === 0) return;
    setUploading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/leads/csv-upload", { campaignId: campaignId || undefined, rows: csvLeads });
      const inserted = data?.inserted ?? 0;
      const skipped = data?.skipped ?? 0;
      if (skipped > 0) {
        const reasons = (data?.errors ?? [])
          .slice(0, 3)
          .map(e => `row ${e.row}: ${e.message}`)
          .join("; ");
        const more = (data?.errors?.length ?? 0) > 3 ? "; ..." : "";
        setError(`${inserted} CSV leads imported, ${skipped} row${skipped === 1 ? "" : "s"} skipped (${reasons}${more}).`);
      } else {
        setNotice(`${inserted} CSV leads imported.`);
      }
      setCsvLeads([]);
      refreshLeads();
      setTab("table");
    } catch (err) {
      setError(err?.response?.data?.error || "CSV upload failed. Check required fields and try again.");
    } finally {
      setUploading(false);
    }
  };

  const setManualLeadField = (key, value) => {
    setManualLead(current => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  };

  const createManualLead = async event => {
    event.preventDefault();
    if (manualLoading) return;

    const firstName = cleanText(manualLead.firstName, { max: 120 });
    const lastName = cleanText(manualLead.lastName, { max: 120 });
    const title = cleanText(manualLead.title, { max: 160 });
    const company = cleanText(manualLead.company, { max: 160 });
    const email = cleanText(manualLead.email, { max: 254 }).toLowerCase();
    const phone = cleanText(manualLead.phone, { max: 80 });
    const location = cleanText(manualLead.location, { max: 160 });
    const linkedinUrl = safeExternalUrl(manualLead.linkedinUrl);

    setError("");
    setNotice("");

    if (!firstName && !lastName && !email && !company) {
      setError("Add a name, email, or company before saving this prospect.");
      return;
    }
    if (email && !isValidEmail(email)) {
      setError("Enter a valid email address or leave it blank.");
      return;
    }
    if (manualLead.linkedinUrl.trim() && !linkedinUrl) {
      setError("Enter a valid LinkedIn URL or leave it blank.");
      return;
    }

    setManualLoading(true);
    try {
      const { data } = await api.post("/leads", {
        campaignId: campaignId || undefined,
        source: "manual",
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        title,
        company,
        email,
        phone,
        location,
        linkedinUrl,
      });

      setLeads(current => [data, ...current.filter(lead => lead.id !== data.id)]);
      setManualLead(DEFAULT_MANUAL_LEAD);
      setNotice(`${leadName(data)} added manually${campaignId ? " and attached to the selected campaign" : ""}.`);
      setTab("table");
    } catch (err) {
      setError(err?.response?.data?.error || "Manual prospect could not be added.");
    } finally {
      setManualLoading(false);
    }
  };

  const deleteLead = async id => {
    try {
      await api.delete(`/leads/${id}`);
      setLeads(current => current.filter(lead => lead.id !== id));
      setNotice("Lead deleted.");
    } catch {
      setError("Lead could not be deleted.");
    }
  };

  const enrichLead = async id => {
    setEnrichingId(id);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/leads/apollo-enrich", { leadId: id });
      setLeads(current => current.map(lead => lead.id === id ? data : lead));
      setNotice(data?.email ? "Email revealed for this lead." : "Apollo returned lead details, but no email was available on your plan.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not reveal this lead's email from Apollo.");
    } finally {
      setEnrichingId("");
    }
  };

  const sendLeadNow = async id => {
    setSendingId(id);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post(`/leads/${id}/send-now`);
      if (data?.lead) {
        setLeads(current => current.map(lead => lead.id === id ? data.lead : lead));
      } else {
        refreshLeads();
      }
      setNotice("Email sent to this lead.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not send this email now.");
    } finally {
      setSendingId("");
    }
  };

  const enrichVisibleLeads = async () => {
    if (revealableLeads.length === 0 || bulkEnriching) return;
    setBulkEnriching(true);
    setError("");
    setNotice("");

    let revealed = 0;
    let checked = 0;
    for (const lead of revealableLeads.slice(0, 25)) {
      try {
        const { data } = await api.post("/leads/apollo-enrich", { leadId: lead.id });
        checked += 1;
        if (data?.email) revealed += 1;
        setLeads(current => current.map(item => item.id === lead.id ? data : item));
      } catch {
        checked += 1;
      }
    }

    setNotice(`${revealed} emails revealed from ${checked} Apollo lead${checked === 1 ? "" : "s"} checked.`);
    setBulkEnriching(false);
  };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread page-toolbar">
        <div>
          <h1 className="display page-title">Prospects</h1>
          <p className="muted page-subtitle">Source, score, filter, and prepare leads for campaigns.</p>
        </div>
        <Segmented
          className="prospects-source-tabs"
          options={[
            { label: "Lead table", value: "table" },
            { label: "Manual add", value: "manual" },
            { label: "Apollo search", value: "apollo" },
            { label: "CSV upload", value: "csv" },
          ]}
          value={tab}
          onChange={value => {
            setTab(value);
            setError("");
            setNotice("");
          }}
        />
      </div>

      {(error || notice) ? <div className={error ? "notice-warn" : "notice-good"}>{error || notice}</div> : null}

      <div className="scroll grow app-page">
        {tab === "table" ? (
          <div className="col" style={{ gap: 16 }}>
            <div className="metric-grid">
              <StatCard label="total prospects" value={metrics.total} icon="users" />
              <StatCard label="hot leads" value={metrics.hot} icon="flame" tone="warn" />
              <StatCard label="meetings set" value={metrics.meetings} icon="calendar" />
              <StatCard label="emails revealed" value={metrics.revealed} icon="mail" />
            </div>

            <div className="card table-shell prospects-table-shell">
              <div className="filter-bar">
                <div className="input-wrap filter-search">
                  <span className="lead-ico"><Icon name="search" size={16} /></span>
                  <input className="input has-ico" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, company, role, email..." />
                </div>
                <select className="input compact-select" value={stageFilter} onChange={event => setStageFilter(event.target.value)}>
                  {STAGE_OPTIONS.map(status => <option key={status} value={status}>{STAGE_LABELS[status]}</option>)}
                </select>
                <select className="input compact-select" value={sourceFilter} onChange={event => setSourceFilter(event.target.value)}>
                  {SOURCE_OPTIONS.map(source => <option key={source} value={source}>{source === "all" ? "All sources" : source}</option>)}
                </select>
                <select className="input compact-select" value={sortBy} onChange={event => setSortBy(event.target.value)}>
                  {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" type="button" disabled={revealableLeads.length === 0 || bulkEnriching} onClick={enrichVisibleLeads}>
                  <Icon name="mail" size={15} /> {bulkEnriching ? "Revealing..." : `Reveal emails (${revealableLeads.length})`}
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setTab("manual")}>
                  <Icon name="plus" size={15} color="#06231a" /> Add manually
                </button>
              </div>

              <div className="table-scroll">
                <table className="data-table prospects-table">
                  <colgroup>
                    <col className="prospect-col" />
                    <col className="email-col" />
                    <col className="stage-col" />
                    <col className="ready-col" />
                    <col className="score-col" />
                    <col className="location-col" />
                    <col className="actions-col" />
                  </colgroup>
                  <thead>
                    <tr>
                      {["Prospect", "Email", "Stage", "Send ready", "Score", "Location", ""].map(header => <th key={header}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {leadLoading ? (
                      <tr><td colSpan={7} className="table-empty">Loading prospects...</td></tr>
                    ) : filteredLeads.length === 0 ? (
                      <tr><td colSpan={7} className="table-empty">No prospects match the current filters.</td></tr>
                    ) : filteredLeads.map(lead => (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        onDelete={deleteLead}
                        onEnrich={enrichLead}
                        onSendNow={sendLeadNow}
                        enriching={enrichingId === lead.id}
                        sending={sendingId === lead.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="prospects-mobile-list">
                {leadLoading ? (
                  <div className="soft-empty">Loading prospects...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="soft-empty">No prospects match the current filters.</div>
                ) : filteredLeads.map(lead => (
                  <LeadMobileCard
                    key={lead.id}
                    lead={lead}
                    onDelete={deleteLead}
                    onEnrich={enrichLead}
                    onSendNow={sendLeadNow}
                    enriching={enrichingId === lead.id}
                    sending={sendingId === lead.id}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : tab === "manual" ? (
          <form className="card source-panel" onSubmit={createManualLead}>
            <div className="source-panel-head">
              <span><Icon name="user" size={18} /></span>
              <div>
                <h2>Add prospect manually</h2>
                <p className="faint">Create one prospect directly in your lead table.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field"><span>First name</span><input className="input" value={manualLead.firstName} onChange={event => setManualLeadField("firstName", event.target.value)} placeholder="Priya" maxLength={120} /></label>
              <label className="field"><span>Last name</span><input className="input" value={manualLead.lastName} onChange={event => setManualLeadField("lastName", event.target.value)} placeholder="Shah" maxLength={120} /></label>
              <label className="field"><span>Email</span><input className="input" value={manualLead.email} onChange={event => setManualLeadField("email", event.target.value)} placeholder="priya@company.com" maxLength={254} /></label>
              <label className="field"><span>Phone</span><input className="input" value={manualLead.phone} onChange={event => setManualLeadField("phone", event.target.value)} placeholder="+1 555 0100" maxLength={80} /></label>
              <label className="field"><span>Company</span><input className="input" value={manualLead.company} onChange={event => setManualLeadField("company", event.target.value)} placeholder="Acme Inc." maxLength={160} /></label>
              <label className="field"><span>Title</span><input className="input" value={manualLead.title} onChange={event => setManualLeadField("title", event.target.value)} placeholder="VP Sales" maxLength={160} /></label>
              <label className="field"><span>Location</span><input className="input" value={manualLead.location} onChange={event => setManualLeadField("location", event.target.value)} placeholder="New York, NY" maxLength={160} /></label>
              <label className="field"><span>LinkedIn URL</span><input className="input" value={manualLead.linkedinUrl} onChange={event => setManualLeadField("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/..." maxLength={500} /></label>
              <label className="field">
                <span>Attach to campaign</span>
                <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                  <option value="">No campaign yet</option>
                  {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                </select>
              </label>
            </div>
            <div className="row spread source-actions">
              <span className="faint">Name, email, or company is required. Email and phone can be added later.</span>
              <button className="btn btn-primary btn-sm" type="submit" disabled={manualLoading}>
                <Icon name="plus" size={15} color="#06231a" /> {manualLoading ? "Adding..." : "Add prospect"}
              </button>
            </div>
          </form>
        ) : tab === "apollo" ? (
          <form className="card source-panel" onSubmit={runApolloSearch}>
            <div className="source-panel-head">
              <span><Icon name="search" size={18} /></span>
              <div>
                <h2>Apollo search</h2>
                <p className="faint">Search saves real Apollo leads to `/api/leads/apollo-search`.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field"><span>Job titles</span><input className="input" value={titles} onChange={event => setTitles(event.target.value)} /></label>
              <label className="field"><span>Locations</span><input className="input" value={locations} onChange={event => setLocations(event.target.value)} /></label>
              <label className="field"><span>Keywords</span><input className="input" value={keywords} onChange={event => setKeywords(event.target.value)} /></label>
              <label className="field">
                <span>Attach to campaign</span>
                <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                  <option value="">No campaign yet</option>
                  {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                </select>
              </label>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <span>Company size</span>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {COMPANY_SIZE_OPTIONS.map(size => (
                  <button key={size} type="button" className="btn btn-ghost btn-sm" onClick={() => toggleSize(size)} style={{ height: 32, padding: "0 11px", fontSize: 12, background: companySizes.includes(size) ? "var(--g-50)" : "#fff", borderColor: companySizes.includes(size) ? "var(--g-300)" : "var(--line)" }}>
                    {size.replace(",", "-")} employees
                  </button>
                ))}
              </div>
            </div>
            <div className="row spread source-actions">
              <span className="faint">Email visibility depends on your Apollo plan.</span>
              <button className="btn btn-primary btn-sm" type="submit" disabled={!canSearch || loading}>
                <Icon name="search" size={15} color="#06231a" /> {loading ? "Searching..." : "Search Apollo"}
              </button>
            </div>
          </form>
        ) : (
          <div className="col" style={{ gap: 16 }}>
            <section className="card source-panel">
              <div className="source-panel-head">
                <span><Icon name="doc" size={18} /></span>
                <div>
                  <h2>CSV upload</h2>
                  <p className="faint">Use columns like name, title, company, email, location, and linkedin_url.</p>
                </div>
              </div>
              <div className="form-grid two">
                <label className="field"><span>CSV file</span><input className="input" type="file" accept=".csv,text/csv" onChange={handleCsv} style={{ paddingTop: 12 }} /></label>
                <label className="field">
                  <span>Attach to campaign</span>
                  <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                    <option value="">No campaign yet</option>
                    {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="row spread source-actions">
                <span className="faint">{csvLeads.length} parsed rows. Maximum 1000 rows per upload.</span>
                <button className="btn btn-primary btn-sm" type="button" disabled={csvLeads.length === 0 || uploading} onClick={uploadCsv}>
                  <Icon name="plus" size={15} color="#06231a" /> {uploading ? "Importing..." : "Import leads"}
                </button>
              </div>
            </section>
            <div className="card table-shell">
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr>{["Lead", "Email", "Company", "Location"].map(header => <th key={header}>{header}</th>)}</tr></thead>
                  <tbody>
                    {csvLeads.length === 0 ? (
                      <tr><td colSpan={4} className="table-empty">Choose a CSV file to preview rows.</td></tr>
                    ) : csvLeads.slice(0, 50).map((lead, index) => (
                      <tr className="data-row" key={index}>
                        <td>{leadName(lead)}</td>
                        <td>{lead.email || "Not revealed"}</td>
                        <td>{lead.company || "-"}</td>
                        <td>{lead.location || "-"}</td>
                      </tr>
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
