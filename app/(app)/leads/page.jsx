"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../../lib/api";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Engaged", value: "engaged" },
  { label: "Meeting booked", value: "meeting_booked" },
  { label: "Not interested", value: "not_interested" },
];

const SOURCE_OPTIONS = [
  { label: "All sources", value: "" },
  { label: "Apollo", value: "apollo" },
  { label: "CSV", value: "csv" },
  { label: "Manual", value: "manual" },
];

const STATUS_COLORS = {
  new: { bg: "var(--g-50)", color: "var(--g-700)" },
  contacted: { bg: "#eff6ff", color: "#1d4ed8" },
  engaged: { bg: "#fefce8", color: "#a16207" },
  meeting_booked: { bg: "#f0fdf4", color: "#15803d" },
  not_interested: { bg: "#fef2f2", color: "#b91c1c" },
  enrichment_failed: { bg: "#fff7ed", color: "#c2410c" },
  queued: { bg: "#f5f3ff", color: "#7c3aed" },
  unsubscribed: { bg: "var(--bg-2)", color: "var(--ink-2)" },
};

function statusLabel(status) {
  return (status || "new").replace(/_/g, " ");
}

function LeadRow({ lead, onEnrich, enrichingId }) {
  const displayName = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed lead";
  const colors = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
  const isEnriching = enrichingId === lead.id;

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
        <span className="faint" style={{ fontSize: 13 }}>{lead.phone || "-"}</span>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span className="faint" style={{ fontSize: 13 }}>{lead.location || "-"}</span>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span className="badge" style={{ background: lead.source === "apollo" ? "var(--g-50)" : "var(--bg-2)", color: lead.source === "apollo" ? "var(--g-700)" : "var(--ink-2)", fontSize: 12, textTransform: "capitalize" }}>{lead.source}</span>
      </td>
      <td style={{ padding: "12px 18px" }}>
        <span className="badge" style={{ background: colors.bg, color: colors.color, fontSize: 12, textTransform: "capitalize" }}>{statusLabel(lead.status)}</span>
      </td>
      <td style={{ padding: "12px 18px", textAlign: "right" }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ height: 30, padding: "0 10px", fontSize: 12 }}
          disabled={isEnriching}
          onClick={() => onEnrich(lead.id)}
          title="Enrich via Apollo"
        >
          <Icon name="spark" size={14} /> {isEnriching ? "Enriching..." : "Enrich"}
        </button>
      </td>
    </tr>
  );
}

const LEAD_FIELDS = [
  { value: "", label: "— Skip —" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "name", label: "Full Name" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "title", label: "Job Title" },
  { value: "phone", label: "Phone" },
  { value: "location", label: "Location" },
  { value: "linkedinUrl", label: "LinkedIn URL" },
];

const AUTO_MAP = {
  "first_name": "firstName", "firstname": "firstName", "first name": "firstName", "first": "firstName",
  "last_name": "lastName", "lastname": "lastName", "last name": "lastName", "last": "lastName",
  "name": "name", "full_name": "name", "fullname": "name", "full name": "name", "contact name": "name",
  "email": "email", "e-mail": "email", "email_address": "email", "email address": "email", "work email": "email",
  "company": "company", "organization": "company", "company_name": "company", "company name": "company", "org": "company",
  "title": "title", "job_title": "title", "job title": "title", "position": "title", "role": "title",
  "phone": "phone", "phone_number": "phone", "phone number": "phone", "mobile": "phone", "telephone": "phone",
  "location": "location", "city": "location", "address": "location", "region": "location",
  "linkedin": "linkedinUrl", "linkedin_url": "linkedinUrl", "linkedin url": "linkedinUrl", "linkedin profile": "linkedinUrl",
};

function parseCsvClient(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = false;
        } else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ",") { fields.push(current.trim()); current = ""; }
        else current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every(v => !v)) continue;
    const row = {};
    headers.forEach((h, idx) => { if (idx < values.length) row[h] = values[idx]; });
    rows.push(row);
  }
  return { headers, rows };
}

function CsvUploadModal({ onClose, onImportComplete }) {
  const [step, setStep] = useState("upload"); // upload | mapping | importing | done
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columnMapping, setColumnMapping] = useState({});
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleFile = (f) => {
    setError("");
    if (!f) return;
    if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
      setError("Please select a CSV file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File exceeds 10 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers: h, rows } = parseCsvClient(text);
      if (h.length === 0) { setError("CSV file is empty or has no headers."); return; }
      if (rows.length === 0) { setError("CSV file has headers but no data rows."); return; }
      if (rows.length > 5000) { setError("CSV exceeds the 5,000 row limit."); return; }

      setFile(f);
      setHeaders(h);
      setPreviewRows(rows.slice(0, 5));
      setTotalRows(rows.length);

      const autoMap = {};
      h.forEach(header => {
        const norm = header.toLowerCase().trim();
        if (AUTO_MAP[norm]) autoMap[header] = AUTO_MAP[norm];
      });
      setColumnMapping(autoMap);
      setStep("mapping");
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const updateMapping = (csvCol, leadField) => {
    setColumnMapping(prev => {
      const next = { ...prev };
      if (leadField) next[csvCol] = leadField;
      else delete next[csvCol];
      return next;
    });
  };

  const mappedFieldCount = Object.values(columnMapping).filter(Boolean).length;
  const hasMappedIdentifier = Object.values(columnMapping).some(f =>
    ["email", "name", "firstName", "lastName"].includes(f)
  );

  const startImport = async () => {
    setError("");
    setStep("importing");
    setProgress({ status: "uploading", total: totalRows, processed: 0, inserted: 0, skipped: 0, errors: [] });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("columnMapping", JSON.stringify(columnMapping));

      const { data } = await api.post("/api/leads/csv-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setJobId(data.jobId);
      setProgress({ status: "processing", total: data.totalRows, processed: 0, inserted: 0, skipped: 0, errors: [], fileName: data.fileName });

      pollRef.current = setInterval(async () => {
        try {
          const { data: prog } = await api.get(`/api/leads/csv-import/${data.jobId}`);
          setProgress(prog);
          if (prog.status === "completed" || prog.status === "failed") {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setStep("done");
          }
        } catch {}
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to start import.");
      setStep("mapping");
      setProgress(null);
    }
  };

  const pct = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }} onClick={step === "importing" ? undefined : onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: 640, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
        {/* Header */}
        <div className="row spread" style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", flex: "none" }}>
          <div className="row" style={{ gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center" }}>
              <Icon name="doc" size={20} color="var(--g-600)" />
            </span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Import CSV</h2>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 1 }}>
                {step === "upload" && "Upload a CSV file to import leads."}
                {step === "mapping" && `${totalRows} rows found — map columns to lead fields.`}
                {step === "importing" && "Importing leads..."}
                {step === "done" && "Import complete."}
              </p>
            </div>
          </div>
          {step !== "importing" && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", color: "var(--muted)" }}>
              <Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="scroll" style={{ flex: 1, padding: "20px 24px", minHeight: 0 }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#9a3412", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* STEP: Upload */}
          {step === "upload" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "var(--g-400)" : "var(--line)"}`,
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragging ? "var(--g-50)" : "var(--bg)",
                transition: "all .15s",
              }}
            >
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", margin: "0 auto" }}>
                <Icon name="doc" size={28} color="var(--g-600)" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, marginTop: 16 }}>
                {dragging ? "Drop your CSV file here" : "Drag & drop your CSV file here"}
              </p>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>or click to browse. Max 5,000 rows, 10 MB.</p>
            </div>
          )}

          {/* STEP: Column mapping */}
          {step === "mapping" && (
            <div className="col" style={{ gap: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>
                File: <span style={{ color: "var(--g-700)" }}>{file?.name}</span> — {totalRows} rows, {headers.length} columns
              </div>

              {/* Mapping table */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>Column mapping</span>
                  <span className="faint" style={{ fontSize: 12, marginLeft: 8 }}>{mappedFieldCount} of {headers.length} mapped</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                      <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>CSV Column</th>
                      <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>Maps to</th>
                      <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".06em" }}>Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((h) => (
                      <tr key={h} style={{ borderBottom: "1px solid var(--line-2)" }}>
                        <td style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>{h}</td>
                        <td style={{ padding: "8px 16px" }}>
                          <select
                            className="input"
                            value={columnMapping[h] || ""}
                            onChange={(e) => updateMapping(h, e.target.value)}
                            style={{ height: 34, fontSize: 13, width: 160 }}
                          >
                            {LEAD_FIELDS.map((f) => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "8px 16px", fontSize: 12.5, color: "var(--ink-2)", maxWidth: 200 }} className="ellip">
                          {previewRows[0]?.[h] || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              {previewRows.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Preview (first {previewRows.length} rows)</div>
                  <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "var(--bg)" }}>
                          {Object.entries(columnMapping).filter(([,v]) => v).map(([csvCol, field]) => (
                            <th key={csvCol} style={{ padding: "6px 12px", textAlign: "left", fontWeight: 800, fontSize: 11, color: "var(--g-700)", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid var(--line)" }}>
                              {LEAD_FIELDS.find(f => f.value === field)?.label || field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                            {Object.entries(columnMapping).filter(([,v]) => v).map(([csvCol]) => (
                              <td key={csvCol} style={{ padding: "6px 12px", whiteSpace: "nowrap", color: "var(--ink-2)" }}>
                                {row[csvCol] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: Importing */}
          {step === "importing" && progress && (
            <div className="col" style={{ gap: 20, padding: "20px 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", margin: "0 auto", animation: "pulse-dot 1.4s infinite" }}>
                  <Icon name="doc" size={28} color="var(--g-600)" />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, marginTop: 14 }}>Importing leads...</p>
                <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{progress.processed} of {progress.total} rows processed</p>
              </div>
              <div>
                <div className="row spread" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Progress</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--g-700)" }}>{pct}%</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "linear-gradient(90deg, var(--g-400), var(--teal))", transition: "width .3s ease" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Inserted", value: progress.inserted, color: "var(--g-700)" },
                  { label: "Skipped", value: progress.skipped, color: "#a16207" },
                  { label: "Errors", value: progress.errors?.length ?? 0, color: "#b91c1c" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === "done" && progress && (
            <div className="col" style={{ gap: 20, padding: "12px 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", margin: "0 auto",
                  background: progress.errors?.length > 0 ? "#fff7ed" : "var(--g-50)",
                  border: `1px solid ${progress.errors?.length > 0 ? "#fed7aa" : "var(--g-100)"}`,
                }}>
                  <Icon name={progress.errors?.length > 0 ? "flame" : "checkCircle"} size={28} color={progress.errors?.length > 0 ? "#c2410c" : "var(--g-600)"} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 18, marginTop: 14 }}>
                  {progress.status === "failed" ? "Import failed" : "Import complete"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Total", value: progress.total },
                  { label: "Inserted", value: progress.inserted, color: "var(--g-700)" },
                  { label: "Skipped", value: progress.skipped, color: "#a16207" },
                  { label: "Errors", value: progress.errors?.length ?? 0, color: "#b91c1c" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color || "var(--ink)" }}>{s.value}</div>
                    <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Error list */}
              {progress.errors?.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", background: "#fff7ed", borderBottom: "1px solid #fed7aa" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#9a3412" }}>Errors ({progress.errors.length})</span>
                  </div>
                  <div style={{ maxHeight: 200, overflow: "auto" }}>
                    {progress.errors.slice(0, 50).map((err, i) => (
                      <div key={i} className="row" style={{ gap: 8, padding: "8px 16px", borderBottom: "1px solid var(--line-2)", fontSize: 13 }}>
                        <span style={{ fontWeight: 800, color: "#9a3412", flex: "none", width: 60 }}>Row {err.row}</span>
                        <span style={{ color: "var(--ink-2)" }}>{err.message}</span>
                      </div>
                    ))}
                    {progress.errors.length > 50 && (
                      <div style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                        ...and {progress.errors.length - 50} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="row spread" style={{ padding: "14px 24px", borderTop: "1px solid var(--line)", flex: "none", background: "#fff" }}>
          {step === "upload" && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <span />
            </>
          )}
          {step === "mapping" && (
            <>
              <button className="btn btn-ghost" onClick={() => { setStep("upload"); setFile(null); setHeaders([]); setPreviewRows([]); setColumnMapping({}); setError(""); }}>
                <Icon name="arrowLeft" size={16} /> Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!hasMappedIdentifier || mappedFieldCount === 0}
                onClick={startImport}
                style={{ gap: 8 }}
              >
                <Icon name="doc" size={16} color="#06231a" /> Import {totalRows} leads
              </button>
            </>
          )}
          {step === "importing" && (
            <>
              <span className="faint" style={{ fontSize: 13, fontWeight: 700 }}>Please wait while leads are being imported...</span>
              <span />
            </>
          )}
          {step === "done" && (
            <>
              <span />
              <button className="btn btn-primary" onClick={() => { onImportComplete(); onClose(); }}>
                <Icon name="check" size={16} color="#06231a" /> Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [enrichingId, setEnrichingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showCsvModal, setShowCsvModal] = useState(false);
  const perPage = 50;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      params.set("page", String(page));
      params.set("perPage", String(perPage));

      const { data } = await api.get(`/api/leads?${params.toString()}`);
      setLeads(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.pagination?.total ?? data?.items?.length ?? 0);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load leads.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleEnrich = async (leadId) => {
    setEnrichingId(leadId);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/api/leads/apollo-enrich", { leadId });
      setLeads(current => current.map(l => l.id === leadId ? data : l));
      const name = data.name || data.firstName || "Lead";
      setNotice(`${name} enriched and saved.`);
    } catch (err) {
      setError(err?.response?.data?.error || "Enrichment failed. Check Apollo API key.");
    } finally {
      setEnrichingId(null);
    }
  };

  const debouncedSearch = useMemo(() => {
    let timer;
    return (value) => {
      setSearch(value);
      clearTimeout(timer);
      timer = setTimeout(() => {}, 0);
    };
  }, []);

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff", gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Leads</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>View, search, filter, and enrich your saved leads.</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <span className="faint" style={{ fontSize: 13, fontWeight: 700 }}>{total} leads</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCsvModal(true)}>
            <Icon name="doc" size={15} color="#06231a" /> Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row" style={{ padding: "12px 24px", borderBottom: "1px solid var(--line-2)", gap: 12, flexWrap: "wrap", background: "var(--bg)" }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 340 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
            <Icon name="search" size={15} />
          </span>
          <input
            className="input"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, height: 38 }}
          />
        </div>
        <select
          className="input"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{ width: 150, height: 38 }}
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Segmented
          options={STATUS_OPTIONS.slice(0, 5)}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Notices */}
      {(error || notice) && (
        <div style={{
          padding: "10px 24px",
          background: error ? "#fff7ed" : "var(--g-50)",
          borderBottom: `1px solid ${error ? "#fed7aa" : "var(--g-100)"}`,
          color: error ? "#9a3412" : "var(--g-800)",
          fontSize: 13,
          fontWeight: 800,
        }}>
          {error || notice}
        </div>
      )}

      {/* Table */}
      <div className="scroll grow" style={{ minHeight: 0 }}>
        <div className="card" style={{ margin: 24, borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
                {["Lead", "Email", "Phone", "Location", "Source", "Status", ""].map((header) => (
                  <th key={header || "actions"} style={{ padding: "10px 18px", textAlign: header ? "left" : "right", fontSize: 11.5, fontWeight: 800, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>
                    {search || statusFilter || sourceFilter ? "No leads match your filters." : "No leads yet. Import leads from the Prospects page."}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onEnrich={handleEnrich} enrichingId={enrichingId} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row" style={{ justifyContent: "center", padding: "0 24px 24px", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ height: 34, padding: "0 14px" }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, padding: "0 8px", lineHeight: "34px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ height: 34, padding: "0 14px" }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showCsvModal && (
        <CsvUploadModal
          onClose={() => setShowCsvModal(false)}
          onImportComplete={() => { fetchLeads(); setNotice("CSV import completed successfully."); }}
        />
      )}
    </div>
  );
}
