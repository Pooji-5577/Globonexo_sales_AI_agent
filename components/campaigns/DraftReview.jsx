"use client";

/**
 * Draft review.
 *
 * This replaced the separate "skim your leads" step in the setup arc: every
 * draft shows the person it is addressed to, their title, company and address,
 * so the recipient can be verified without leaving the screen.
 *
 * Three things the design has to make unmissable. Approve all, because a first
 * campaign carries thirty drafts and approving them one at a time is not a
 * reasonable ask. The failure count, because generation is automatic - if
 * two leads produced nothing, nobody pressed a button that could have told
 * them, and a silently uncontacted lead is one the customer paid to enrich.
 *
 * And the thin-context pile, for the same reason as the failure count. These
 * are the emails autopilot refuses to send, so they are waiting on a person who
 * may well believe nothing is waiting on them. Every bulk control here counts
 * them separately and leaves them behind - "Approve all" that swept them up
 * would be the fastest way to make the hold meaningless.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { formatScheduledInTimezone } from "../../lib/campaign-display";

const STEP_LABELS = { 1: "First touch", 2: "Follow-up", 3: "Final follow-up" };

function stepLabel(stepNumber) {
  return STEP_LABELS[stepNumber] ?? `Follow-up ${stepNumber - 1}`;
}

function stepTiming(delayDays) {
  if (!Number(delayDays)) return "Send immediately";
  return `Send on Day ${delayDays}`;
}

const THIN_CHIP = { bg: "#fef9c3", color: "#854d0e" };

// An approved email with no send slot is the worst state this screen can be
// in: it looks finished and does nothing. Naming the reason in plain words is
// the difference between a customer fixing it and a customer never finding out.
const BLOCKED_REASONS = {
  timezone_required: "We could not work out a send time for this lead, so it is not scheduled yet.",
  campaign_not_active: "This campaign is not active, so nothing is scheduled yet. Launch it to start sending.",
  campaign_paused: "This campaign is paused. Resume it to schedule this email.",
  not_approved: "This email is not approved yet, so it will not send.",
  sequence_stopped: "This lead replied or opted out, so the rest of the sequence was stopped.",
  email_not_sent: "The last send attempt did not go through.",
};

function blockedMessage(reason) {
  if (!reason) return null;
  return BLOCKED_REASONS[reason] ?? "This email is not scheduled yet.";
}

function thinTitle(message) {
  return `We had ${message.contextScore ?? 0} of ${message.contextScoreMax ?? 10} optional details for this lead, so this email is deliberately short and role-based rather than padded with guesses. Autopilot will not send it. You decide whether it goes out.`;
}

// A thin draft says "needs your OK" rather than "needs review", because the two
// are different asks: autopilot can take a review off the customer's hands and
// cannot take this one.
function StatusChip({ status, approvedBy, thinContext }) {
  const styles = {
    draft: thinContext
      ? { label: "Needs your OK", ...THIN_CHIP }
      : { label: "Needs review", bg: "#fff7ed", color: "#9a3412" },
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

function DraftRow({ message, displayTimezone, onApprove, onSendThin, onSave, onRegenerate, busy }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState(message.subject);
  const [body, setBody] = useState(message.body);
  const lead = message.lead ?? {};
  const sent = message.status === "sent";
  const scheduledAt = message.schedule?.scheduledAt;
  const selectedTime = formatScheduledInTimezone(scheduledAt, displayTimezone);
  const leadTime = message.schedule?.leadTimezone && message.schedule.leadTimezone !== displayTimezone
    ? formatScheduledInTimezone(scheduledAt, message.schedule.leadTimezone)
    : null;

  useEffect(() => {
    setSubject(message.subject);
    setBody(message.body);
  }, [message.subject, message.body]);

  return (
    <div className="campaign-email-row">
      <button
        type="button"
        className="campaign-email-summary"
        aria-expanded={expanded || editing}
        onClick={() => !editing && setExpanded(value => !value)}
      >
        <Avatar name={lead.name || "Unnamed lead"} size={40} />
        <span className="campaign-email-copy">
          <strong>{message.subject || "No subject"}</strong>
          <span className="faint campaign-email-recipient">
            {lead.name || "Unnamed lead"}{lead.company ? ` at ${lead.company}` : ""}
          </span>
          <span className="faint campaign-email-preview">{message.body}</span>
        </span>
        <span className="campaign-email-state">
          {/* On the collapsed row, not only inside the detail: an email you have
              to open to discover is unreviewed is one nobody reviews. */}
          {message.thinContext && (
            <span className="chip" style={{ background: THIN_CHIP.bg, color: THIN_CHIP.color, fontSize: 11, fontWeight: 700 }} title={thinTitle(message)}>
              Thin context
            </span>
          )}
          <StatusChip status={message.status} approvedBy={message.approvedBy} thinContext={message.thinContext} />
          <span className={expanded || editing ? "campaign-email-expand-icon is-open" : "campaign-email-expand-icon"}>
            <Icon name="arrow" size={15} />
          </span>
        </span>
      </button>

      {(expanded || editing) && (
        <div className="campaign-email-detail">
          <div className="row spread campaign-email-meta" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="col" style={{ gap: 2, minWidth: 0 }}>
              <strong style={{ fontSize: 13.5 }}>{lead.name || "Unnamed lead"}</strong>
              <span className="faint" style={{ fontSize: 12 }}>
                {[lead.title, lead.company].filter(Boolean).join(" at ") || "No title or company"}
              </span>
              <span className="faint" style={{ fontSize: 11.5 }}>{lead.email}</span>
              {selectedTime ? (
                <span style={{ fontSize: 11.5, color: "var(--g-700)", fontWeight: 700, marginTop: 3 }}>
                  <Icon name="clock" size={12} /> {message.schedule?.status === "sent" ? "Sent" : "Scheduled"} {selectedTime} · your timezone
                </span>
              ) : null}
              {leadTime ? <span className="faint" style={{ fontSize: 11 }}>Lead local time: {leadTime}</span> : null}
              {/* Scheduled, but in the campaign's hours rather than the lead's,
                  because we do not know where they are. Saying so stops the
                  time above from reading as a fact about the prospect. */}
              {selectedTime && !message.schedule?.leadTimezone ? (
                <span className="faint" style={{ fontSize: 11 }}>
                  Sent during your business hours. We do not know this lead&apos;s timezone.
                </span>
              ) : null}
              {!selectedTime && !sent && blockedMessage(message.schedule?.blockedReason) ? (
                <span style={{ fontSize: 11.5, color: "#9a3412", marginTop: 3, lineHeight: 1.5 }}>
                  <Icon name="clock" size={12} /> Not scheduled: {blockedMessage(message.schedule.blockedReason)}
                </span>
              ) : null}
            </div>
            {/* The chip is already on the collapsed row, so the space here is
                better spent saying what it means and what happens next. */}
            {message.thinContext && message.status !== "sent" && (
              <span style={{ fontSize: 11.5, color: THIN_CHIP.color, maxWidth: 340, lineHeight: 1.5 }}>
                We returned {message.contextScore ?? 0} of {message.contextScoreMax ?? 10} optional details for this lead, so this email is
                short and role-based rather than padded with guesses. Your agent will not send it on its own.
              </span>
            )}
          </div>

          <div style={{ padding: "14px 16px" }}>
            {editing ? (
              <div className="col" style={{ gap: 10 }}>
                <input className="input" value={subject} onChange={event => setSubject(event.target.value)} placeholder="Subject" />
                <textarea
                  className="input"
                  rows={9}
                  value={body}
                  onChange={event => setBody(event.target.value)}
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
            <div className="row spread campaign-email-actions" style={{ gap: 8, flexWrap: "wrap" }}>
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
                message.thinContext ? (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={busy}
                    onClick={() => onSendThin([message.id])}
                    title="Send this email even though we know little about the lead. Any follow-ups to this person go with it, so you are not asked again."
                  >
                    Send anyway
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => onApprove([message.id])}>
                    Approve
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepSection({ step, messages, displayTimezone, onApprove, onSendThin, onSave, onRegenerate, busy }) {
  // Thin drafts are deliberately not in this list. Approving a step is a bulk
  // judgement about copy the agent wrote well; the thin ones are the copy it
  // could not write well, and sweeping them in here would quietly undo the
  // whole point of holding them back.
  const draftIds = messages
    .filter(message => message.status === "draft" && !message.thinContext)
    .map(message => message.id);

  return (
    <section className="campaign-email-step" aria-labelledby={`campaign-email-step-${step.stepNumber}`}>
      <div className="campaign-email-step-head">
        <span className="campaign-email-step-number">{String(step.stepNumber).padStart(2, "0")}</span>
        <span className="campaign-email-step-title">
          <strong id={`campaign-email-step-${step.stepNumber}`}>Step {step.stepNumber} · {stepLabel(step.stepNumber)}</strong>
          <span className="faint">{stepTiming(step.delayDays)} · {messages.length} email{messages.length === 1 ? "" : "s"} ready</span>
        </span>
        {draftIds.length > 0 && (
          <button className="campaign-email-step-action" type="button" disabled={busy} onClick={() => onApprove(draftIds)}>
            Approve {draftIds.length} draft{draftIds.length === 1 ? "" : "s"}
          </button>
        )}
      </div>
      {step.bodyPromptContext && <p className="campaign-email-step-instruction">{step.bodyPromptContext}</p>}
      <div>
        {messages.map(message => (
          <DraftRow
            key={message.id}
            message={message}
            displayTimezone={displayTimezone || message.schedule?.displayTimezone}
            busy={busy}
            onApprove={onApprove}
            onSendThin={onSendThin}
            onSave={onSave}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>
    </section>
  );
}

export default function DraftReview({ campaignId, displayTimezone, onChanged }) {
  const [messages, setMessages] = useState([]);
  const [sequenceSteps, setSequenceSteps] = useState([]);
  const [state, setState] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data: messageData }, { data: generationData }, { data: stepData }] = await Promise.all([
        api.get(`/campaigns/${campaignId}/messages`),
        api.get(`/campaigns/${campaignId}/generation`),
        api.get(`/campaigns/${campaignId}/steps`),
      ]);
      setMessages(messageData.items ?? []);
      setSequenceSteps(stepData.items ?? []);
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

  // Lead preparation is a streaming pipeline: another lead may finish after
  // the latest generation run reached a terminal state. Keep the visible
  // campaign review synchronized so each email appears while other leads are
  // still enriching or researching, without requiring a page refresh.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [load]);

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
  // No ids means every thin-context email in the campaign. With ids, the server
  // also picks up the same leads' follow-ups, so one decision per person.
  const sendThin = ids => run(() => api.post(`/campaigns/${campaignId}/messages/send-thin-context`, ids ? { messageIds: ids } : {}));
  const save = (id, patch) => run(() => api.patch(`/campaigns/${campaignId}/messages/${id}`, patch));
  const regenerate = id => run(() => api.post(`/campaigns/${campaignId}/messages/${id}/regenerate`));
  const setAutopilot = enabled => run(() => api.post(`/campaigns/${campaignId}/autopilot`, { enabled }));
  const retryFailed = () => run(() => api.post(`/campaigns/${campaignId}/generation/retry`));

  const counts = state?.counts ?? { draft: 0, approved: 0, sent: 0, thinWaiting: 0 };
  const thinWaiting = counts.thinWaiting ?? 0;
  // Drafts autopilot or Approve all can still clear on the customer's behalf.
  const ordinaryDrafts = Math.max(0, counts.draft - thinWaiting);
  const generating = generation && !generation.isTerminal;
  const failedLeads = generation?.failedLeads ?? 0;
  const messageGroups = useMemo(() => {
    const stepByNumber = new Map(sequenceSteps.map(step => [Number(step.stepNumber), step]));
    const grouped = new Map();

    for (const message of messages) {
      const stepNumber = Number(message.stepNumber) || 1;
      if (!grouped.has(stepNumber)) grouped.set(stepNumber, []);
      grouped.get(stepNumber).push(message);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left - right)
      .map(([stepNumber, stepMessages]) => ({
        step: stepByNumber.get(stepNumber) ?? { stepNumber, delayDays: stepNumber === 1 ? 0 : null, bodyPromptContext: "" },
        messages: stepMessages,
      }));
  }, [messages, sequenceSteps]);

  if (loading) {
    return <div className="card" style={{ padding: 20 }}><span className="faint" style={{ fontSize: 13 }}>Loading your drafts…</span></div>;
  }

  return (
    <div className="col" style={{ gap: 12 }} data-tour="campaign-drafts">
      <div className="card" style={{ padding: 16 }}>
        <div className="row spread" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="col" style={{ gap: 3 }}>
            <strong style={{ fontSize: 14 }}>Generated emails · {messages.length} ready</strong>
            <span className="faint" style={{ fontSize: 12.5 }}>
              {generating
                ? `Writing emails… ${generation.processedLeads ?? 0} of ${generation.totalLeads ?? 0} leads done.`
                : `${ordinaryDrafts} awaiting approval, ${counts.approved} approved, ${counts.sent} sent`
                  + (thinWaiting > 0 ? `, ${thinWaiting} needing your OK.` : ".")}
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

            {ordinaryDrafts > 0 && (
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={approveAll}>
                Approve all {ordinaryDrafts}
              </button>
            )}
          </div>
        </div>

        {state?.autopilotEnabled && (
          <p className="faint" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
            Autopilot is on for this campaign. New emails are approved as they are written. Safety checks still
            run on every one. An email that fails them is never saved as a draft. Emails written from thin
            context are the exception: autopilot never sends those, so they wait here for you.
          </p>
        )}

        {/* The pile has to be visible from the top of the screen. A customer who
            believes autopilot has everything in hand has no reason to scroll. */}
        {thinWaiting > 0 && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)", background: "#fefce8", border: "1px solid #fde68a" }}>
            <div className="row spread" style={{ gap: 10, flexWrap: "wrap" }}>
              <div className="col" style={{ gap: 2 }}>
                <strong style={{ fontSize: 13, color: "#854d0e" }}>
                  {thinWaiting} email{thinWaiting === 1 ? "" : "s"} need{thinWaiting === 1 ? "s" : ""} your OK
                </strong>
                <span style={{ fontSize: 12, color: "#854d0e", lineHeight: 1.5 }}>
                  We returned very little about these leads, so the emails are short and generic. Your agent
                  will not send them on its own. Read them and send the ones that work, or narrow your targeting
                  and import better-matched leads.
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={busy}
                onClick={() => sendThin(null)}
                title="Approve and schedule every thin-context email in this campaign, follow-ups included."
              >
                Send all {thinWaiting} anyway
              </button>
            </div>
          </div>
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
        <div className="campaign-email-sequence">
          {messageGroups.map(({ step, messages: stepMessages }) => (
            <StepSection
              key={step.stepNumber}
              step={step}
              messages={stepMessages}
              displayTimezone={displayTimezone}
              busy={busy}
              onApprove={approve}
              onSendThin={sendThin}
              onSave={save}
              onRegenerate={regenerate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
