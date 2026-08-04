"use client";

import React, { useEffect, useRef, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import Spinner from "../../../components/ui/Spinner";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import api from "../../../lib/api";
import { cleanText } from "../../../lib/validation";

const STATUS_LABELS = {
  pending: "Draft pending",
  approved: "Approved",
  rejected: "Rejected",
  sent: "Auto-sent",
  sent_email: "Sent email",
  queued: "Queued",
  failed: "Failed",
  bounced: "Bounced",
};

const EMAIL_FILTERS = [
  { id: "all", label: "All" },
  { id: "replies", label: "Replies" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
];

function formatBody(body) {
  return (body || "").split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
}

function leadName(lead = {}, fallback = "Lead") {
  return [lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.name || fallback;
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function filterThreads(items, filter) {
  if (filter === "replies") return items.filter(item => item.kind === "reply");
  if (filter === "sent") return items.filter(item => item.kind === "sent" || ["approved", "sent", "sent_email"].includes(item.aiDraftStatus));
  if (filter === "drafts") return items.filter(item => item.kind === "reply" && item.aiDraftStatus === "pending");
  return items;
}

function buildFallbackDraft(detail, thread, displayName) {
  if (detail?.ai_draft_reply) return detail.ai_draft_reply;
  const firstName = displayName.split(" ")[0] || "there";
  const company = detail?.leads?.company || thread?.company || "your team";
  return `Hi ${firstName},\n\nThanks for taking a look. Based on what ${company} is working on, GNX sales can help keep outreach and follow-up moving without adding more manual work for your team.\n\nWould it be useful if I shared a short walkthrough and a few example workflows for your pipeline?`;
}

function MessageBubble({ side, label, meta, children }) {
  const isOutbound = side === "outbound";
  return (
    <div className={`email-chat-message ${isOutbound ? "is-outbound" : "is-inbound"}`}>
      <div className="email-chat-meta">
        <span>{label}</span>
        {meta ? <span>{meta}</span> : null}
      </div>
      <div className="email-chat-bubble">
        {children}
      </div>
    </div>
  );
}

export default function InboxPage() {
  const composerRef = useRef(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [sentMessages, setSentMessages] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    let cancelled = false;
    api.get("/inbox")
      .then(res => {
        if (cancelled) return;
        const items = (res.data?.threads || []).map(item => ({ ...item, kind: "reply" }));
        setThreads(items);
        setSelectedId(items[0]?.id || null);
      })
      .catch(() => {
        if (!cancelled) setError("Real inbox could not be loaded. Check backend, login session, and Gmail connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    setError("");
    setSuccess("");
    setComposerBody("");
    api.get(`/inbox/${selectedId}`)
      .then(res => {
        setDetail({ ...res.data, kind: "reply" });
        setDraftBody(res.data?.ai_draft_reply || "");
      })
      .catch(() => setError("Thread details could not be loaded."))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const sendManualMessage = async event => {
    event.preventDefault();
    if (!selectedId || !composerBody.trim() || sending) return;

    const body = cleanText(composerBody, { max: 4000, multiline: true });
    if (!body) return;

    setSending(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post(`/emails/${selectedId}/approve`, { body });
      const message = {
        id: data?.queuedEmailMessageId || `${selectedId}-${Date.now()}`,
        body,
        sentAt: new Date().toISOString(),
      };

      setSentMessages(current => ({
        ...current,
        [selectedId]: [...(current[selectedId] || []), message],
      }));
      setComposerBody("");
      setThreads(current => current.map(item => item.id === selectedId ? {
        ...item,
        preview: body.slice(0, 120),
        time: "queued",
        aiDraftStatus: data?.ai_draft_status || "approved",
      } : item));
      setDetail(current => current ? {
        ...current,
        ai_draft_reply: body,
        ai_draft_status: data?.ai_draft_status || "approved",
      } : current);
      setSuccess("Reply queued. The send-email worker will send it through connected Gmail.");
    } catch {
      setError("Reply could not be queued. Check Gmail connection, Redis worker, and backend logs.");
    } finally {
      setSending(false);
    }
  };

  const fillComposerWithDraft = async () => {
    if (!selectedId || drafting) return;
    setDrafting(true);
    setError("");
    setSuccess("");
    try {
      let body = detail?.ai_draft_reply || draftBody;
      if (!body) {
        const { data } = await api.post(`/emails/${selectedId}/regenerate`);
        body = data?.ai_draft_reply || "";
        setDetail(current => current ? { ...current, ...data } : current);
      }

      body = cleanText(body || buildFallbackDraft(detail, thread, displayName), { max: 8000, multiline: true });
      if (!body) return;
      setDraftBody(body);
      setComposerBody(body);
      window.requestAnimationFrame(() => {
        if (!composerRef.current) return;
        composerRef.current.focus();
        composerRef.current.scrollTop = composerRef.current.scrollHeight;
      });
    } catch {
      setError("Draft could not be generated. Check AI configuration and backend logs.");
    } finally {
      setDrafting(false);
    }
  };

  if (showSkeleton) return <RouteSkeleton />;

  const hasThreads = threads.length > 0;
  const thread = threads.find(item => item.id === selectedId) || threads[0] || null;
  const lead = detail?.leads || {};
  const originalMessage = detail?.email_messages || {};
  const displayName = leadName(lead, thread?.name || "Lead");
  const draftStatus = detail?.ai_draft_status || thread?.aiDraftStatus || "pending";
  const hasReply = detail?.kind === "reply";
  const manualMessages = selectedId ? sentMessages[selectedId] || [] : [];
  const filteredThreads = filterThreads(threads, activeFilter);
  const filterCounts = {
    all: threads.length,
    replies: filterThreads(threads, "replies").length,
    sent: filterThreads(threads, "sent").length,
    drafts: filterThreads(threads, "drafts").length,
  };

  const changeFilter = filter => {
    const nextThreads = filterThreads(threads, filter);
    setActiveFilter(filter);
    if (nextThreads.length > 0 && !nextThreads.some(item => item.id === selectedId)) {
      setSelectedId(nextThreads[0].id);
    }
  };

  return (
    <div className="email-inbox-shell">
      <aside className="email-list-panel">
        <div className="email-list-head">
          <div className="row spread" style={{ gap: 12 }}>
            <div>
              <h1 className="display">Emails</h1>
              <p>{threads.length} lead conversations</p>
            </div>
            <span className="email-count-chip">{threads.length}</span>
          </div>
          <div className="input-wrap email-list-search">
            <span className="lead-ico"><Icon name="search" size={15} /></span>
            <input className="input has-ico" placeholder="Search emails..." readOnly />
          </div>
          <div className="email-filter-tabs" aria-label="Email filters">
            {EMAIL_FILTERS.map(filter => (
              <button
                key={filter.id}
                type="button"
                className={activeFilter === filter.id ? "is-active" : ""}
                onClick={() => changeFilter(filter.id)}
              >
                {filter.label}
                <span>{filterCounts[filter.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="scroll email-thread-scroll">
          {filteredThreads.length > 0 ? (
            filteredThreads.map(item => (
              <button
                key={item.id}
                type="button"
                className={`email-thread-item ${selectedId === item.id ? "is-active" : ""}`}
                onClick={() => setSelectedId(item.id)}
              >
                <Avatar name={item.name} size={42} />
                <div className="email-thread-copy">
                  <div className="row spread" style={{ gap: 8 }}>
                    <strong className="ellip">{item.name}</strong>
                    <span>{item.time}</span>
                  </div>
                  <p className="ellip">{item.company || item.email || "Lead"}</p>
                  <div className="email-thread-subject ellip">{item.subject}</div>
                  <div className="email-thread-preview ellip">{item.preview}</div>
                </div>
                <div className="email-thread-footer">
                  <span className={`email-thread-status ${item.kind === "reply" ? "has-reply" : ""}`}>
                    {item.kind === "reply" ? "Reply" : "Sent"}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="email-empty-list">
              <Icon name="mail" size={34} color="var(--faint)" />
              <strong>No {activeFilter === "all" ? "emails" : activeFilter} yet</strong>
              <span>Try another category or send a mock message in the open conversation.</span>
            </div>
          )}
        </div>
      </aside>

      <section className="email-chat-panel">
        <header className="email-chat-head">
          {thread ? (
            <>
              <div className="row" style={{ gap: 12, minWidth: 0 }}>
                <Avatar name={displayName} size={42} />
                <div className="col" style={{ minWidth: 0 }}>
                  <strong className="ellip">{displayName}</strong>
                  <span className="ellip">{lead.email || thread.email || thread.company || "Lead email"}</span>
                </div>
              </div>
              <span className="chip">{STATUS_LABELS[draftStatus] || draftStatus}</span>
            </>
          ) : (
            <>
              <div className="row" style={{ gap: 12 }}>
                <span className="email-chat-icon"><Icon name="mail" size={20} /></span>
                <div>
                  <strong>Emails</strong>
                  <span>No conversation selected</span>
                </div>
              </div>
            </>
          )}
        </header>

        <div className="scroll email-chat-scroll">
          {error ? <div className="notice-warn">{error}</div> : null}
          {success ? <div className="notice-good">{success}</div> : null}

          {!thread ? (
            <div className="email-empty-chat">
              <Icon name="mail" size={44} color="var(--faint)" />
              <strong>Select an email</strong>
              <span>Choose a lead on the left to open the email conversation.</span>
            </div>
          ) : detailLoading ? (
            <div className="card" style={{ padding: 18, maxWidth: 720, display: "grid", placeItems: "center", minHeight: 120 }}>
              <Spinner size={20} />
            </div>
          ) : (
            <div className="email-chat-stack">
              <div className="email-chat-date">{formatDateTime(originalMessage.sent_at) || thread.time}</div>

              <MessageBubble side="outbound" label="You sent" meta={formatDateTime(originalMessage.sent_at)}>
                <h2>{originalMessage.subject || thread.subject}</h2>
                <p>{formatBody(originalMessage.body || thread.preview)}</p>
              </MessageBubble>

              {hasReply ? (
                <MessageBubble side="inbound" label={`${displayName} replied`} meta={formatDateTime(detail.received_at)}>
                  <p>{formatBody(detail.body || thread.preview)}</p>
                </MessageBubble>
              ) : (
                <div className="email-waiting-card">
                  <Icon name="clock" size={16} />
                  <span>Waiting for this lead to reply.</span>
                </div>
              )}

              {manualMessages.map(message => (
                <MessageBubble key={message.id} side="outbound" label="You sent" meta={formatDateTime(message.sentAt)}>
                  <p>{formatBody(message.body)}</p>
                </MessageBubble>
              ))}
            </div>
          )}
        </div>

        {thread ? (
          <div className="email-composer-wrap">
            <div className="email-nexo-row">
              <button
                type="button"
                className="email-nexo-draft-btn"
                disabled={detailLoading || drafting || !selectedId}
                onClick={fillComposerWithDraft}
              >
                <Icon name="spark" size={15} />
                {drafting ? "Drafting..." : "Ask GNX sales to draft"}
              </button>
            </div>

            <form className="email-message-composer" onSubmit={sendManualMessage}>
              <button type="button" className="email-composer-icon-btn" aria-label="Add attachment">
                <Icon name="plus" size={22} />
              </button>
              <div className="email-composer-input">
                <textarea
                  ref={composerRef}
                  value={composerBody}
                  onChange={event => setComposerBody(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendManualMessage(event);
                    }
                  }}
                  rows={1}
                  placeholder={`Message ${displayName}`}
                />
              </div>
              <button type="submit" className="email-composer-send" disabled={!composerBody.trim() || sending} aria-label="Send message">
                <Icon name="send" size={18} color="#06231a" />
              </button>
            </form>
          </div>
        ) : null}
      </section>
    </div>
  );
}
