"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";
import Spinner from "../../../components/ui/Spinner";
import { cleanText, isValidEmail, normalizeUrl } from "../../../lib/validation";
import {
  audienceDefaultsFromOnboarding,
  normalizeApolloLocations,
  uniqueApolloValues,
} from "../../../lib/apollo-targeting";

const COMPANY_SIZE_OPTIONS = ["1,10", "11,50", "51,200", "201,500", "501,1000", "1001,5000", "5001,10000", "10001,"];
const TITLE_OPTIONS = ["Founder", "Co-Founder", "Owner", "CEO", "Chief Revenue Officer", "Chief Sales Officer", "VP Sales", "VP Revenue", "Head of Sales", "Head of Revenue", "Sales Director", "Revenue Operations Director"];
const LOCATION_OPTIONS = ["United States", "United Kingdom", "Canada", "Australia", "India", "Germany", "France", "Netherlands", "Singapore", "United Arab Emirates"];
const SENIORITY_OPTIONS = [
  { value: "owner", label: "Owner" }, { value: "founder", label: "Founder" },
  { value: "c_suite", label: "C-Suite" }, { value: "partner", label: "Partner" },
  { value: "vp", label: "VP" }, { value: "head", label: "Head" },
  { value: "director", label: "Director" }, { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" }, { value: "entry", label: "Entry" },
  { value: "intern", label: "Intern" },
];
const TECHNOLOGY_OPTIONS = [
  { value: "salesforce", label: "Salesforce" }, { value: "hubspot", label: "HubSpot" },
  { value: "marketo", label: "Marketo" }, { value: "outreach", label: "Outreach" },
  { value: "salesloft", label: "Salesloft" }, { value: "intercom", label: "Intercom" },
  { value: "stripe", label: "Stripe" }, { value: "shopify", label: "Shopify" },
];
const INDUSTRY_OPTIONS = ["B2B SaaS", "IT Services", "Marketing Agencies", "Recruiting", "Fintech", "Healthcare", "Manufacturing", "Real Estate", "E-commerce", "Education"];
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

function MultiSelect({ label, options, value, onChange, placeholder, required = false }) {
  const selectedLabels = options.filter(option => value.includes(typeof option === "string" ? option : option.value))
    .map(option => typeof option === "string" ? option : option.label);
  return (
    <label className="field apollo-filter-field">
      <span>{label}{required ? " *" : ""}</span>
      <details className="apollo-multiselect">
        <summary>{selectedLabels.length ? `${selectedLabels.slice(0, 2).join(", ")}${selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : ""}` : placeholder}</summary>
        <div className="apollo-option-menu">
          {options.map(option => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return (
              <label key={optionValue} className="apollo-option">
                <input type="checkbox" checked={value.includes(optionValue)} onChange={() => onChange(value.includes(optionValue) ? value.filter(item => item !== optionValue) : [...value, optionValue])} />
                <span>{optionLabel}</span>
              </label>
            );
          })}
          {value.length ? <button type="button" className="apollo-clear" onClick={() => onChange([])}>Clear selection</button> : null}
        </div>
      </details>
    </label>
  );
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

function formatNextOutreach(attempt) {
  if (!attempt) return "Not scheduled";
  if (!attempt.scheduled_at) return attempt.blocked_reason ? `Blocked: ${attempt.blocked_reason.replace(/_/g, " ")}` : "Not scheduled";
  return new Intl.DateTimeFormat("en", { timeZone: attempt.display_timezone || undefined, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(attempt.scheduled_at));
}

function LeadRow({ lead, onDelete, onSendNow, sending }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const status = lead.status || "new";
  const source = lead.source || "manual";
  const safeEmail = isValidEmail(lead.email) ? lead.email : "";
  const hasEmail = Boolean(safeEmail);
  const safeLinkedIn = safeExternalUrl(lead.linkedinUrl);
  const sendReady = hasEmail && !STOPPED_STATUSES.has(status);
  const canSendNow = sendReady && Boolean(lead.campaignId) && status !== "contacted";
  const readyLabel = hasEmail ? "Email ready" : lead.phone ? "Voice ready" : "Not ready";

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
      <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.email || "Not requested"}</span></td>
      <td><span style={{ fontWeight: 700, fontSize: 13 }}>{lead.phone || "Not requested"}</span></td>
      <td><span className="badge" style={stageStyle(status)}>{STAGE_LABELS[status] || status}</span></td>
      <td>
        <span className={`chip ${sendReady ? "chip-ready" : "chip-blocked"}`}>
          {STOPPED_STATUSES.has(status) ? "Stopped" : readyLabel}
        </span>
      </td>
      <td>
        <div className="row" style={{ gap: 8, minWidth: 86 }}>
          <div className="score-bar"><span style={{ width: `${Math.min(100, score)}%` }} /></div>
          <strong style={{ fontSize: 13 }}>{score}</strong>
        </div>
      </td>
      <td><span style={{ fontSize: 12.5, fontWeight: 700 }}>{formatNextOutreach(lead.nextOutreach)}</span></td>
      <td>
        <div className="row" style={{ gap: 6, justifyContent: "flex-end", minWidth: 168, flexWrap: "wrap" }}>
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

function LeadMobileCard({ lead, onDelete, onSendNow, sending }) {
  const name = leadName(lead);
  const score = lead.score ?? 0;
  const status = lead.status || "new";
  const source = lead.source || "manual";
  const safeEmail = isValidEmail(lead.email) ? lead.email : "";
  const hasEmail = Boolean(safeEmail);
  const safeLinkedIn = safeExternalUrl(lead.linkedinUrl);
  const sendReady = hasEmail && !STOPPED_STATUSES.has(status);
  const canSendNow = sendReady && Boolean(lead.campaignId) && status !== "contacted";

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

      <div className="prospect-mobile-email">Email: {lead.email || "Not requested"} · Phone: {lead.phone || "Not requested"}</div>
      <div className="faint" style={{ fontSize: 12 }}>Next outreach: {formatNextOutreach(lead.nextOutreach)}</div>

      <div className="row prospect-mobile-actions">
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
  const [titles, setTitles] = useState(["VP Sales", "Head of Revenue"]);
  const [customTitles, setCustomTitles] = useState("");
  const [seniorities, setSeniorities] = useState(["vp", "head"]);
  const [locations, setLocations] = useState(["United States"]);
  const [customLocations, setCustomLocations] = useState("");
  const [organizationLocations, setOrganizationLocations] = useState([]);
  const [companySizes, setCompanySizes] = useState(["51,200", "201,500"]);
  const [industries, setIndustries] = useState([]);
  const [customIndustries, setCustomIndustries] = useState("");
  const [keywords, setKeywords] = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [domains, setDomains] = useState("");
  const [technologies, setTechnologies] = useState([]);
  const [hiringTitles, setHiringTitles] = useState("");
  const [includeSimilarTitles, setIncludeSimilarTitles] = useState(true);
  const [revenueMin, setRevenueMin] = useState("");
  const [revenueMax, setRevenueMax] = useState("");
  const [leadLimit, setLeadLimit] = useState(25);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
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
  const [importProgress, setImportProgress] = useState(null);
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);
  const [voiceLegalBasis, setVoiceLegalBasis] = useState("legitimate_interest");
  const selectedCampaign = campaigns.find(campaign => campaign.id === campaignId);
  const selectedVoiceCampaign = selectedCampaign?.channel === "voice";

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
    Promise.allSettled([api.get("/campaigns"), api.get("/onboarding")])
      .then(([campaignResult, onboardingResult]) => {
        if (campaignResult.status === "fulfilled") setCampaigns(Array.isArray(campaignResult.value.data?.items) ? campaignResult.value.data.items : []);
        else setCampaigns([]);
        if (onboardingResult.status === "fulfilled" && onboardingResult.value.data) {
          const defaults = audienceDefaultsFromOnboarding(onboardingResult.value.data);
          if (defaults.titles.length) setTitles(defaults.titles);
          if (defaults.locations.length) setLocations(defaults.locations);
          if (defaults.companySizes.length) setCompanySizes(defaults.companySizes);
          setIndustries(defaults.industries);
          setKeywordSuggestions(defaults.keywordSuggestions);
          setKeywords(defaults.keywords);
        }
      });
    refreshLeads();
    try {
      const saved = JSON.parse(window.localStorage.getItem("gnx-active-apollo-import") || "null");
      if (saved?.runId) {
        setImportProgress(saved);
        if (saved.campaignId) setCampaignId(saved.campaignId);
      }
    } catch {}
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

  const canSearch = useMemo(() => Boolean(campaignId)
    && (titles.length > 0 || customTitles.trim())
    && (locations.length > 0 || customLocations.trim())
    && companySizes.length > 0
    && (industries.length > 0 || customIndustries.trim()), [campaignId, titles, customTitles, locations, customLocations, companySizes, industries, customIndustries]);
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
      const { data } = await api.post("/apollo/import", {
        campaignId,
        titles: [...new Set([...titles, ...splitList(customTitles)])],
        includeSimilarTitles,
        seniorities,
        locations: normalizeApolloLocations([...locations, ...splitList(customLocations)]),
        organizationLocations,
        organizationDomains: splitList(domains),
        companySizes,
        industries: uniqueApolloValues([...industries, ...splitList(customIndustries)]),
        technologyUids: technologies,
        hiringJobTitles: splitList(hiringTitles),
        revenueMin: revenueMin === "" ? undefined : Number(revenueMin),
        revenueMax: revenueMax === "" ? undefined : Number(revenueMax),
        keywords,
        limit: leadLimit,
        candidateCap: Math.min(500, Math.max(50, leadLimit * 5)),
      });
      const activeImport = { runId: data.runId, campaignId, status: "queued", requested: leadLimit, qualified: 0 };
      setImportProgress(activeImport);
      window.localStorage.setItem("gnx-active-apollo-import", JSON.stringify(activeImport));
      setNotice(`Apollo import queued${data?.jobId ? ` as job ${data.jobId}` : ""}. Search, enrichment, and campaign checks will continue in the background.`);
    } catch (err) {
      setError(err?.response?.data?.error || "Apollo import could not be started. Check the filters and Apollo connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!importProgress?.runId || importProgress?.isTerminal) return;
    const timer = setInterval(async () => {
      try {
        const { data } = await api.get(`/apollo/import/${importProgress.runId}`);
        setImportProgress(data);
        if (data.isTerminal) {
          window.localStorage.removeItem("gnx-active-apollo-import");
          refreshLeads();
        } else {
          window.localStorage.setItem("gnx-active-apollo-import", JSON.stringify({ ...data, campaignId: data.campaignId || campaignId }));
        }
      } catch {}
    }, 2000);
    return () => clearInterval(timer);
  }, [importProgress?.runId, importProgress?.isTerminal]);

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
      if (selectedVoiceCampaign && !voiceConfirmed) {
        setError("Confirm DNC screening and lawful basis before importing voice leads.");
        return;
      }
      const { data } = await api.post("/leads/csv-upload", {
        campaignId: campaignId || undefined, rows: csvLeads,
        voiceCompliance: selectedVoiceCampaign ? {
          confirmed: true, legalBasis: voiceLegalBasis, dncCheckedAt: new Date().toISOString(),
          country: locations[0] || "Unknown",
        } : undefined,
      });
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
    if (selectedVoiceCampaign && (!phone || !voiceConfirmed)) {
      setError("Voice campaign leads require a direct/mobile phone and DNC/lawful-basis confirmation.");
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
        voiceCompliance: selectedVoiceCampaign ? {
          confirmed: true, legalBasis: voiceLegalBasis, dncCheckedAt: new Date().toISOString(),
          country: location || "Unknown",
        } : undefined,
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
          data-tour="prospects-sources"
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

            <div className="card table-shell prospects-table-shell" style={{ position: "relative" }}>
              {leadLoading && filteredLeads.length > 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.6)", display: "grid", placeItems: "center", zIndex: 1 }}>
                  <Spinner size={22} />
                </div>
              )}
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
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setTab("manual")}>
                  <Icon name="plus" size={15} color="#06231a" /> Add manually
                </button>
              </div>

              <div className="table-scroll" style={{ opacity: leadLoading ? 0.5 : 1, pointerEvents: leadLoading ? "none" : "auto", transition: "opacity .15s" }}>
                <table className="data-table prospects-table">
                  <colgroup>
                    <col className="prospect-col" />
                    <col className="email-col" />
                    <col className="email-col" />
                    <col className="stage-col" />
                    <col className="ready-col" />
                    <col className="score-col" />
                    <col className="location-col" />
                    <col className="actions-col" />
                  </colgroup>
                  <thead>
                    <tr>
                      {["Prospect", "Email", "Phone", "Stage", "Readiness", "Score", "Next outreach", ""].map(header => <th key={header}>{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {leadLoading && filteredLeads.length === 0 ? null : filteredLeads.length === 0 ? (
                      <tr><td colSpan={8} className="table-empty">No prospects match the current filters.</td></tr>
                    ) : filteredLeads.map(lead => (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        onDelete={deleteLead}
                        onSendNow={sendLeadNow}
                        sending={sendingId === lead.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="prospects-mobile-list" style={{ opacity: leadLoading ? 0.5 : 1, pointerEvents: leadLoading ? "none" : "auto", transition: "opacity .15s" }}>
                {leadLoading && filteredLeads.length === 0 ? (
                  <div className="soft-empty"><Spinner size={16} /></div>
                ) : filteredLeads.length === 0 ? (
                  <div className="soft-empty">No prospects match the current filters.</div>
                ) : filteredLeads.map(lead => (
                  <LeadMobileCard
                    key={lead.id}
                    lead={lead}
                    onDelete={deleteLead}
                    onSendNow={sendLeadNow}
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
              {selectedVoiceCampaign ? <div className="field" style={{ gridColumn: "1 / -1" }}>
                <span>Voice compliance *</span>
                <select className="input" value={voiceLegalBasis} onChange={event => setVoiceLegalBasis(event.target.value)}>
                  <option value="legitimate_interest">Legitimate interest</option>
                  <option value="consent">Consent</option>
                  <option value="existing_business_relationship">Existing business relationship</option>
                  <option value="other">Other lawful basis</option>
                </select>
                <label className="apollo-checkbox-row">
                  <input type="checkbox" checked={voiceConfirmed} onChange={event => setVoiceConfirmed(event.target.checked)} />
                  I confirm this direct/mobile number was checked against applicable DNC registries, has not opted out, and may lawfully be called.
                </label>
              </div> : null}
            </div>
            <div className="row spread source-actions">
              <span className="faint">Name, email, or company is required. Email and phone can be added later.</span>
              <button className="btn btn-primary btn-sm" type="submit" disabled={manualLoading}>
                <Icon name="plus" size={15} color="#06231a" /> {manualLoading ? "Adding..." : "Add prospect"}
              </button>
            </div>
          </form>
        ) : tab === "apollo" ? (
          <div className="col" style={{ gap: 16 }}>
          {importProgress ? <section className="card" style={{ padding: 18 }}>
            <div className="row spread"><strong>Preparing {campaigns.find(c => c.id === campaignId)?.channel || "campaign"} leads</strong><span className="chip">{importProgress.status}</span></div>
            <div className="row" style={{ gap: 18, marginTop: 12, flexWrap: "wrap" }}>
              <span>Requested <strong>{importProgress.requested ?? leadLimit}</strong></span>
              <span>Found <strong>{importProgress.candidatesFound ?? 0}</strong></span>
              <span>Qualified <strong>{importProgress.qualified ?? 0}</strong></span>
              <span>Pending <strong>{importProgress.pending ?? 0}</strong></span>
              <span>Rejected <strong>{importProgress.rejected ?? 0}</strong></span>
            </div>
          </section> : null}
          <form className="card source-panel" onSubmit={runApolloSearch}>
            <div className="source-panel-head">
              <span><Icon name="search" size={18} /></span>
              <div>
                <h2>Apollo search</h2>
                <p className="faint">Choose a campaign and audience. We search Apollo, enrich each match, and only admit contactable leads.</p>
              </div>
            </div>
            <div className="apollo-required-note">Required setup</div>
            <div className="form-grid">
              <label className="field">
                <span>Campaign *</span>
                <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                  <option value="">Select a campaign</option>
                  {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.channel || "email"}</option>)}
                </select>
              </label>
              <MultiSelect label="Job titles" options={uniqueApolloValues([...TITLE_OPTIONS, ...titles])} value={titles} onChange={setTitles} placeholder="Select job titles" required />
              <MultiSelect label="Management level" options={SENIORITY_OPTIONS} value={seniorities} onChange={setSeniorities} placeholder="Select seniority" required />
              <MultiSelect label="People locations" options={uniqueApolloValues([...LOCATION_OPTIONS, ...locations])} value={locations} onChange={setLocations} placeholder="Select locations" required />
              <label className="field"><span>Other job titles</span><input className="input" value={customTitles} onChange={event => setCustomTitles(event.target.value)} placeholder="Add custom titles, comma separated" /></label>
              <label className="field"><span>Other people locations</span><input className="input" value={customLocations} onChange={event => setCustomLocations(event.target.value)} placeholder="Add cities or regions, comma separated" /></label>
              <MultiSelect label="Target industries" options={uniqueApolloValues([...INDUSTRY_OPTIONS, ...industries])} value={industries} onChange={value => { setIndustries(value); setKeywords(value.join(", ")); }} placeholder="Select industries" required />
              <label className="field"><span>Other industries</span><input className="input" value={customIndustries} onChange={event => setCustomIndustries(event.target.value)} placeholder="Add custom industries, comma separated" /></label>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <span>Company size *</span>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {uniqueApolloValues([...COMPANY_SIZE_OPTIONS, ...companySizes]).map(size => (
                  <button key={size} type="button" className="btn btn-ghost btn-sm" onClick={() => toggleSize(size)} style={{ height: 32, padding: "0 11px", fontSize: 12, background: companySizes.includes(size) ? "var(--g-50)" : "#fff", borderColor: companySizes.includes(size) ? "var(--g-300)" : "var(--line)" }}>
                    {size.endsWith(",") ? `${size.slice(0, -1)}+` : size.replace(",", "-")} employees
                  </button>
                ))}
              </div>
            </div>
            <label className="apollo-checkbox-row">
              <input type="checkbox" checked={includeSimilarTitles} onChange={event => setIncludeSimilarTitles(event.target.checked)} />
              Include people with similar job titles
            </label>

            <button className="btn btn-ghost btn-sm apollo-more-button" type="button" onClick={() => setShowMoreFilters(value => !value)}>
              <Icon name="sliders" size={14} /> {showMoreFilters ? "Hide additional filters" : "More Apollo filters"}
            </button>

            {showMoreFilters ? (
              <div className="apollo-more-panel">
                <div className="form-grid">
                  <label className="field"><span>Keywords</span><input className="input" value={keywords} onChange={event => setKeywords(event.target.value)} placeholder="B2B SaaS, fintech, logistics" /></label>
                  <MultiSelect label="Company HQ locations" options={LOCATION_OPTIONS} value={organizationLocations} onChange={setOrganizationLocations} placeholder="Select company locations" />
                  <label className="field"><span>Company domains</span><input className="input" value={domains} onChange={event => setDomains(event.target.value)} placeholder="acme.com, example.com" /></label>
                  <MultiSelect label="Technologies used" options={TECHNOLOGY_OPTIONS} value={technologies} onChange={setTechnologies} placeholder="Select technologies" />
                  <label className="field"><span>Companies hiring for</span><input className="input" value={hiringTitles} onChange={event => setHiringTitles(event.target.value)} placeholder="Account Executive, SDR" /></label>
                  <label className="field"><span>Annual revenue (minimum)</span><input className="input" type="number" min="0" value={revenueMin} onChange={event => setRevenueMin(event.target.value)} placeholder="1000000" /></label>
                  <label className="field"><span>Annual revenue (maximum)</span><input className="input" type="number" min="1" value={revenueMax} onChange={event => setRevenueMax(event.target.value)} placeholder="50000000" /></label>
                  <label className="field"><span>Leads to prepare</span><select className="input" value={leadLimit} onChange={event => setLeadLimit(Number(event.target.value))}>{[10, 25, 50, 100].map(value => <option key={value} value={value}>{value} leads</option>)}</select></label>
                </div>
                {keywordSuggestions.length ? <div style={{ marginTop: 12 }}><span className="faint" style={{ fontSize: 12 }}>Onboarding suggestions</span><div className="row" style={{ gap: 7, flexWrap: "wrap", marginTop: 7 }}>{keywordSuggestions.map(keyword => <button key={keyword} type="button" className="btn btn-ghost btn-sm" onClick={() => setKeywords(current => uniqueApolloValues([...splitList(current), keyword]).join(", "))}>{keyword}</button>)}</div></div> : null}
              </div>
            ) : null}
            <div style={{ marginTop: 14, padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }}>
              <strong style={{ fontSize: 12.5 }}>Final Apollo audience</strong>
              <p className="faint" style={{ fontSize: 12, marginTop: 5, lineHeight: 1.55 }}>
                {uniqueApolloValues([...titles, ...splitList(customTitles)]).join(", ") || "No titles"} · {normalizeApolloLocations([...locations, ...splitList(customLocations)]).join(", ") || "No locations"} · {uniqueApolloValues([...industries, ...splitList(customIndustries)]).join(", ") || "No industries"} · {companySizes.length} company-size range{companySizes.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="row spread source-actions">
              <span className="faint">Email campaigns require an enriched email; voice campaigns require an enriched callable phone.</span>
              <button className="btn btn-primary btn-sm" type="submit" disabled={!canSearch || loading}>
                <Icon name="search" size={15} color="#06231a" /> {loading ? "Starting import..." : "Find and prepare leads"}
              </button>
            </div>
          </form></div>
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
                <label className="field"><span>Attach to campaign</span><select className="input" value={campaignId} onChange={event => { setCampaignId(event.target.value); setVoiceConfirmed(false); }}><option value="">No campaign yet</option>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.channel}</option>)}</select></label>
                {selectedVoiceCampaign ? <div className="notice-warn">
                  <strong>Voice compliance confirmation required</strong>
                  <p>Every row must contain a person-level direct/mobile number.</p>
                  <select className="input" value={voiceLegalBasis} onChange={event => setVoiceLegalBasis(event.target.value)}><option value="legitimate_interest">Legitimate interest</option><option value="consent">Consent</option><option value="existing_business_relationship">Existing business relationship</option><option value="other">Other lawful basis</option></select>
                  <label className="apollo-checkbox-row"><input type="checkbox" checked={voiceConfirmed} onChange={event => setVoiceConfirmed(event.target.checked)} /> I confirm these numbers were DNC-checked, have not opted out, and may lawfully be called.</label>
                </div> : null}
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
