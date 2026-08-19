"use client";
import { useState, useEffect } from "react";
import api from "../../../lib/api";

export default function AITestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedLead, setSelectedLead] = useState('');
  const [selectedReply, setSelectedReply] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/campaigns').then(res => setCampaigns(res.data.items || [])).catch(() => {}),
      api.get('/leads').then(res => setLeads(res.data.items || [])).catch(() => {}),
      api.get('/inbox').then(res => {
        const items = res.data.items || res.data || [];
        const allReplies = items.flatMap(thread =>
          (thread.replies || [thread]).map(r => ({ id: r.id, label: `${r.lead_name || r.lead_id || 'Unknown'}: ${(r.body || '').slice(0, 50)}...` }))
        );
        setReplies(allReplies);
      }).catch(() => {}),
    ]).finally(() => setDataLoading(false));
  }, []);

  async function callEndpoint(name, url, body) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(url, body);
      setResult({ name, data: res.data });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (dataLoading) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
        <p style={{ color: "#666" }}>Loading test data…</p>
      </div>
    );
  }

  const hasCampaign = !!selectedCampaign;
  const hasLead = !!selectedLead;

  const tests = [
    {
      label: "Generate Email: Step 1 (Cold Intro)",
      url: "/ai/generate-email",
      body: { campaignId: selectedCampaign, leadId: selectedLead, stepNumber: 1 },
      disabled: !hasCampaign || !hasLead,
    },
    {
      label: "Generate Email: Step 2 (Follow-up)",
      url: "/ai/generate-email",
      body: { campaignId: selectedCampaign, leadId: selectedLead, stepNumber: 2 },
      disabled: !hasCampaign || !hasLead,
    },
    {
      label: "Generate Email: Step 3 (Breakup)",
      url: "/ai/generate-email",
      body: { campaignId: selectedCampaign, leadId: selectedLead, stepNumber: 3 },
      disabled: !hasCampaign || !hasLead,
    },
    {
      label: "Generate Voice Prompt",
      url: "/ai/generate-voice-prompt",
      body: { campaignId: selectedCampaign },
      disabled: !hasCampaign,
    },
    {
      label: "Generate Reply",
      url: "/ai/generate-reply",
      body: { emailReplyId: selectedReply },
      disabled: !selectedReply,
    },
  ];

  return (
    <div className="ai-test-page" style={{ fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Engine Test Page</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
        Select a campaign and lead, then click a button to test the AI endpoints.
      </p>

      <div className="ai-test-form-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>CAMPAIGN</label>
          <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14 }}>
            <option value="">Select a campaign…</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>LEAD</label>
          <select value={selectedLead} onChange={e => setSelectedLead(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14 }}>
            <option value="">Select a lead…</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name || l.email || l.id}</option>)}
          </select>
        </div>
      </div>

      <div className="ai-test-form-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>REPLY (for Generate Reply)</label>
          <select value={selectedReply} onChange={e => setSelectedReply(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14 }}>
            <option value="">Select a reply…</option>
            {replies.length > 0
              ? replies.map(r => <option key={r.id} value={r.id}>{r.label}</option>)
              : <option value="88888888-8888-8888-8888-888888888888">Seed reply: Sarah Chen (pricing question)</option>
            }
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {tests.map((t) => (
          <button
            key={t.label}
            onClick={() => callEndpoint(t.label, t.url, t.body)}
            disabled={loading || t.disabled}
            style={{
              padding: "12px 20px", fontSize: 14, fontWeight: 600,
              border: "1px solid #e0e0e0", borderRadius: 10,
              background: (loading || t.disabled) ? "#f5f5f5" : "#fff",
              cursor: (loading || t.disabled) ? "not-allowed" : "pointer",
              textAlign: "left", transition: "all 0.15s",
              opacity: t.disabled ? 0.5 : 1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 14 }}>
          Generating... (takes 3-8 seconds)
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#dc2626", fontSize: 14, whiteSpace: "pre-wrap" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ padding: 20, background: "#f0faf6", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: "#166534" }}>{result.name}</div>
          {result.data.subject && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4 }}>SUBJECT</div>
              <div style={{ fontWeight: 600 }}>{result.data.subject}</div>
            </div>
          )}
          {result.data.body && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4 }}>BODY</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result.data.body}</div>
            </div>
          )}
          {result.data.prompt && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4 }}>VOICE PROMPT</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}>
                {result.data.prompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
