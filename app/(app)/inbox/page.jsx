"use client";

import React, { useEffect, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

const STATUS_LABELS = {
  pending: "Draft pending",
  approved: "Approved",
  rejected: "Rejected",
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
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [draftBody, setDraftBody] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/inbox"),
      api.get("/gmail/status"),
    ])
      .then(([inboxResult, gmailResult]) => {
        if (inboxResult.status === "rejected") {
          setError("Inbox could not be loaded.");
          return;
        }

        const res = inboxResult.value;
        const items = res.data.threads || [];
        setThreads(items);
        setSelectedId(items[0]?.id || null);

        if (gmailResult.status === "fulfilled") {
          setGmailStatus(gmailResult.value.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    setError("");
    setSuccess("");
    api.get(`/inbox/${selectedId}`)
      .then(res => {
        setDetail(res.data);
        setDraftBody(res.data?.ai_draft_reply || "");
      })
      .catch(() => setError("Thread details could not be loaded."))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const runDraftAction = async action => {
    if (!selectedId) return;

    setActionBusy(action);
    setError("");
    setSuccess("");
    try {
      const payload = action === "approve" ? { body: draftBody } : undefined;
      const { data } = await api.post(`/emails/${selectedId}/${action}`, payload);
      if (action === "approve") {
        setThreads(current => current.map(item => item.id === selectedId ? { ...item, aiDraftStatus: "approved" } : item));
        setDetail(current => current ? { ...current, ...data } : current);
        setDraftBody(data.ai_draft_reply || "");
        setSuccess("Reply approved — it's queued to send to the prospect.");
      } else {
        setThreads(current => current.map(item => item.id === selectedId ? { ...item, aiDraftStatus: data.ai_draft_status } : item));
        setDetail(current => current ? { ...current, ...data } : current);
        setDraftBody(data.ai_draft_reply || "");
        setSuccess(action === "regenerate" ? "New draft generated." : "Reply rejected.");
      }
    } catch (err) {
      setError(action === "approve" ? "AI draft could not be approved." : "AI draft action could not be completed.");
    } finally {
      setActionBusy("");
    }
  };

  const saveDraftEdit = async () => {
    if (!selectedId) return;

    setActionBusy("edit");
    setError("");
    setSuccess("");
    try {
      const { data } = await api.patch(`/emails/${selectedId}/draft`, { body: draftBody });
      setThreads(current => current.map(item => item.id === selectedId ? { ...item, aiDraftStatus: data.ai_draft_status } : item));
      setDetail(current => current ? { ...current, ...data } : current);
      setDraftBody(data.ai_draft_reply || "");
      setSuccess("Draft edit saved.");
    } catch (err) {
      setError("AI draft edit could not be saved.");
    } finally {
      setActionBusy("");
    }
  };

  const connectGmail = async () => {
    setActionBusy("gmail");
    setError("");
    try {
      const { data } = await api.get("/gmail/auth-url");
      window.location.href = data.url;
    } catch (err) {
      setError("Gmail connection could not be started.");
      setActionBusy("");
    }
  };

  if (loading) {
    return (
      <div className="scroll grow" style={{ padding: 40, minHeight: 0 }}>
        <p className="muted">Loading inbox...</p>
      </div>
    );
  }

  const hasThreads = threads.length > 0;
  const thread = threads.find(item => item.id === selectedId) || threads[0] || null;
  const lead = detail?.leads || {};
  const originalMessage = detail?.email_messages || {};
  const draftStatus = detail?.ai_draft_status || thread?.aiDraftStatus || "pending";

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch", overflow: "hidden" }}>
      <div className="scroll" style={{ width: 340, flex: "none", borderRight: "1px solid var(--line)", background: "#fff" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--line)" }}>
          <div className="row spread" style={{ gap: 12 }}>
            <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
            <span className="faint" style={{ fontSize: 13, fontWeight: 700 }}>{threads.length} threads</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 5 }}>Prospect replies and AI draft responses.</p>
        </div>

        {hasThreads ? (
          threads.map(item => (
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
          ))
        ) : (
          <div style={{ padding: 18 }}>
            <div className="card col center" style={{ padding: 22, minHeight: 180, textAlign: "center", borderRadius: 8, boxShadow: "none" }}>
              <Icon name="inbox" size={32} color="var(--faint)" />
              <p style={{ fontWeight: 800, fontSize: 14, marginTop: 12 }}>No reply threads yet</p>
              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 5 }}>
                Threads will appear after Gmail is connected and inbox polling finds prospect replies.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grow col" style={{ minWidth: 0, background: "var(--bg)" }}>
        <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "#fff", flex: "none" }}>
          {hasThreads ? (
            <>
              <div className="row" style={{ gap: 11, minWidth: 0 }}>
                <Avatar name={thread.name} size={40} />
                <div className="col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5 }} className="ellip">{thread.name} · {thread.company}</span>
                  <span className="faint ellip" style={{ fontSize: 12.5 }}>{thread.subject}</span>
                </div>
              </div>
              <span className="chip" style={{ fontSize: 12 }}>{STATUS_LABELS[draftStatus] || draftStatus}</span>
            </>
          ) : (
            <>
              <div className="row" style={{ gap: 11, minWidth: 0 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                  <Icon name="inbox" size={20} />
                </span>
                <div className="col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>Inbox + AI draft replies</span>
                  <span className="faint" style={{ fontSize: 12.5 }}>Waiting for the first prospect reply</span>
                </div>
              </div>
              <span className="chip" style={{ fontSize: 12 }}>Ready</span>
            </>
          )}
        </div>

        <div className="scroll grow" style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ padding: 12, marginBottom: 14, borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, marginBottom: 14, borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 13, fontWeight: 700 }}>
              <Icon name="check" size={15} color="#15803d" />
              {success}
            </div>
          )}

          {!hasThreads ? (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 16, alignItems: "start" }}>
              <div className="col" style={{ gap: 14, maxWidth: 760 }}>
                <section className="card" style={{ padding: 20, borderRadius: 8 }}>
                  <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                      <Icon name="chat" size={18} />
                    </span>
                    <div>
                      <h2 style={{ fontSize: 15, fontWeight: 800 }}>Reply details</h2>
                      <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Select a thread to inspect the prospect reply.</p>
                    </div>
                  </div>
                  <div style={{ padding: 18, border: "1px dashed var(--line)", borderRadius: 8, background: "#fff" }}>
                    <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                      No replies are available yet. Once polling imports a reply, this panel will show the sender, subject, received time, and message body.
                    </p>
                  </div>
                </section>

                <section className="card" style={{ padding: 20, borderRadius: 8 }}>
                  <div className="row spread" style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 10, minWidth: 0 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)", flex: "none" }}>
                        <Icon name="spark" size={18} />
                      </span>
                      <div className="col" style={{ minWidth: 0 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 800 }}>AI draft reply</h2>
                        <span className="faint" style={{ fontSize: 12.5 }}>Draft status and body will appear here.</span>
                      </div>
                    </div>
                    <span className="chip" style={{ fontSize: 12 }}>Pending reply</span>
                  </div>
                  <div style={{ padding: 18, border: "1px dashed var(--g-100)", borderRadius: 8, background: "var(--g-50)" }}>
                    <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                      The AI draft body is generated after an inbound reply is matched to a sent email message.
                    </p>
                  </div>
                </section>
              </div>

              <aside className="card" style={{ padding: 18, borderRadius: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800 }}>Inbox requirements</h2>
                <div className="col" style={{ gap: 11, marginTop: 14 }}>
                  {[
                    [gmailStatus.connected ? "Gmail connected" : "Connect Gmail", gmailStatus.connected],
                    ["Redis worker running", true],
                    ["Inbox polling scheduled", gmailStatus.connected],
                    ["Replies saved with AI draft status", hasThreads],
                  ].map(([item, done]) => (
                    <div key={item} className="row" style={{ gap: 9 }}>
                      <Icon name={done ? "checkCircle" : "clock"} size={16} color={done ? "var(--g-600)" : "var(--faint)"} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: done ? "var(--ink-2)" : "var(--muted)" }}>{item}</span>
                    </div>
                  ))}
                </div>
                {gmailStatus.connected ? (
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--g-50)", border: "1px solid var(--g-100)" }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>Polling {gmailStatus.email}</div>
                    <p className="muted" style={{ marginTop: 5, fontSize: 12.5, lineHeight: 1.45 }}>Replies will appear after a sent campaign email receives a response.</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={connectGmail}
                    disabled={actionBusy === "gmail"}
                    style={{ marginTop: 16, width: "100%" }}
                  >
                    <Icon name="mail" size={15} color="#06231a" />
                    {actionBusy === "gmail" ? "Opening Gmail..." : "Connect Gmail"}
                  </button>
                )}
              </aside>
            </div>
          ) : detailLoading ? (
            <div className="card" style={{ padding: 18, maxWidth: 720 }}>
              <p className="muted">Loading thread...</p>
            </div>
          ) : (
            <>
              <div className="col" style={{ gap: 12, maxWidth: 760 }}>
                <div className="card" style={{ padding: 18, borderRadius: 8 }}>
                  <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)", flex: "none" }}>
                      <Icon name="send" size={16} />
                    </span>
                    <div className="col" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: 13.5 }} className="ellip">Original email</span>
                      <span className="faint ellip" style={{ fontSize: 12 }}>{originalMessage.subject || thread.subject}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>{formatBody(originalMessage.body || "")}</p>
                </div>

                <div className="card" style={{ padding: 18, borderRadius: 8 }}>
                  <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                    <Avatar name={thread.name} size={32} />
                    <div className="col" style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{thread.name}</span>
                      <span className="faint ellip" style={{ fontSize: 12 }}>{lead.email || "Prospect"} · received {thread.time}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>{formatBody(detail?.body || thread.preview)}</p>
                </div>
              </div>

              <div className="card" style={{ padding: 18, maxWidth: 760, marginTop: 14, borderRadius: 8 }}>
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
                  <textarea
                    value={draftBody}
                    onChange={event => setDraftBody(event.target.value)}
                    disabled={actionBusy === "approve" || draftStatus === "approved" || draftStatus === "sent"}
                    style={{
                      width: "100%",
                      minHeight: 180,
                      resize: "vertical",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "12px 13px",
                      font: "inherit",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: "var(--ink-2)",
                      background: draftStatus === "approved" || draftStatus === "sent" ? "var(--bg-2)" : "#fff",
                      outline: "none",
                    }}
                  />
                ) : (
                  <p className="muted" style={{ fontSize: 13.5 }}>No AI draft is available for this reply yet.</p>
                )}

                <div className="row" style={{ gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!draftBody.trim() || actionBusy === "approve" || draftStatus === "approved" || draftStatus === "sent"}
                    onClick={() => runDraftAction("approve")}
                  >
                    <Icon name="check" size={15} color="#06231a" />
                    {actionBusy === "approve" ? "Approving..." : "Approve draft"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!draftBody.trim() || actionBusy === "edit" || draftBody === (detail?.ai_draft_reply || "") || draftStatus === "approved" || draftStatus === "sent"}
                    onClick={saveDraftEdit}
                  >
                    <Icon name="doc" size={15} />
                    {actionBusy === "edit" ? "Saving..." : "Save edit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={actionBusy === "regenerate" || draftStatus === "approved" || draftStatus === "sent"}
                    onClick={() => runDraftAction("regenerate")}
                  >
                    <Icon name="spark" size={15} />
                    {actionBusy === "regenerate" ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={actionBusy === "reject" || draftStatus === "approved" || draftStatus === "sent" || draftStatus === "rejected"}
                    onClick={() => runDraftAction("reject")}
                  >
                    <Icon name="pause" size={15} />
                    {actionBusy === "reject" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
