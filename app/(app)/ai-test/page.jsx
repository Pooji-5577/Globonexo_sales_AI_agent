"use client";
import { useState } from "react";
import api from "../../../lib/api";

const TEST_CAMPAIGN_ID = "44444444-4444-4444-4444-444444444444";
const TEST_VOICE_CAMPAIGN_ID = "55555555-5555-5555-5555-555555555555";
const TEST_LEAD_ID = "66666666-6666-6666-6666-666666666666";
const TEST_REPLY_ID = "88888888-8888-8888-8888-888888888888";

export default function AITestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const tests = [
    {
      label: "Generate Email — Step 1 (Cold Intro)",
      url: "/ai/generate-email",
      body: { campaignId: TEST_CAMPAIGN_ID, leadId: TEST_LEAD_ID, stepNumber: 1 },
    },
    {
      label: "Generate Email — Step 2 (Follow-up)",
      url: "/ai/generate-email",
      body: { campaignId: TEST_CAMPAIGN_ID, leadId: TEST_LEAD_ID, stepNumber: 2 },
    },
    {
      label: "Generate Email — Step 3 (Breakup)",
      url: "/ai/generate-email",
      body: { campaignId: TEST_CAMPAIGN_ID, leadId: TEST_LEAD_ID, stepNumber: 3 },
    },
    {
      label: "Generate Reply",
      url: "/ai/generate-reply",
      body: { emailReplyId: TEST_REPLY_ID },
    },
    {
      label: "Generate Voice Prompt",
      url: "/ai/generate-voice-prompt",
      body: { campaignId: TEST_VOICE_CAMPAIGN_ID },
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Engine Test Page</h1>
      <p style={{ color: "#666", marginBottom: 32, fontSize: 14 }}>
        Click a button to call the AI endpoint. Uses seed data (Sarah Chen at DataFlow Analytics).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {tests.map((t) => (
          <button
            key={t.label}
            onClick={() => callEndpoint(t.label, t.url, t.body)}
            disabled={loading}
            style={{
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid #e0e0e0",
              borderRadius: 10,
              background: loading ? "#f5f5f5" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = "#f0faf6"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = "#fff"; }}
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
        <div style={{
          padding: 16, background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 10, color: "#dc2626", fontSize: 14, whiteSpace: "pre-wrap",
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: 20, background: "#f0faf6", border: "1px solid #bbf7d0",
          borderRadius: 10, fontSize: 14,
        }}>
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
              <div style={{
                whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#fff",
                padding: 16, borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13,
              }}>
                {result.data.prompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
