"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import Spinner from "../ui/Spinner";
import Avatar from "../ui/Avatar";
import api from "../../lib/api";
import { useSetup } from "../../providers/SetupProvider";
import {
  blockersForStep,
  buildLaunchPayload,
  canConfirm,
  confirmationSummary,
  hydrateDraft,
  usesEmail,
  usesVoice,
  visibleSteps,
  warningsForDraft,
} from "../../lib/copilot-model";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Kolkata",
];

const TONES = [
  { value: "consultative", label: "Consultative" },
  { value: "direct", label: "Direct" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "challenger", label: "Challenger" },
];

function Field({ label, hint, children }) {
  return (
    <label className="field copilot-field">
      <span>{label}</span>
      {children}
      {hint ? <span className="copilot-hint">{hint}</span> : null}
    </label>
  );
}

/** Renders whatever the backend actually reported — never an assumed state. */
function ConnectionRow({ icon, name, state, required, onFix }) {
  const connected = Boolean(state?.connected);
  const unavailable = state?.status === "not_configured";
  const tone = connected ? "good" : unavailable ? "neutral" : required ? "warn" : "todo";
  const label = connected
    ? "Connected"
    : unavailable
      ? "Not available"
      : state?.status === "pending"
        ? "In progress"
        : state?.status === "error"
          ? "Needs attention"
          : "Not connected";

  return (
    <div className="copilot-connection">
      <span className="copilot-connection-icon">
        <Icon name={icon} size={17} color={connected ? "var(--g-700)" : "var(--muted)"} />
      </span>
      <div className="copilot-connection-body">
        <div className="copilot-connection-head">
          <strong>{name}</strong>
          <span className={`setup-badge setup-badge-${tone}`}>{label}</span>
          {required ? <span className="copilot-required">Required</span> : null}
        </div>
        <p>{state?.detail || "Status unknown."}</p>
        {state?.label ? <p className="copilot-connection-identity">{state.label}</p> : null}
      </div>
      {!connected && !unavailable ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onFix}>
          Fix
        </button>
      ) : null}
    </div>
  );
}

export default function SetupCopilot() {
  const router = useRouter();
  const {
    copilotOpen,
    closeCopilot,
    integrations,
    counts,
    copilotDraft,
    saveCopilotDraft,
    refresh,
  } = useSetup();

  const [draft, setDraft] = useState(() => hydrateDraft(copilotDraft));
  const [stepIndex, setStepIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [launchNow, setLaunchNow] = useState(false);

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [leadSearch, setLeadSearch] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [usage, setUsage] = useState(null);
  const [usageError, setUsageError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef(null);
  const hydrated = useRef(false);

  useEffect(() => setMounted(true), []);

  // Hydrate from the saved server draft once per opening. Re-hydrating on every
  // copilotDraft change would fight the debounced save and clobber live edits.
  useEffect(() => {
    if (!copilotOpen) {
      hydrated.current = false;
      return;
    }
    if (hydrated.current) return;
    hydrated.current = true;
    setDraft(hydrateDraft(copilotDraft));
  }, [copilotOpen, copilotDraft]);

  // Debounced draft persistence so a refresh or a different device resumes
  // where the customer left off.
  useEffect(() => {
    if (!copilotOpen || result) return undefined;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveCopilotDraft(draft), 900);
    return () => window.clearTimeout(saveTimer.current);
  }, [draft, copilotOpen, result, saveCopilotDraft]);

  const steps = useMemo(() => visibleSteps(draft), [draft]);
  const current = steps[Math.min(stepIndex, steps.length - 1)] ?? steps[0];
  const isLast = stepIndex >= steps.length - 1;

  const set = useCallback((key, value) => {
    setDraft(currentDraft => ({ ...currentDraft, [key]: value }));
    setSubmitError("");
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError("");
    try {
      const { data } = await api.get("/leads");
      setLeads(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setLeadsError(err?.response?.data?.error || "Leads could not be loaded.");
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (copilotOpen && current?.id === "leads" && leads.length === 0 && !leadsLoading && !leadsError) {
      loadLeads();
    }
  }, [copilotOpen, current?.id, leads.length, leadsLoading, leadsError, loadLeads]);

  const loadUsage = useCallback(async () => {
    setUsageError("");
    try {
      const { data } = await api.get("/billing/usage");
      setUsage(data);
    } catch (err) {
      setUsage(null);
      setUsageError(err?.response?.data?.error || "Plan usage could not be loaded.");
    }
  }, []);

  useEffect(() => {
    if (copilotOpen && current?.id === "confirm" && !usage && !usageError) loadUsage();
  }, [copilotOpen, current?.id, usage, usageError, loadUsage]);

  const runPreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const { data } = await api.post("/setup/copilot/preview", {
        channel: draft.channel,
        campaignName: draft.campaignName || "Untitled campaign",
        audience: draft.audience,
        offer: draft.offer,
        tone: draft.tone,
      });
      setPreview(data);
    } catch (err) {
      setPreviewError(err?.response?.data?.error || "The preview could not be generated. You can retry or continue.");
    } finally {
      setPreviewLoading(false);
    }
  }, [draft.channel, draft.campaignName, draft.audience, draft.offer, draft.tone]);

  useEffect(() => {
    if (copilotOpen && current?.id === "preview" && !preview && !previewLoading && !previewError) runPreview();
  }, [copilotOpen, current?.id, preview, previewLoading, previewError, runPreview]);

  const blockers = blockersForStep(current?.id, {
    draft,
    integrations,
    leadCount: counts?.leads ?? 0,
  });
  const warnings = warningsForDraft({ draft, integrations });

  const filteredLeads = useMemo(() => {
    const query = leadSearch.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter(lead =>
      [lead.name, lead.firstName, lead.lastName, lead.email, lead.company]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query)),
    );
  }, [leads, leadSearch]);

  const toggleLead = id => {
    setDraft(currentDraft => {
      const selected = new Set(currentDraft.selectedLeadIds ?? []);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { ...currentDraft, selectedLeadIds: Array.from(selected) };
    });
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const { data } = await api.post("/setup/copilot/campaign", buildLaunchPayload(draft, { launch: launchNow }));
      setResult(data);
      refresh({ silent: true });
    } catch (err) {
      const details = err?.response?.data?.details?.blockers;
      setSubmitError(
        Array.isArray(details) && details.length > 0
          ? details.join(" ")
          : err?.response?.data?.error || "The campaign could not be created. Nothing was launched.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    closeCopilot();
    setResult(null);
    setConfirmed(false);
    setSubmitError("");
    setStepIndex(0);
    setPreview(null);
    setPreviewError("");
  };

  if (!mounted || !copilotOpen) return null;

  const emailOn = usesEmail(draft.channel);
  const voiceOn = usesVoice(draft.channel);

  return createPortal(
    <div className="copilot-root" role="dialog" aria-modal="true" aria-labelledby="copilot-title">
      <div className="copilot-scrim" onClick={close} aria-hidden="true" />

      <div className="copilot-panel card">
        <header className="copilot-head">
          <div className="copilot-head-copy">
            <span className="copilot-eyebrow">
              <Icon name="spark" size={14} color="var(--g-700)" /> Setup Copilot
            </span>
            <h2 id="copilot-title">{result ? "Campaign created" : current?.title}</h2>
          </div>
          <button type="button" className="tour-close" onClick={close} aria-label="Close Setup Copilot">
            <Icon name="close" size={17} />
          </button>
        </header>

        {!result ? (
          <div className="copilot-rail" aria-hidden="true">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`copilot-rail-dot ${index === stepIndex ? "is-active" : ""} ${index < stepIndex ? "is-done" : ""}`}
              />
            ))}
          </div>
        ) : null}

        <div className="copilot-scroll">
          {result ? (
            <div className="copilot-result">
              <span className={`copilot-result-mark ${result.launched ? "is-live" : ""}`}>
                <Icon name={result.launched ? "play" : "check"} size={22} color="#06231a" />
              </span>
              <h3>
                {result.launched
                  ? `“${result.campaign?.name}” is live.`
                  : `“${result.campaign?.name}” was saved as a draft.`}
              </h3>
              <p>
                {result.leadsAssigned} lead{result.leadsAssigned === 1 ? "" : "s"} assigned
                {result.stepsSaved > 0 ? ` · ${result.stepsSaved} sequence step${result.stepsSaved === 1 ? "" : "s"} saved` : ""}
                {result.launched ? " · sending within your business hours" : " · nothing will send until you launch it"}.
              </p>

              {result.launchError ? (
                <div className="notice-warn copilot-notice">
                  The campaign was created but could not be launched: {result.launchError}
                </div>
              ) : null}

              {(result.warnings ?? []).map(warning => (
                <div key={warning} className="copilot-note">{warning}</div>
              ))}

              <div className="copilot-result-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    close();
                    router.push(`/campaigns/${result.campaign?.id}`);
                  }}
                >
                  Open campaign
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
                  Back to setup
                </button>
              </div>
            </div>
          ) : (
            <>
              {current?.id === "channel" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">
                    How should this campaign reach people? You can run both — leads with an email get the sequence,
                    leads with a phone number get called.
                  </p>
                  <div className="copilot-choices">
                    {[
                      { value: "email", icon: "mail", title: "Email", body: "A personalised sequence with follow-ups." },
                      { value: "voice", icon: "phone", title: "AI calls", body: "An AI caller that discloses itself and books meetings." },
                      { value: "both", icon: "spark", title: "Both", body: "Email and calls from one campaign." },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`copilot-choice ${draft.channel === option.value ? "is-active" : ""}`}
                        onClick={() => set("channel", option.value)}
                        aria-pressed={draft.channel === option.value}
                      >
                        <span className="copilot-choice-icon">
                          <Icon name={option.icon} size={19} color="var(--g-700)" />
                        </span>
                        <strong>{option.title}</strong>
                        <span>{option.body}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {current?.id === "connections" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">
                    These are read live from your account. A tool only shows as connected when it genuinely is.
                  </p>
                  {!integrations ? (
                    <div className="copilot-loading"><Spinner size={18} /> Checking connections…</div>
                  ) : (
                    <div className="copilot-connections">
                      <ConnectionRow
                        icon="mail"
                        name="Gmail"
                        state={integrations.gmail}
                        required={emailOn}
                        onFix={() => { close(); router.push("/settings"); }}
                      />
                      <ConnectionRow
                        icon="calendar"
                        name="Google Calendar"
                        state={integrations.calendar}
                        required={false}
                        onFix={() => { close(); router.push("/calendar"); }}
                      />
                      {voiceOn ? (
                        <ConnectionRow
                          icon="phone"
                          name="AI calling"
                          state={integrations.retell}
                          required
                          onFix={() => { close(); router.push("/settings"); }}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}

              {current?.id === "audience" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">
                    Describe who this campaign targets. Apollo enrichment uses this to fill in company size,
                    technologies, and hiring signals, so the agent can reference something real instead of a template.
                  </p>
                  {integrations?.apollo?.status === "not_configured" ? (
                    <div className="copilot-note">
                      Apollo is not enabled on this workspace. Your campaign will use the lead data you already have.
                    </div>
                  ) : (
                    <div className="copilot-note">{integrations?.apollo?.detail}</div>
                  )}
                  <Field
                    label="Target audience"
                    hint="Example: US SaaS companies, 51–500 employees, VP Sales or Head of Revenue."
                  >
                    <textarea
                      className="input copilot-textarea"
                      value={draft.audience}
                      onChange={event => set("audience", event.target.value)}
                      maxLength={600}
                      placeholder="Who should this campaign contact?"
                    />
                  </Field>
                  <Field label="What you're offering them" hint="One or two lines. This anchors every message.">
                    <textarea
                      className="input copilot-textarea"
                      value={draft.offer}
                      onChange={event => set("offer", event.target.value)}
                      maxLength={1200}
                      placeholder="The specific outcome you're offering in this campaign."
                    />
                  </Field>
                </div>
              ) : null}

              {current?.id === "voice" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">Confirm how the AI caller behaves on this campaign.</p>
                  <div className="copilot-facts">
                    <div>
                      <span>Voice agent</span>
                      <strong>{integrations?.retell?.agentReady ? "Ready" : "Not created yet"}</strong>
                    </div>
                    <div>
                      <span>Calling number</span>
                      <strong>{integrations?.retell?.phoneNumber || "Not provisioned"}</strong>
                    </div>
                    <div>
                      <span>Language</span>
                      <strong>English (US)</strong>
                    </div>
                    <div>
                      <span>AI disclosure</span>
                      <strong>Always on</strong>
                    </div>
                  </div>
                  <div className="copilot-note">
                    Every call opens by disclosing that the caller is an AI assistant and asks before recording.
                    Leads marked do-not-call are never dialled.
                  </div>
                  <Field label="Calling mode">
                    <select className="input" value={draft.voiceMode} onChange={event => set("voiceMode", event.target.value)}>
                      <option value="ai">AI caller places the calls</option>
                      <option value="manual">Manual — build the call list for a human</option>
                    </select>
                  </Field>
                  <Field label="Calls per hour" hint="A conservative cadence protects your number's reputation.">
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="60"
                      value={draft.callCadencePerHour}
                      onChange={event => set("callCadencePerHour", event.target.value)}
                    />
                  </Field>
                </div>
              ) : null}

              {current?.id === "leads" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">Pick who this campaign contacts. You can add more later.</p>

                  {leadsLoading ? (
                    <div className="copilot-loading"><Spinner size={18} /> Loading your leads…</div>
                  ) : leadsError ? (
                    <div className="copilot-error">
                      <span>{leadsError}</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={loadLeads}>Retry</button>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="copilot-empty">
                      <Icon name="users" size={26} color="var(--faint)" />
                      <strong>No leads yet</strong>
                      <p>Import a CSV, add someone manually, or run an Apollo search from Prospects.</p>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => { close(); router.push("/prospects"); }}>
                        Go to Prospects
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="input-wrap copilot-search">
                        <span className="lead-ico"><Icon name="search" size={15} /></span>
                        <input
                          className="input has-ico"
                          placeholder="Search leads by name, email, or company…"
                          value={leadSearch}
                          onChange={event => setLeadSearch(event.target.value)}
                        />
                      </div>
                      <div className="copilot-lead-list">
                        {filteredLeads.slice(0, 100).map(lead => {
                          const name = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed";
                          const checked = (draft.selectedLeadIds ?? []).includes(lead.id);
                          const suppressed = lead.emailUnsubscribed || lead.doNotEmail || lead.doNotCall;
                          return (
                            <button
                              key={lead.id}
                              type="button"
                              className={`copilot-lead-row ${checked ? "is-selected" : ""}`}
                              onClick={() => toggleLead(lead.id)}
                              aria-pressed={checked}
                            >
                              <span className="copilot-lead-check">
                                {checked ? <Icon name="check" size={12} color="#fff" stroke={3} /> : null}
                              </span>
                              <Avatar name={name} size={28} />
                              <span className="copilot-lead-copy">
                                <strong>{name}</strong>
                                <span>{lead.email || lead.phone || "No contact details"}{lead.company ? ` · ${lead.company}` : ""}</span>
                              </span>
                              {suppressed ? <span className="setup-badge setup-badge-warn">Suppressed</span> : null}
                            </button>
                          );
                        })}
                      </div>
                      <p className="copilot-hint">
                        {(draft.selectedLeadIds ?? []).length} selected
                        {filteredLeads.length > 100 ? ` · showing first 100 of ${filteredLeads.length}` : ""}
                      </p>
                    </>
                  )}
                </div>
              ) : null}

              {current?.id === "campaign" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">The name, tone, schedule, and follow-up rules for this campaign.</p>
                  <Field label="Campaign name" hint="Something you'll recognise in reports later.">
                    <input
                      className="input"
                      value={draft.campaignName}
                      onChange={event => set("campaignName", event.target.value)}
                      maxLength={120}
                      placeholder="Series B SaaS VP Sales — Q3"
                    />
                  </Field>

                  <div className="copilot-grid">
                    <Field label="Tone">
                      <select className="input" value={draft.tone} onChange={event => set("tone", event.target.value)}>
                        {TONES.map(tone => <option key={tone.value} value={tone.value}>{tone.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Timezone">
                      <select className="input" value={draft.timezone} onChange={event => set("timezone", event.target.value)}>
                        {TIMEZONES.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                      </select>
                    </Field>
                    <Field label="Sending window starts">
                      <input className="input" type="time" value={draft.businessHoursStart} onChange={event => set("businessHoursStart", event.target.value)} />
                    </Field>
                    <Field label="Sending window ends">
                      <input className="input" type="time" value={draft.businessHoursEnd} onChange={event => set("businessHoursEnd", event.target.value)} />
                    </Field>
                    <Field label="Maximum leads">
                      <input className="input" type="number" min="1" max="10000" value={draft.maxLeads} onChange={event => set("maxLeads", event.target.value)} />
                    </Field>
                    {emailOn ? (
                      <Field label="Daily send cap" hint="Conservative caps protect deliverability on a new domain.">
                        <input className="input" type="number" min="1" max="500" value={draft.dailySendCap} onChange={event => set("dailySendCap", event.target.value)} />
                      </Field>
                    ) : null}
                  </div>

                  {emailOn ? (
                    <div className="copilot-sequence">
                      <div className="copilot-sequence-head">
                        <strong>Follow-up rules</strong>
                        <span>The sequence stops automatically on a reply, bounce, unsubscribe, or booked meeting.</span>
                      </div>
                      {(draft.followUps ?? []).map((step, index) => (
                        <div key={index} className="copilot-sequence-step">
                          <div className="copilot-sequence-step-head">
                            <span className="copilot-step-number">{index + 1}</span>
                            <strong>{index === 0 ? "Opening email" : `Follow-up ${index}`}</strong>
                            <label className="copilot-delay">
                              after
                              <input
                                className="input"
                                type="number"
                                min="0"
                                max="90"
                                value={step.delayDays}
                                onChange={event => {
                                  const value = Number(event.target.value) || 0;
                                  set("followUps", draft.followUps.map((item, i) => (i === index ? { ...item, delayDays: value } : item)));
                                }}
                              />
                              days
                            </label>
                            {(draft.followUps ?? []).length > 1 ? (
                              <button
                                type="button"
                                className="setup-step-link"
                                onClick={() => set("followUps", draft.followUps.filter((_, i) => i !== index))}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <input
                            className="input"
                            placeholder={index === 0 ? "Subject: Quick question about {{company}}" : "Subject: Re: my last note"}
                            value={step.subjectTemplate}
                            onChange={event => set("followUps", draft.followUps.map((item, i) => (i === index ? { ...item, subjectTemplate: event.target.value } : item)))}
                            maxLength={500}
                          />
                          <textarea
                            className="input copilot-textarea"
                            placeholder="What this email should cover. The agent personalises it per lead."
                            value={step.bodyPromptContext}
                            onChange={event => set("followUps", draft.followUps.map((item, i) => (i === index ? { ...item, bodyPromptContext: event.target.value } : item)))}
                            maxLength={4000}
                          />
                        </div>
                      ))}
                      {(draft.followUps ?? []).length < 10 ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => set("followUps", [...(draft.followUps ?? []), { delayDays: 3, subjectTemplate: "", bodyPromptContext: "" }])}
                        >
                          <Icon name="plus" size={14} /> Add follow-up
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {current?.id === "preview" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">
                    A sample of what this campaign will say. Each real message is personalised per lead at send time —
                    nothing has been sent.
                  </p>

                  {previewLoading ? (
                    <div className="copilot-loading"><Spinner size={18} /> Generating a preview…</div>
                  ) : previewError ? (
                    <div className="copilot-error">
                      <span>{previewError}</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={runPreview}>Retry</button>
                    </div>
                  ) : preview ? (
                    <>
                      {!preview.generated ? <div className="notice-warn copilot-notice">{preview.note}</div> : null}
                      {preview.email ? (
                        <div className="copilot-preview">
                          <div className="copilot-preview-head"><Icon name="mail" size={15} color="var(--g-700)" /> Email</div>
                          <div className="copilot-preview-subject">{preview.email.subject}</div>
                          <pre className="copilot-preview-body">{preview.email.body}</pre>
                        </div>
                      ) : null}
                      {preview.call ? (
                        <div className="copilot-preview">
                          <div className="copilot-preview-head"><Icon name="phone" size={15} color="var(--g-700)" /> Call opening</div>
                          <pre className="copilot-preview-body">{preview.call.opening}{"\n"}{preview.call.disclosure}</pre>
                          {preview.call.discovery?.length ? (
                            <ul className="copilot-preview-list">
                              {preview.call.discovery.map(question => <li key={question}>{question}</li>)}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                      {preview.generated ? <p className="copilot-hint">{preview.note}</p> : null}
                      <button type="button" className="setup-step-link" onClick={runPreview}>Regenerate preview</button>
                    </>
                  ) : null}
                </div>
              ) : null}

              {current?.id === "confirm" ? (
                <div className="copilot-step">
                  <p className="copilot-lead">Last check before anything is created.</p>

                  <div className="copilot-facts">
                    <div><span>Campaign</span><strong>{draft.campaignName || "Untitled"}</strong></div>
                    <div><span>Channel</span><strong>{draft.channel === "both" ? "Email + AI calls" : draft.channel === "voice" ? "AI calls" : "Email"}</strong></div>
                    <div><span>Leads</span><strong>{(draft.selectedLeadIds ?? []).length}</strong></div>
                    <div><span>Sending window</span><strong>{draft.businessHoursStart}–{draft.businessHoursEnd} {draft.timezone}</strong></div>
                    {emailOn ? <div><span>Daily send cap</span><strong>{draft.dailySendCap}</strong></div> : null}
                    {voiceOn ? <div><span>Calls per hour</span><strong>{draft.callCadencePerHour}</strong></div> : null}
                  </div>

                  <div className="copilot-usage">
                    <strong>Plan and usage</strong>
                    {usageError ? (
                      <div className="copilot-error">
                        <span>{usageError}</span>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={loadUsage}>Retry</button>
                      </div>
                    ) : !usage ? (
                      <div className="copilot-loading"><Spinner size={16} /> Loading usage…</div>
                    ) : (
                      <ul>
                        <li>Plan: <strong>{usage.plan}</strong> ({usage.subscriptionStatus})</li>
                        <li>Emails sent this month: <strong>{usage.emailsSentThisMonth}</strong></li>
                        <li>Active campaigns: <strong>{usage.activeCampaigns}</strong></li>
                      </ul>
                    )}
                  </div>

                  {warnings.map(warning => <div key={warning} className="copilot-note">{warning}</div>)}

                  <label className="copilot-launch-toggle">
                    <input type="checkbox" checked={launchNow} onChange={event => setLaunchNow(event.target.checked)} />
                    <span>
                      <strong>Launch immediately after creating</strong>
                      <span>Leave this off to create a draft and review it first.</span>
                    </span>
                  </label>

                  <label className="copilot-confirm">
                    <input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />
                    <span>{confirmationSummary(draft, { launch: launchNow })}</span>
                  </label>

                  {submitError ? <div className="notice-warn copilot-notice">{submitError}</div> : null}
                </div>
              ) : null}

              {blockers.length > 0 ? (
                <div className="copilot-blockers">
                  {blockers.map(blocker => (
                    <div key={blocker} className="copilot-blocker">
                      <Icon name="alertCircle" size={15} color="#c2410c" /> {blocker}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        {!result ? (
          <footer className="copilot-foot">
            <button type="button" className="setup-step-link" onClick={close}>Save and close</button>
            <div className="copilot-foot-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStepIndex(index => Math.max(0, index - 1))}
                disabled={stepIndex === 0 || submitting}
              >
                Back
              </button>
              {isLast ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={submit}
                  disabled={submitting || !canConfirm({ draft, integrations, leadCount: counts?.leads ?? 0, confirmed })}
                >
                  {submitting ? <Spinner size={15} /> : <Icon name="check" size={15} color="#06231a" />}
                  {submitting ? "Creating…" : launchNow ? "Create and launch" : "Create draft"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setStepIndex(index => Math.min(steps.length - 1, index + 1))}
                  disabled={blockers.length > 0}
                >
                  Next <Icon name="arrow" size={15} color="#06231a" />
                </button>
              )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
