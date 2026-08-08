"use client";

/**
 * Draft review.
 *
 * This replaced the separate "skim your leads" step in the setup arc: every
 * draft shows the person it is addressed to, their title, company and address,
 * so the recipient can be verified without leaving the screen.
 *
 * Two things the design has to make unmissable. Approve all, because a first
 * campaign carries thirty drafts and approving them one at a time is not a
 * reasonable ask. And the failure count, because generation is automatic - if
 * two leads produced nothing, nobody pressed a button that could have told
 * them, and a silently uncontacted lead is one the customer paid to enrich.
 */

import React, { useCallback, useEffect, useState } from "react";
import api from "../../lib/api";
import Icon from "../ui/Icon";

function StepChip({ stepNumber }) {
  const labels = { 1: "First touch", 2: "Follow-up", 3: "Final follow-up" };
  return (
    <span className="chip" style={{ background: "var(--bg-2)", color: "var(--ink-2)", fontSize: 11 }}>
      {labels[stepNumber] ?? `Step ${stepNumber}`}
    </span>
  );
}

function StatusChip({ status, approvedBy }) {
  const styles = {
    draft: { label: "Needs review", bg: "#fff7ed", color: "#9a3412" },
    approved: { label: approvedBy === "autopilot" ? "Approved by autopilot" : "Approved", bg: "var(--g-50)", color: "var(--g-700)" },
    queued: { label: "Queued", bg: "#eef2ff", color: "#4338ca" },
    sent: { label: "Sent", bg: "var(--bg-2)", color: "var(--muted)" },
  };
  const style = styles[status] ?? styles.draft;
  return (
    <span className="chip" style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 700 }}>
      {style.label}
    </span>
  );
}

function DraftCard({ message, onApprove, onSave, onRegenerate, busy }) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(message.subject);
  const [body, setBody] = useState(message.body);
  const lead = message.lead ?? {};
  const sent = message.status === "sent";

  useEffect(() => {
    setSubject(message.subject);
    setBody(message.body);
  }, [message.subject, message.body]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Recipient identity, always visible. This is what lets the reviewer
          confirm the email is going to the right person. */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-2)", background: "var(--bg)" }}>
        <div className="row spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="col" style={{ gap: 2, minWidth: 0 }}>
            <strong style={{ fontSize: 13.5 }}>{lead.name || "Unnamed lead"}</strong>
            <span className="faint" style={{ fontSize: 12 }}>
              {[lead.title, lead.company].filter(Boolean).join(" at ") || "No title or company"}
            </span>
            <span className="faint" style={{ fontSize: 11.5 }}>{lead.email}</span>
          </div>
          <div className="row" style={{ gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
            <StepChip stepNumber={message.stepNumber} />
            <StatusChip status={message.status} approvedBy={message.approvedBy} />
            {message.thinContext && (
              <span
                className="chip"
                style={{ background: "#fef9c3", color: "#854d0e", fontSize: 11 }}
                title={`Apollo had ${message.contextScore ?? 0} of ${message.contextScoreMax ?? 10} optional details for this lead, so this email is deliberately short and role-based rather than padded with guesses.`}
              >
                Thin context
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {editing ? (
          <div className="col" style={{ gap: 10 }}>
            <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
            <textarea
              className="input"
              rows={9}
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.55 }}
            />
          </div>
        ) : (
          <div className="col" style={{ gap: 8 }}>
            <strong style={{ fontSize: 13.5 }}>{message.subject}</strong>
            <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--ink-2)", margin: 0 }}>
              {message.body}
            </p>
          </div>
        )}
      </div>

      {!sent && (
        <div className="row spread" style={{ padding: "10px 16px", borderTop: "1px solid var(--line-2)", gap: 8, flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 8 }}>
            {editing ? (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={async () => { await onSave(message.id, { subject, body }); setEditing(false); }}
                >
                  Save changes
                </button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { setEditing(false); setSubject(message.subject); setBody(message.body); }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setEditing(true)}>
                  <Icon name="doc" size={14} /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onRegenerate(message.id)}>
                  <Icon name="refresh" size={14} /> Regenerate
                </button>
              </>
            )}
          </div>
          {message.status === "draft" && !editing && (
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => onApprove([message.id])}>
              Approve
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DraftReview({ campaignId, onChanged }) {
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data: messageData }, { data: generationData }] = await Promise.all([
        api.get(`/campaigns/${campaignId}/messages`),
        api.get(`/campaigns/${campaignId}/generation`),
      ]);
      setMessages(messageData.items ?? []);
      setState(messageData);
      setGeneration(generationData);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load your drafts.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  // Generation is automatic and runs in the background, so the screen polls
  // until it reaches a terminal state. Without this a customer arriving before
  // it finishes would see an empty review screen and no reason why.
  useEffect(() => {
    if (!generation || generation.isTerminal) return undefined;
    const timer = setTimeout(load, 4000);
    return () => clearTimeout(timer);
  }, [generation, load]);

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "That did not work. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const approve = ids => run(() => api.post(`/campaigns/${campaignId}/messages/approve-batch`, { messageIds: ids }));
  const approveAll = () => run(() => api.post(`/campaigns/${campaignId}/messages/approve-batch`, {}));
  const save = (id, patch) => run(() => api.patch(`/campaigns/${campaignId}/messages/${id}`, patch));
  const regenerate = id => run(() => api.post(`/campaigns/${campaignId}/messages/${id}/regenerate`));
  const setAutopilot = enabled => run(() => api.post(`/campaigns/${campaignId}/autopilot`, { enabled }));
  const retryFailed = () => run(() => api.post(`/campaigns/${campaignId}/generation/retry`));

  const counts = state?.counts ?? { draft: 0, approved: 0, sent: 0 };
  const generating = generation && !generation.isTerminal;
  const failedLeads = generation?.failedLeads ?? 0;

  if (loading) {
    return <div className="card" style={{ padding: 20 }}><span className="faint" style={{ fontSize: 13 }}>Loading your drafts…</span></div>;
  }

  return (
    <div className="col" style={{ gap: 12 }} data-tour="campaign-drafts">
      <div className="card" style={{ padding: 16 }}>
        <div className="row spread" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="col" style={{ gap: 3 }}>
            <strong style={{ fontSize: 14 }}>Emails for review</strong>
            <span className="faint" style={{ fontSize: 12.5 }}>
              {generating
                ? `Writing emails… ${generation.processedLeads ?? 0} of ${generation.totalLeads ?? 0} leads done.`
                : `${counts.draft} awaiting approval, ${counts.approved} approved, ${counts.sent} sent.`}
            </span>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {/* The tour highlights this immediately after the first manual
                approval. Turning it on approves everything already waiting. */}
            <button
              className={state?.autopilotEnabled ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
              data-tour="campaign-autopilot"
              disabled={busy}
              onClick={() => setAutopilot(!state?.autopilotEnabled)}
              title={
                state?.autopilotEnabled
                  ? "Turn autopilot off to go back to approving each email yourself."
                  : "Approve every draft waiting now, and auto-approve anything written from here on."
              }
            >
              <Icon name="bolt" size={14} /> {state?.autopilotEnabled ? "Autopilot on" : "Turn on autopilot"}
            </button>

            {counts.draft > 0 && (
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={approveAll}>
                Approve all {counts.draft}
              </button>
            )}
          </div>
        </div>

        {state?.autopilotEnabled && (
          <p className="faint" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
            Autopilot is on for this campaign. New emails are approved as they are written. Safety checks still
            run on every one — an email that fails them is never saved as a draft.
          </p>
        )}

        {failedLeads > 0 && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)", background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <div className="row spread" style={{ gap: 10, flexWrap: "wrap" }}>
              <div className="col" style={{ gap: 2 }}>
                <strong style={{ fontSize: 13, color: "#9a3412" }}>
                  {generation.generatedMessages} written, {failedLeads} lead{failedLeads === 1 ? "" : "s"} failed
                </strong>
                <span style={{ fontSize: 12, color: "#9a3412" }}>
                  {(generation.failures ?? [])[0]?.reason || "The agent could not produce a usable email for these leads."}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={retryFailed}>Retry these</button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="card" style={{ padding: 20 }}>
          <span className="faint" style={{ fontSize: 13 }}>
            {generating
              ? "The agent is writing your emails now. They appear here as they are finished."
              : "No emails yet. They are written automatically once your leads finish enriching."}
          </span>
        </div>
      ) : (
        messages.map(message => (
          <DraftCard
            key={message.id}
            message={message}
            busy={busy}
            onApprove={approve}
            onSave={save}
            onRegenerate={regenerate}
          />
        ))
      )}
    </div>
  );
}
