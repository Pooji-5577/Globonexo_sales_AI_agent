"use client";

import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

const STATUS_STYLES = {
  open: { label: "Open", bg: "var(--g-50)", color: "var(--g-700)" },
  resolved: { label: "Resolved", bg: "#eef2ff", color: "#4338ca" },
  closed: { label: "Closed", bg: "var(--bg-2)", color: "var(--muted)" },
};

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function TicketBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.open;
  return <span className="badge" style={{ background: style.bg, color: style.color, border: "1px solid var(--line)" }}>{style.label}</span>;
}

function TicketButton({ ticket, selected, onClick }) {
  return (
    <button type="button" className={`support-ticket-button ${selected ? "is-active" : ""}`} onClick={onClick}>
      <div className="row spread" style={{ gap: 10 }}>
        <strong className="ellip">{ticket.subject}</strong>
        <TicketBadge status={ticket.status} />
      </div>
      <p className="muted ellip">{ticket.lastMessage?.body || "No messages yet"}</p>
      <span className="faint">{formatTime(ticket.updatedAt)}</span>
    </button>
  );
}

function MessageBubble({ message }) {
  const admin = message.senderType === "admin";
  return (
    <div className={`support-message ${admin ? "is-admin" : "is-user"}`}>
      <div className="row" style={{ gap: 8, justifyContent: admin ? "flex-start" : "flex-end" }}>
        {admin ? <Avatar name={message.sender?.name || "Support"} size={26} /> : null}
        <div>
          <div className="support-bubble">
            {message.body}
          </div>
          <span className="faint support-time">{admin ? "Support" : "You"} · {formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function appendMessageOnce(messages = [], message) {
  if (!message || messages.some(item => item.id === message.id)) return messages;
  return [...messages, message];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const openTickets = useMemo(() => tickets.filter(ticket => ticket.status === "open").length, [tickets]);

  const loadTickets = () => {
    setError("");
    return api.get("/support/tickets")
      .then(({ data }) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setTickets(items);
        setSelectedId(current => current || items[0]?.id || "");
      })
      .catch(() => setError("Support tickets could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    setError("");
    api.get(`/support/tickets/${selectedId}`)
      .then(({ data }) => setDetail(data))
      .catch(() => setError("Ticket messages could not be loaded."))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return undefined;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return undefined;

    const channel = supabase
      .channel(`support-ticket-${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selectedId}` },
        payload => {
          const row = payload.new;
          setDetail(current => {
            if (!current || current.messages?.some(message => message.id === row.id)) return current;
            return {
              ...current,
              messages: appendMessageOnce(current.messages, {
                id: row.id,
                ticketId: row.ticket_id,
                senderType: row.sender_type,
                senderId: row.sender_id,
                body: row.body,
                createdAt: row.created_at,
              }),
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  const createTicket = async event => {
    event.preventDefault();
    if (!subject.trim() || !newBody.trim()) return;
    setCreating(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/support/tickets", { subject, body: newBody });
      setSubject("");
      setNewBody("");
      setNotice("Support ticket created.");
      await loadTickets();
      setSelectedId(data.id);
    } catch (err) {
      setError(err?.response?.data?.error || "Ticket could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const sendReply = async event => {
    event.preventDefault();
    if (!selectedId || !replyBody.trim()) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post(`/support/tickets/${selectedId}/messages`, { body: replyBody });
      setReplyBody("");
      setDetail(current => current ? { ...current, messages: appendMessageOnce(current.messages, data) } : current);
      await loadTickets();
    } catch (err) {
      setError(err?.response?.data?.error || "Reply could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async status => {
    if (!selectedId) return;
    setError("");
    try {
      await api.patch(`/support/tickets/${selectedId}/status`, { status });
      setDetail(current => current ? { ...current, status } : current);
      await loadTickets();
    } catch {
      setError("Ticket status could not be updated.");
    }
  };

  if (loading) {
    return (
      <div className="scroll grow app-page">
        <p className="muted">Loading support...</p>
      </div>
    );
  }

  return (
    <div className="support-layout">
      <aside className="support-sidebar">
        <div className="support-sidebar-head">
          <div>
            <h1 className="display" style={{ fontSize: 22 }}>Support</h1>
            <p className="muted" style={{ fontSize: 13, marginTop: 3 }}>{openTickets} open tickets</p>
          </div>
          <span className="metric-icon"><Icon name="chat" size={16} /></span>
        </div>

        <form className="support-new-ticket" onSubmit={createTicket}>
          <label className="field">
            <span>Subject</span>
            <input className="input" value={subject} onChange={event => setSubject(event.target.value)} placeholder="What do you need help with?" />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea className="support-textarea" value={newBody} onChange={event => setNewBody(event.target.value)} placeholder="Share details, links, screenshots, or errors." />
          </label>
          <button className="btn btn-primary btn-sm btn-block" type="submit" disabled={creating || !subject.trim() || !newBody.trim()}>
            <Icon name="plus" size={14} color="#06231a" /> {creating ? "Creating..." : "Create ticket"}
          </button>
        </form>

        <div className="support-ticket-list">
          {tickets.length === 0 ? (
            <div className="soft-empty">No tickets yet.</div>
          ) : tickets.map(ticket => (
            <TicketButton key={ticket.id} ticket={ticket} selected={ticket.id === selectedId} onClick={() => setSelectedId(ticket.id)} />
          ))}
        </div>
      </aside>

      <main className="support-chat-panel">
        <div className="support-chat-head">
          {detail ? (
            <>
              <div className="row" style={{ gap: 12, minWidth: 0 }}>
                <span className="metric-icon"><Icon name="inbox" size={16} /></span>
                <div className="col" style={{ minWidth: 0 }}>
                  <strong className="ellip">{detail.subject}</strong>
                  <span className="faint">Created {formatTime(detail.createdAt)}</span>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <TicketBadge status={detail.status} />
                {detail.status === "open" ? (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => updateStatus("resolved")}>Resolve</button>
                ) : (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => updateStatus("open")}>Reopen</button>
                )}
              </div>
            </>
          ) : (
            <div>
              <strong>Select or create a ticket</strong>
              <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Support replies will appear here in realtime.</p>
            </div>
          )}
        </div>

        {(error || notice) ? <div className={error ? "notice-warn" : "notice-good"}>{error || notice}</div> : null}

        <div className="support-message-list">
          {detailLoading ? (
            <p className="muted">Loading messages...</p>
          ) : !detail ? (
            <div className="empty-state">
              <Icon name="chat" size={42} color="var(--faint)" />
              <p className="muted">No ticket selected</p>
              <span className="faint">Create a ticket or select one from the list.</span>
            </div>
          ) : detail.messages?.length === 0 ? (
            <div className="empty-state">
              <Icon name="chat" size={42} color="var(--faint)" />
              <p className="muted">No messages yet</p>
              <span className="faint">Send the first message to start the thread.</span>
            </div>
          ) : detail.messages.map(message => <MessageBubble key={message.id} message={message} />)}
        </div>

        <form className="support-composer" onSubmit={sendReply}>
          <textarea
            value={replyBody}
            onChange={event => setReplyBody(event.target.value)}
            placeholder={detail?.status === "closed" ? "Closed tickets cannot receive replies." : "Write a reply..."}
            disabled={!detail || detail.status === "closed" || sending}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={!detail || detail.status === "closed" || sending || !replyBody.trim()}>
            <Icon name="send" size={14} color="#06231a" /> {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
