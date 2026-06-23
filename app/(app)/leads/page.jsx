"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    </div>
  );
}
