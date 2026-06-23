"use client";

import React, { useEffect, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

const STATUS_LABELS = {
  pending: "Draft pending",
  approved: "Approved",
  rejected: "No draft",
  sent: "Auto-sent",
};

function formatBody(body) {
  return (body || "").split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
}

export default function InboxPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/inbox")
      .then(res => {
        const items = res.data.threads || [];
        setThreads(items);
        setSelectedId(items[0]?.id || null);
      })
      .catch(() => setError("Inbox could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    setError("");
    api.get(`/inbox/${selectedId}`)
      .then(res => setDetail(res.data))
      .catch(() => setError("Thread details could not be loaded."))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading inbox...</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Icon name="inbox" size={40} color="var(--faint)" />
        <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>Your inbox is empty</p>
        <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Replies from prospects will appear here.</p>
      </div>
    );
  }

  const thread = threads.find(item => item.id === selectedId) || threads[0];
  const lead = detail?.leads || {};
  const originalMessage = detail?.email_messages || {};
  const draftStatus = detail?.ai_draft_status || thread.aiDraftStatus || "pending";

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch", overflow: "hidden" }}>
      <div className="scroll" style={{ width: 340, flex: "none", borderRight: "1px solid var(--line)", background: "#fff" }}>
        <div className="row spread" style={{ padding: "16px 18px 12px" }}>
          <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
          <span className="faint" style={{ fontSize: 13, fontWeight: 700 }}>{threads.length} threads</span>
        </div>

        {threads.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "13px 18px",
              borderBottom: "1px solid var(--line-2)",
              borderLeft: `3px solid ${selectedId === item.id ? "var(--g-500)" : "transparent"}`,
              background: selectedId === item.id ? "var(--g-50)" : "#fff",
              transition: "all .12s",
            }}
          >
            <div className="row spread">
              <div className="row" style={{ gap: 9, minWidth: 0 }}>
                <Avatar name={item.name} size={34} />
                <div className="col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{item.name}</span>
                  <span className="faint nw" style={{ fontSize: 11.5 }}>{item.company}</span>
                </div>
              </div>
              <span className="faint nw" style={{ fontSize: 11.5, fontWeight: 700 }}>{item.time}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 7, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.preview}</div>
            <span className="chip" style={{ marginTop: 8, fontSize: 11.5 }}>{STATUS_LABELS[item.aiDraftStatus] || item.aiDraftStatus || "Draft pending"}</span>
          </button>
        ))}
      </div>

      <div className="grow col" style={{ minWidth: 0, background: "var(--bg)" }}>
        <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "#fff", flex: "none" }}>
          <div className="row" style={{ gap: 11, minWidth: 0 }}>
            <Avatar name={thread.name} size={40} />
            <div className="col" style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 14.5 }} className="ellip">{thread.name} · {thread.company}</span>
              <span className="faint ellip" style={{ fontSize: 12.5 }}>{thread.subject}</span>
            </div>
          </div>
          <span className="chip" style={{ fontSize: 12 }}>{STATUS_LABELS[draftStatus] || draftStatus}</span>
        </div>

        <div className="scroll grow" style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ padding: 12, marginBottom: 14, borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {detailLoading ? (
            <div className="card" style={{ padding: 18, maxWidth: 720 }}>
              <p className="muted">Loading thread...</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: 18, maxWidth: 720 }}>
                <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                  <Avatar name={thread.name} size={32} />
                  <div className="col">
                    <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{thread.name}</span>
                    <span className="faint" style={{ fontSize: 12 }}>{lead.email || "Prospect"} · received {thread.time}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>{formatBody(detail?.body || thread.preview)}</p>
              </div>

              <div className="card" style={{ padding: 18, maxWidth: 720, marginTop: 14 }}>
                <div className="row spread" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ gap: 10, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)", flex: "none" }}>
                      <Icon name="spark" size={17} />
                    </span>
                    <div className="col" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: 13.5 }}>AI draft reply</span>
                      <span className="faint ellip" style={{ fontSize: 12 }}>{originalMessage.subject || thread.subject}</span>
                    </div>
                  </div>
                  <span className="chip" style={{ fontSize: 12 }}>{STATUS_LABELS[draftStatus] || draftStatus}</span>
                </div>

                {detail?.ai_draft_reply ? (
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>{formatBody(detail.ai_draft_reply)}</p>
                ) : (
                  <p className="muted" style={{ fontSize: 13.5 }}>No AI draft is available for this reply yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
