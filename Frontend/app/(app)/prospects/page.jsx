"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";

const COMPANY_SIZE_OPTIONS = [
  "1,10",
  "11,50",
  "51,200",
  "201,500",
  "501,1000",
  "1001,5000",
  "5001,10000",
  "10001,",
];

function splitList(value) {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
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

function csvToLeads(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const headerMap = Object.fromEntries(headers.map((header, index) => [normalizeHeader(header), index]));

  return rows.slice(1).map(row => ({
    firstName: getValue(row, headerMap, ["first name", "firstname", "first"]),
    lastName: getValue(row, headerMap, ["last name", "lastname", "last"]),
    name: getValue(row, headerMap, ["name", "full name", "fullname"]),
    title: getValue(row, headerMap, ["title", "job title", "role"]),
    company: getValue(row, headerMap, ["company", "organization", "account"]),
    email: getValue(row, headerMap, ["email", "work email"]),
    phone: getValue(row, headerMap, ["phone", "mobile", "phone number"]),
    location: getValue(row, headerMap, ["location", "city", "geo"]),
    linkedinUrl: getValue(row, headerMap, ["linkedin", "linkedin url", "linkedinurl"]),
    rawData: Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])),
  })).filter(lead => lead.name || lead.firstName || lead.lastName || lead.email || lead.company);
}

function LeadRow({ lead, source }) {
  const displayName = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed lead";
  return (
    <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
      <td style={{ padding: "12px 18px" }}>
        <div className="row" style={{ gap: 11 }}>
          <Avatar name={displayName} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }} className="ellip">{displayName}</span>
            <span className="faint ellip" style={{ fontSize: 12 }}>{lead.title || "No title"} - {lead.company || "No company"}</span>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{lead.email || "Not revealed"}</span>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span className="faint" style={{ fontSize: 13 }}>{lead.location || "-"}</span>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span className="badge" style={{ background: source === "apollo" ? "var(--g-50)" : "var(--bg-2)", color: source === "apollo" ? "var(--g-700)" : "var(--ink-2)" }}>{source}</span>
      </td>
    </tr>
  );
}

export default function ProspectsPage() {
  const [tab, setTab] = useState("apollo");
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [titles, setTitles] = useState("VP Sales, Head of Revenue");
  const [locations, setLocations] = useState("United States");
  const [companySizes, setCompanySizes] = useState(["51,200", "201,500"]);
  const [keywords, setKeywords] = useState("B2B SaaS");
  const [apolloResults, setApolloResults] = useState([]);
  const [csvLeads, setCsvLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingApollo, setImportingApollo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/campaigns")
      .then(({ data }) => setCampaigns(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setCampaigns([]));
  }, []);

  const canSearch = useMemo(() => {
    return splitList(titles).length > 0 || splitList(locations).length > 0 || keywords.trim().length > 0;
  }, [titles, locations, keywords]);

  const toggleSize = size => {
    setCompanySizes(current => current.includes(size) ? current.filter(item => item !== size) : [...current, size]);
  };

  const runApolloSearch = async event => {
    event.preventDefault();
    if (!canSearch) return;

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const { data } = await api.post("/api/leads/apollo-search", {
        titles: splitList(titles),
        locations: splitList(locations),
        companySizes,
        keywords,
        page: 1,
        perPage: 25,
      });
      setApolloResults(Array.isArray(data?.items) ? data.items : []);
      setNotice(`${data?.items?.length ?? 0} Apollo people returned.`);
    } catch (err) {
      setApolloResults([]);
      setError(err?.response?.data?.error || "Apollo search failed. Check APOLLO_API_KEY on the backend.");
    } finally {
      setLoading(false);
    }
  };

  const importApolloResults = async () => {
    if (apolloResults.length === 0) return;
    setImportingApollo(true);
    setError("");
    setNotice("");

    try {
      await Promise.all(apolloResults.map(lead => api.post("/api/leads", {
        campaignId: campaignId || undefined,
        apolloId: lead.apolloId || undefined,
        firstName: lead.firstName || undefined,
        lastName: lead.lastName || undefined,
        name: lead.name || undefined,
        title: lead.title || undefined,
        company: lead.company || undefined,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        location: lead.location || undefined,
        linkedinUrl: lead.linkedinUrl || undefined,
        source: "apollo",
      })));
      setNotice(`${apolloResults.length} Apollo leads imported${campaignId ? " to the selected campaign" : ""}.`);
    } catch (err) {
      setError(err?.response?.data?.error || "Apollo leads could not be imported. Check the selected campaign and lead fields.");
    } finally {
      setImportingApollo(false);
    }
  };

  const handleCsv = async event => {
    const file = event.target.files?.[0];
    setError("");
    setNotice("");
    setCsvLeads([]);
    if (!file) return;

    const text = await file.text();
    const leads = csvToLeads(text).slice(0, 1000);
    setCsvLeads(leads);
    setNotice(`${leads.length} rows ready to import from ${file.name}.`);
  };

  const uploadCsv = async () => {
    if (csvLeads.length === 0) return;
    setUploading(true);
    setError("");
    setNotice("");

    try {
      const { data } = await api.post("/api/leads/csv-upload", {
        campaignId: campaignId || undefined,
        rows: csvLeads,
      });
      setNotice(`${data?.inserted ?? 0} CSV leads imported.`);
    } catch (err) {
      setError(err?.response?.data?.error || "CSV upload failed. Check required fields and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff", gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Leads</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Search Apollo and stage CSV imports for campaigns.</p>
        </div>
        <Segmented
          options={[
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

      {(error || notice) && (
        <div style={{
          padding: "12px 24px",
          background: error ? "#fff7ed" : "var(--g-50)",
          borderBottom: `1px solid ${error ? "#fed7aa" : "var(--g-100)"}`,
          color: error ? "#9a3412" : "var(--g-800)",
          fontSize: 13,
          fontWeight: 800,
        }}>
          {error || notice}
        </div>
      )}

      <div className="scroll grow" style={{ padding: 24, minHeight: 0 }}>
        {tab === "apollo" ? (
          <div className="col" style={{ gap: 16 }}>
            <form className="card" style={{ padding: 18, borderRadius: 8 }} onSubmit={runApolloSearch}>
              <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                  <Icon name="search" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>Apollo search</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Connected to /api/leads/apollo-search.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
                <label className="field">
                  <span>Job titles</span>
                  <input className="input" value={titles} onChange={event => setTitles(event.target.value)} placeholder="VP Sales, Head of Revenue" />
                </label>
                <label className="field">
                  <span>Locations</span>
                  <input className="input" value={locations} onChange={event => setLocations(event.target.value)} placeholder="United States, Canada" />
                </label>
                <label className="field">
                  <span>Keywords</span>
                  <input className="input" value={keywords} onChange={event => setKeywords(event.target.value)} placeholder="B2B SaaS" />
                </label>
                <label className="field">
                  <span>Attach to campaign</span>
                  <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                    <option value="">No campaign yet</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span>Company size</span>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  {COMPANY_SIZE_OPTIONS.map(size => (
                    <button
                      key={size}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleSize(size)}
                      style={{
                        height: 32,
                        padding: "0 11px",
                        fontSize: 12,
                        background: companySizes.includes(size) ? "var(--g-50)" : "#fff",
                        borderColor: companySizes.includes(size) ? "var(--g-300)" : "var(--line)",
                      }}
                    >
                      {size.replace(",", "-")} employees
                    </button>
                  ))}
                </div>
              </div>

              <div className="row spread" style={{ marginTop: 18, gap: 12, flexWrap: "wrap" }}>
                <span className="faint" style={{ fontSize: 12.5 }}>Search returns preview data from Apollo. Email visibility depends on your Apollo plan.</span>
                <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" type="button" disabled={apolloResults.length === 0 || importingApollo} onClick={importApolloResults}>
                    <Icon name="plus" size={15} /> {importingApollo ? "Importing..." : "Import results"}
                  </button>
                  <button className="btn btn-primary btn-sm" type="submit" disabled={!canSearch || loading}>
                    <Icon name="search" size={15} color="#06231a" /> {loading ? "Searching..." : "Search Apollo"}
                  </button>
                </div>
              </div>
            </form>

            <div className="card" style={{ borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
                    {["Lead", "Email", "Location", "Source"].map(header => (
                      <th key={header} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11.5, fontWeight: 800, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apolloResults.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>No Apollo results yet.</td>
                    </tr>
                  ) : (
                    apolloResults.map((lead, index) => <LeadRow key={lead.apolloId || index} lead={lead} source="apollo" />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="col" style={{ gap: 16 }}>
            <section className="card" style={{ padding: 18, borderRadius: 8 }}>
              <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                  <Icon name="doc" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>CSV upload</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Start with CSV columns like name, first_name, last_name, title, company, email, phone, location, linkedin_url.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 14 }}>
                <label className="field">
                  <span>CSV file</span>
                  <input className="input" type="file" accept=".csv,text/csv" onChange={handleCsv} style={{ paddingTop: 12 }} />
                </label>
                <label className="field">
                  <span>Attach to campaign</span>
                  <select className="input" value={campaignId} onChange={event => setCampaignId(event.target.value)}>
                    <option value="">No campaign yet</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="row spread" style={{ marginTop: 18 }}>
                <span className="faint" style={{ fontSize: 12.5 }}>{csvLeads.length} parsed rows. Maximum 1000 rows per upload.</span>
                <button className="btn btn-primary btn-sm" type="button" disabled={csvLeads.length === 0 || uploading} onClick={uploadCsv}>
                  <Icon name="plus" size={15} color="#06231a" /> {uploading ? "Importing..." : "Import leads"}
                </button>
              </div>
            </section>

            <div className="card" style={{ borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
                    {["Lead", "Email", "Location", "Source"].map(header => (
                      <th key={header} style={{ padding: "10px 18px", textAlign: "left", fontSize: 11.5, fontWeight: 800, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>Choose a CSV file to preview rows.</td>
                    </tr>
                  ) : (
                    csvLeads.slice(0, 50).map((lead, index) => <LeadRow key={index} lead={lead} source="csv" />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
