"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import Spinner from "../../../../components/ui/Spinner";

const DEFAULT_FORM = {
  name: "",
  channel: "email",
  promptNotes: "",
  maxLeads: 100,
  dailySendCap: 75,
  callCadencePerHour: 5,
  voiceMode: "ai",
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  timezone: "America/New_York",
  allowedWeekdays: [1, 2, 3, 4, 5],
  leadPreparationWeekdays: [0, 6],
  weeklyQualifiedLeadTarget: 50,
  voicePermissionConfirmed: false,
  maxCallAttempts: 3,
};

// The backend accepts 1-10 steps. Step numbers are derived from list position
// at render and submit time rather than stored, so adding or removing a step
// can't leave the sequence with gaps or duplicates.
const MIN_STEPS = 1;
const MAX_STEPS = 10;
const DEFAULT_FOLLOW_UP_DELAY_DAYS = 3;

// A deterministic counter (rather than a random id) keeps the server and
// client renders identical during hydration.
let stepUidCounter = 0;
const nextStepUid = () => `step-${stepUidCounter++}`;

function makeStep(delayDays) {
  return { uid: nextStepUid(), delayDays, subjectTemplate: "", bodyPromptContext: "" };
}

function normalizeSteps(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list.slice(0, MAX_STEPS).map((step, index) => ({
    uid: nextStepUid(),
    delayDays: Number.isFinite(Number(step?.delayDays)) ? Number(step.delayDays) : index === 0 ? 0 : DEFAULT_FOLLOW_UP_DELAY_DAYS,
    subjectTemplate: step?.subjectTemplate || "",
    bodyPromptContext: step?.bodyPromptContext || "",
  }));
}

const DEFAULT_STEPS = [makeStep(0), makeStep(3), makeStep(5)];

const DEFAULT_MANUAL_LEAD = {
  firstName: "",
  lastName: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
};

const FALLBACK_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Kolkata",
];

const DRAFT_STORAGE_KEY = "globonexo:new-campaign-draft";

const usesEmail = channel => channel === "email";
const usesVoice = channel => channel === "voice";
const WEEKDAYS = [
  { value: 0, label: "S", title: "Sunday" }, { value: 1, label: "M", title: "Monday" },
  { value: 2, label: "T", title: "Tuesday" }, { value: 3, label: "W", title: "Wednesday" },
  { value: 4, label: "Th", title: "Thursday" }, { value: 5, label: "F", title: "Friday" },
  { value: 6, label: "Sa", title: "Saturday" },
];

function parseCadenceDelays(cadence) {
  if (!cadence) return null;
  const days = (cadence.match(/\d+/g) || []).map(Number);
  return days.length === 3 ? days : null;
}

// Drafts saved before the ICP source field was removed still carry one. Fold
// it into the prompt notes rather than posting a value with nowhere to see or
// edit it, and drop the key so it doesn't linger in storage.
function migrateIcpSource(savedForm) {
  const icpSource = (savedForm.icpSource || "").trim();
  if (!icpSource) return { icpSource: undefined };

  const promptNotes = (savedForm.promptNotes || "").trim();
  if (promptNotes.includes(icpSource)) return { icpSource: undefined };

  const merged = promptNotes ? `Target audience: ${icpSource}\n\n${promptNotes}` : `Target audience: ${icpSource}`;
  return { icpSource: undefined, promptNotes: merged.slice(0, 2000) };
}

function Field({ label, children, hint, ...rest }) {
  return (
    <label className="field campaign-new-field" {...rest}>
      <span>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12.5, color: "var(--faint)", lineHeight: 1.45 }}>{hint}</span>}
    </label>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const setupRef = useRef(null);
  const controlsRef = useRef(null);
  const emailSequenceRef = useRef(null);
  const assignLeadsRef = useRef(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const [allLeads, setAllLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [leadSearch, setLeadSearch] = useState("");
  const [manualLead, setManualLead] = useState(DEFAULT_MANUAL_LEAD);
  const [addingManualLead, setAddingManualLead] = useState(false);
  const [manualLeadError, setManualLeadError] = useState("");
  const setupReady = form.name.trim().length >= 3;
  const emailEnabled = usesEmail(form.channel);
  const voiceEnabled = usesVoice(form.channel);
  const timezones = useMemo(() => {
    try { return Intl.supportedValuesOf("timeZone"); } catch { return FALLBACK_TIMEZONES; }
  }, []);

  useEffect(() => {
    api.get("/leads")
      .then(({ data }) => setAllLeads(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setAllLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

  // Restore any in-progress draft first. Only fall back to the onboarding
  // cadence defaults when there's no draft to restore - otherwise the async
  // onboarding fetch resolves after the restore and silently overwrites
  // whatever delay values the user had already customized.
  useEffect(() => {
    let restoredFromDraft = false;
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.form) setForm(current => ({ ...current, ...saved.form, ...migrateIcpSource(saved.form) }));
        const restored = normalizeSteps(saved.steps);
        if (restored) {
          setSteps(restored);
          restoredFromDraft = true;
        }
      }
    } catch {
      // ignore malformed/unavailable storage
    }

    if (!restoredFromDraft) {
      api.get("/onboarding")
        .then(({ data }) => {
          const delays = parseCadenceDelays(data?.follow_up_cadence);
          if (delays) {
            // The onboarding cadence describes 3 steps; keep whatever delay a
            // step already has if the sequence is longer or shorter than that.
            setSteps(current => current.map((s, i) => (
              delays[i] === undefined ? s : { ...s, delayDays: delays[i] }
            )));
          }
        })
        .catch(() => {});
    }

    setDraftRestored(true);
  }, []);

  useEffect(() => {
    if (!draftRestored) return;
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ form, steps }));
    } catch {
      // ignore storage write failures (e.g. private browsing quota)
    }
  }, [form, steps, draftRestored]);

  const clearDraftStorage = () => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const filteredLeads = useMemo(() => {
    if (!leadSearch.trim()) return allLeads;
    const q = leadSearch.toLowerCase();
    return allLeads.filter(l =>
      (l.name || "").toLowerCase().includes(q) ||
      (l.firstName || "").toLowerCase().includes(q) ||
      (l.lastName || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.company || "").toLowerCase().includes(q)
    );
  }, [allLeads, leadSearch]);

  const toggleLead = useCallback((id) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(() => {
    setSelectedLeadIds(prev => {
      const allSelected = filteredLeads.every(l => prev.has(l.id));
      const next = new Set(prev);
      if (allSelected) {
        filteredLeads.forEach(l => next.delete(l.id));
      } else {
        filteredLeads.forEach(l => next.add(l.id));
      }
      return next;
    });
  }, [filteredLeads]);

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
    setValidationErrors([]);
    setError("");
  };

  const updateStep = (index, key, value) => {
    setSteps(current => current.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const addStep = () => {
    setSteps(current => (
      current.length >= MAX_STEPS ? current : [...current, makeStep(DEFAULT_FOLLOW_UP_DELAY_DAYS)]
    ));
  };

  const removeStep = index => {
    setSteps(current => {
      if (current.length <= MIN_STEPS) return current;
      const next = current.filter((_, i) => i !== index);
      // Removing the opening email promotes the next one, which should go out
      // immediately rather than inheriting the removed step's follow-up delay.
      return index === 0 ? next.map((s, i) => (i === 0 ? { ...s, delayDays: 0 } : s)) : next;
    });
  };

  const setManualLeadField = (key, value) => {
    setManualLead(current => ({ ...current, [key]: value }));
    setManualLeadError("");
  };

  const addManualLead = async () => {
    if (addingManualLead) return;

    const firstName = manualLead.firstName.trim();
    const lastName = manualLead.lastName.trim();
    const company = manualLead.company.trim();
    const email = manualLead.email.trim();
    const phone = manualLead.phone.trim();

    if (!firstName && !lastName && !email && !company) {
      setManualLeadError("Add a name, email, or company before saving this lead.");
      return;
    }

    if (form.channel === "email" && !email) {
      setManualLeadError("Email campaigns need an email address for manual leads.");
      return;
    }

    if (form.channel === "voice" && !phone) {
      setManualLeadError("Voice campaigns need a phone number for manual leads.");
      return;
    }

    setAddingManualLead(true);
    setManualLeadError("");
    try {
      const { data: lead } = await api.post("/leads", {
        source: "manual",
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        title: manualLead.title.trim(),
        company,
        email,
        phone,
        location: manualLead.location.trim(),
        linkedinUrl: manualLead.linkedinUrl.trim(),
      });

      setAllLeads(current => [lead, ...current.filter(item => item.id !== lead.id)]);
      setSelectedLeadIds(current => {
        const next = new Set(current);
        next.add(lead.id);
        return next;
      });
      setManualLead(DEFAULT_MANUAL_LEAD);
    } catch (err) {
      setManualLeadError(err?.response?.data?.error || "Manual lead could not be added.");
    } finally {
      setAddingManualLead(false);
    }
  };

  const scrollToSection = useCallback((ref, { forceEmail = false } = {}) => {
    if (forceEmail && !usesEmail(form.channel)) {
      setForm(current => ({ ...current, channel: "email" }));
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return;
    }

    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [form.channel]);

  const validateForm = useCallback(() => {
    const errors = [];

    if (form.name.trim().length < 3) {
      errors.push("Campaign name must be at least 3 characters.");
    }

    if (Number(form.maxLeads) < 1) {
      errors.push("Maximum leads must be at least 1.");
    }

    if (usesEmail(form.channel) && Number(form.dailySendCap) < 1) {
      errors.push("Daily send cap must be at least 1.");
    }

    if (usesVoice(form.channel) && Number(form.callCadencePerHour) < 1) {
      errors.push("Calls per hour must be at least 1.");
    }

    if (form.businessHoursStart >= form.businessHoursEnd) {
      errors.push("Business hours end time must be after start time.");
    }
    if (!Array.isArray(form.allowedWeekdays) || form.allowedWeekdays.length === 0) {
      errors.push("Select at least one lead-local contact day.");
    }
    if (!Array.isArray(form.leadPreparationWeekdays) || form.leadPreparationWeekdays.length === 0) {
      errors.push("Select at least one lead preparation day.");
    }
    if (Number(form.weeklyQualifiedLeadTarget) < 1) {
      errors.push("Weekly qualified lead target must be at least 1.");
    }
    if (voiceEnabled && !form.voicePermissionConfirmed) {
      errors.push("Confirm your organization is permitted to make automated calls to these contacts.");
    }

    return errors;
  }, [form, voiceEnabled]);

  const submit = async event => {
    event.preventDefault();
    if (saving) return;

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError("");
      const hasSetupError = errors.some(message => message.includes("Campaign name"));
      scrollToSection(hasSetupError ? setupRef : controlsRef);
      return;
    }

    setSaving(true);
    setError("");
    setValidationErrors([]);

    try {
      const { data: campaign } = await api.post("/campaigns", {
        ...form,
        maxLeads: Number(form.maxLeads),
        dailySendCap: Number(form.dailySendCap),
        callCadencePerHour: Number(form.callCadencePerHour),
      });

      const campaignId = campaign.id;

      const sequenceSteps = steps
        .map((step, index) => ({
          stepNumber: index + 1,
          delayDays: step.delayDays,
          subjectTemplate: "",
          bodyPromptContext: "",
        }));

      if (usesEmail(form.channel) && sequenceSteps.length > 0) {
        await api.put(`/campaigns/${campaignId}/steps`, { steps: sequenceSteps });
      }

      if (selectedLeadIds.size > 0) {
        await api.post(`/campaigns/${campaignId}/assign-leads`, {
          leadIds: Array.from(selectedLeadIds),
        });
      }

      // Preparation is a safe pre-launch pipeline: it may find, enrich,
      // research, generate, and simulate, but it never contacts a prospect.
      await api.post(`/campaigns/${campaignId}/prepare`);

      clearDraftStorage();
      router.push(`/campaigns/${campaignId}`);
    } catch (err) {
      console.error("Campaign creation failed:", err?.response?.status, err?.response?.data, err);
      const backendError = err?.response?.data?.error;
      const backendDetails = err?.response?.data?.details;
      const detailText = backendDetails ? ` (${JSON.stringify(backendDetails)})` : "";
      setError(
        backendError
          ? `${backendError}${detailText}`
          : err?.message || "Campaign could not be created. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="col campaign-new-form" onSubmit={submit} style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread campaign-new-topbar" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff", gap: 16 }}>
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <button type="button" className="btn btn-ghost btn-sm" style={{ width: 40, padding: 0 }} onClick={() => router.push("/campaigns")} aria-label="Back to campaigns">
            <Icon name="arrowLeft" size={17} />
          </button>
          <div>
            <h1 className="display" style={{ fontSize: 22 }}>New campaign</h1>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Set the campaign shell before adding leads and sequence steps.</p>
          </div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { clearDraftStorage(); router.push("/campaigns"); }}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            <Icon name="check" size={15} color="#06231a" /> {saving ? "Creating..." : "Create draft"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 24px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div style={{ padding: "12px 24px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
          {validationErrors[0]}
        </div>
      )}

      <div className="scroll grow campaign-new-scroll" style={{ minHeight: 0, padding: 24, scrollBehavior: "smooth" }}>
        <div
          className="row spread"
          style={{
            gap: 12,
            marginBottom: 14,
            padding: "10px 12px",
            border: "1px solid var(--line)",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "var(--sh-xs)",
            flexWrap: "wrap",
          }}
        >
          <span className="faint" style={{ fontSize: 12.5, fontWeight: 800 }}>Jump to section</span>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {[
              ["Setup", setupRef],
              ["Controls", controlsRef],
              ["Email sequence", emailSequenceRef, true],
              ["Assign leads", assignLeadsRef],
            ].map(([label, ref, forceEmail]) => (
              <button
                key={label}
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => scrollToSection(ref, { forceEmail })}
                style={{ height: 32, padding: "0 12px", fontSize: 12.5, background: label === "Email sequence" ? "var(--g-50)" : "#fff" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="campaign-new-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) 340px", gap: 18, alignItems: "start" }}>
          <div className="col" style={{ gap: 14 }}>
            <section ref={setupRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row campaign-new-section-head" style={{ gap: 10, marginBottom: 18 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                  <Icon name="send" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>Campaign setup</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>These fields define what gets created in the campaign table.</p>
                </div>
              </div>

              <div className="col" style={{ gap: 16 }}>
                <Field label="Campaign name" hint="Use a name your sales team can recognize in reports.">
                  <input
                    className="input"
                    placeholder="Series B SaaS VP Sales - Q3"
                    value={form.name}
                    onChange={event => set("name", event.target.value)}
                    maxLength={120}
                    required
                  />
                </Field>

                <Field label="Channel" data-tour="campaign-channel" hint="Each campaign uses one channel so timing, eligibility, reporting, and stop rules stay clear.">
                  <div className="row campaign-new-channel-grid" style={{ gap: 10, flexWrap: "wrap" }}>
                    {[
                      { value: "email", label: "Email", icon: "mail", help: "Outbound sequence", active: emailEnabled },
                      { value: "voice", label: "Voice", icon: "phone", help: "AI or manual calling", active: voiceEnabled },
                    ].map(option => {
                      const { active } = option;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          aria-label={`${option.label} channel`}
                          onClick={() => set("channel", option.value)}
                          className="card row campaign-new-channel-card"
                          style={{
                            flex: "1 1 220px",
                            minHeight: 78,
                            padding: 14,
                            gap: 12,
                            borderRadius: 8,
                            textAlign: "left",
                            cursor: "pointer",
                            borderColor: active ? "var(--g-400)" : "var(--line)",
                            background: active ? "var(--g-50)" : "#fff",
                            boxShadow: active ? "0 0 0 4px var(--ring)" : "var(--sh-sm)",
                          }}
                        >
                          <span style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center", color: "var(--g-700)", flex: "none" }}>
                            <Icon name={option.icon} size={18} />
                          </span>
                          <span className="col" style={{ gap: 3, minWidth: 0 }}>
                            <span style={{ fontWeight: 800 }}>{option.label}</span>
                            <span className="faint" style={{ fontSize: 12.5 }}>{option.help}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            style={{
                              marginLeft: "auto",
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              flex: "none",
                              display: "grid",
                              placeItems: "center",
                              border: `1px solid ${active ? "var(--g-400)" : "var(--line)"}`,
                              background: active ? "var(--g-600)" : "#fff",
                            }}
                          >
                            {active && <Icon name="check" size={13} color="#fff" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Prompt notes" hint="Everything the sales agent should know about this campaign, including who you're targeting. Optional at draft stage — you can add this before launch.">
                  <textarea
                    className="input"
                    style={{ minHeight: 118, paddingTop: 14, resize: "vertical", lineHeight: 1.5 }}
                    placeholder="Who you're targeting (example: US SaaS, 51-500 employees, VP Sales), plus positioning, qualifying rules, exclusions, and pain points."
                    value={form.promptNotes}
                    onChange={event => set("promptNotes", event.target.value)}
                    maxLength={2000}
                  />
                </Field>
              </div>
            </section>

            <section ref={controlsRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row campaign-new-section-head" style={{ gap: 10, marginBottom: 18 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                  <Icon name="sliders" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>Controls</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Caps and timing protect deliverability and calling cadence.</p>
                </div>
              </div>

              <div className="campaign-new-controls-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
                <Field label="Maximum leads">
                  <input className="input" type="number" min="1" max="10000" value={form.maxLeads} onChange={event => set("maxLeads", event.target.value)} />
                </Field>

                {emailEnabled && (
                  <Field label="Daily send cap" hint="Default is intentionally conservative for new outbound campaigns.">
                    <input className="input" type="number" min="1" max="500" value={form.dailySendCap} onChange={event => set("dailySendCap", event.target.value)} />
                  </Field>
                )}

                {voiceEnabled && (
                  <Field label="Calls per hour">
                    <input className="input" type="number" min="1" max="60" value={form.callCadencePerHour} onChange={event => set("callCadencePerHour", event.target.value)} />
                  </Field>
                )}

                {voiceEnabled && (
                  <Field label="Maximum call attempts" hint="No-answer and voicemail retries stop after this many prospect attempts.">
                    <input className="input" type="number" min="1" max="10" value={form.maxCallAttempts} onChange={event => set("maxCallAttempts", event.target.value)} />
                  </Field>
                )}

                {voiceEnabled && (
                  <Field label="Voice mode">
                    <select className="input" value={form.voiceMode} onChange={event => set("voiceMode", event.target.value)}>
                      <option value="ai">AI caller</option>
                      <option value="manual">Manual calling</option>
                    </select>
                  </Field>
                )}

                <Field label="Display timezone" hint="Schedules run in each lead's local timezone. This controls how firm dates appear to you.">
                  <input className="input" list="campaign-timezones" value={form.timezone} onChange={event => set("timezone", event.target.value)} placeholder="Search timezone" />
                  <datalist id="campaign-timezones">
                    {timezones.map(zone => <option key={zone} value={zone} />)}
                  </datalist>
                </Field>

                <Field label="Lead-local start time">
                  <input className="input" type="time" value={form.businessHoursStart} onChange={event => set("businessHoursStart", event.target.value)} />
                </Field>

                <Field label="Lead-local end time">
                  <input className="input" type="time" value={form.businessHoursEnd} onChange={event => set("businessHoursEnd", event.target.value)} />
                </Field>

                <Field label="Lead-local contact days" hint="Outreach runs only on highlighted days in each lead's timezone.">
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {WEEKDAYS.map(day => {
                      const active = form.allowedWeekdays.includes(day.value);
                      return (
                        <button key={day.value} type="button" aria-pressed={active} title={day.title}
                          onClick={() => set("allowedWeekdays", active
                            ? form.allowedWeekdays.filter(value => value !== day.value)
                            : [...form.allowedWeekdays, day.value].sort())}
                          style={{ width: 42, height: 38, borderRadius: 9, border: `1px solid ${active ? "var(--g-500)" : "var(--line)"}`, background: active ? "var(--g-600)" : "#fff", color: active ? "#fff" : "var(--ink)", fontWeight: 800, cursor: "pointer" }}>
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Lead preparation days" hint="Defaults to Saturday and Sunday. Apollo discovery, deduplication, enrichment, research, and AI drafting run on these days in the campaign timezone.">
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {WEEKDAYS.map(day => {
                      const active = form.leadPreparationWeekdays.includes(day.value);
                      return (
                        <button key={day.value} type="button" aria-pressed={active} title={day.title}
                          onClick={() => set("leadPreparationWeekdays", active
                            ? form.leadPreparationWeekdays.filter(value => value !== day.value)
                            : [...form.leadPreparationWeekdays, day.value].sort())}
                          style={{ width: 42, height: 38, borderRadius: 9, border: `1px solid ${active ? "var(--g-500)" : "var(--line)"}`, background: active ? "var(--g-600)" : "#fff", color: active ? "#fff" : "var(--ink)", fontWeight: 800, cursor: "pointer" }}>
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Qualified leads per week" hint="The platform keeps moving through Apollo pages until this many contactable leads are prepared, or the audience is exhausted.">
                  <input className="input" type="number" min="1" max="3500" value={form.weeklyQualifiedLeadTarget} onChange={event => set("weeklyQualifiedLeadTarget", event.target.value)} />
                </Field>

                {voiceEnabled && (
                  <Field label="Automated calling permission">
                    <label className="row" style={{ gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid var(--line)", borderRadius: 9, cursor: "pointer" }}>
                      <input type="checkbox" checked={form.voicePermissionConfirmed} onChange={event => set("voicePermissionConfirmed", event.target.checked)} style={{ marginTop: 3 }} />
                      <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>I confirm that my organization is permitted to make automated calls to these contacts and will follow applicable calling laws.</span>
                    </label>
                  </Field>
                )}
              </div>
            </section>

            {emailEnabled && (
              <section ref={emailSequenceRef} data-tour="campaign-sequence" className="card campaign-new-email-section" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
                <div className="row campaign-new-section-head" style={{ gap: 10, marginBottom: 18 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                    <Icon name="mail" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800 }}>Email sequence</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Choose timing only. AI writes unique copy for every lead from their research and actual conversation history.</p>
                  </div>
                  <span className="chip" style={{ marginLeft: "auto", fontSize: 12, flex: "none" }}>
                    {steps.length} step{steps.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="col" style={{ gap: 16 }}>
                  {steps.map((step, index) => (
                    <div key={step.uid} className="campaign-new-step-card" style={{ padding: 16, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--line)" }}>
                      <div className="row spread campaign-new-step-head" style={{ marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--g-100)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "var(--g-700)", flex: "none" }}>
                            {index + 1}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>
                            {index === 0 ? "Initial email" : `Follow-up ${index}`}
                          </span>
                        </div>
                        <div className="row campaign-new-delay" style={{ gap: 6 }}>
                          <span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>Delay:</span>
                          <input
                            className="input"
                            type="number"
                            min="0"
                            max="90"
                            value={step.delayDays}
                            onChange={e => updateStep(index, "delayDays", parseInt(e.target.value) || 0)}
                            style={{ width: 64, height: 32, padding: "0 8px", fontSize: 13, textAlign: "center" }}
                          />
                          <span className="faint" style={{ fontSize: 12.5, fontWeight: 700 }}>days</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeStep(index)}
                            disabled={steps.length <= MIN_STEPS}
                            aria-label={`Remove ${index === 0 ? "initial email" : `follow-up ${index}`}`}
                            title={steps.length <= MIN_STEPS ? "A sequence needs at least one step" : "Remove this step"}
                            style={{ width: 32, padding: 0, height: 32, flex: "none" }}
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="faint" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                        {index === 0
                          ? "Generated as soon as each lead finishes enrichment and research."
                          : "Generated after the previous email is sent, using that email and the latest lead state. Any reply stops the sequence."}
                      </p>
                    </div>
                  ))}

                  <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={addStep}
                      disabled={steps.length >= MAX_STEPS}
                    >
                      <Icon name="plus" size={14} /> Add follow-up
                    </button>
                    <span className="faint" style={{ fontSize: 12.5 }}>
                      {steps.length >= MAX_STEPS
                        ? `Maximum of ${MAX_STEPS} steps reached.`
                        : "Each follow-up is generated from the conversation state when it becomes due."}
                    </span>
                  </div>
                </div>
              </section>
            )}

            <section ref={assignLeadsRef} className="card campaign-new-assign-section" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row spread campaign-new-assign-head" style={{ marginBottom: 14 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                    <Icon name="users" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800 }}>Assign leads</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Select existing leads or add a lead manually.</p>
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 12 }}>{selectedLeadIds.size} selected</span>
              </div>

              <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)", marginBottom: 14 }}>
                <div className="row spread" style={{ gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <div className="row" style={{ gap: 9 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: "#fff", display: "grid", placeItems: "center", color: "var(--g-700)", border: "1px solid var(--g-100)" }}>
                      <Icon name="plus" size={15} />
                    </span>
                    <div>
                      <strong style={{ fontSize: 13.5 }}>Add manually</strong>
                      <p className="faint" style={{ fontSize: 12, marginTop: 1 }}>Saved to leads and selected for this draft.</p>
                    </div>
                  </div>
                  {manualLeadError ? <span style={{ color: "#9a3412", fontSize: 12.5, fontWeight: 800 }}>{manualLeadError}</span> : null}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                  <input className="input" placeholder="First name" value={manualLead.firstName} onChange={e => setManualLeadField("firstName", e.target.value)} maxLength={120} style={{ height: 40 }} />
                  <input className="input" placeholder="Last name" value={manualLead.lastName} onChange={e => setManualLeadField("lastName", e.target.value)} maxLength={120} style={{ height: 40 }} />
                  <input className="input" placeholder={form.channel === "voice" ? "Email (optional)" : "Email"} value={manualLead.email} onChange={e => setManualLeadField("email", e.target.value)} maxLength={240} style={{ height: 40 }} />
                  <input className="input" placeholder={emailEnabled ? "Phone (optional)" : "Phone"} value={manualLead.phone} onChange={e => setManualLeadField("phone", e.target.value)} maxLength={80} style={{ height: 40 }} />
                  <input className="input" placeholder="Company" value={manualLead.company} onChange={e => setManualLeadField("company", e.target.value)} maxLength={160} style={{ height: 40 }} />
                  <input className="input" placeholder="Title" value={manualLead.title} onChange={e => setManualLeadField("title", e.target.value)} maxLength={160} style={{ height: 40 }} />
                  <input className="input" placeholder="Location (optional)" value={manualLead.location} onChange={e => setManualLeadField("location", e.target.value)} maxLength={160} style={{ height: 40 }} />
                  <input className="input" placeholder="LinkedIn URL (optional)" value={manualLead.linkedinUrl} onChange={e => setManualLeadField("linkedinUrl", e.target.value)} maxLength={500} style={{ height: 40 }} />
                </div>

                <div className="row spread" style={{ marginTop: 12, gap: 12, flexWrap: "wrap" }}>
                  <span className="faint" style={{ fontSize: 12.5 }}>
                    {form.channel === "voice"
                        ? "Phone is required for voice campaigns."
                        : "Email is required for email campaigns."}
                  </span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={addManualLead} disabled={addingManualLead}>
                    <Icon name="plus" size={14} color="#06231a" /> {addingManualLead ? "Adding..." : "Add lead"}
                  </button>
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
                  <Icon name="search" size={15} />
                </span>
                <input
                  className="input"
                  placeholder="Search leads by name, email, or company..."
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  style={{ paddingLeft: 36, height: 38 }}
                />
              </div>

              <div className="campaign-new-leads-table-shell" style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", maxHeight: 320, overflowY: "auto" }}>
                <table className="campaign-new-leads-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
                      <th style={{ padding: "8px 12px", width: 36 }}>
                        <input type="checkbox" checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id))} onChange={toggleAllVisible} />
                      </th>
                      {["Lead", "Email", "Company"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--faint)", letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leadsLoading ? (
                      <tr><td colSpan={4} style={{ padding: 24, textAlign: "center" }}><Spinner size={18} /></td></tr>
                    ) : filteredLeads.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>{leadSearch ? "No leads match." : "No leads yet. Import from Prospects first."}</td></tr>
                    ) : (
                      filteredLeads.slice(0, 100).map(lead => {
                        const displayName = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed";
                        const checked = selectedLeadIds.has(lead.id);
                        return (
                          <tr key={lead.id} onClick={() => toggleLead(lead.id)} style={{ borderBottom: "1px solid var(--line-2)", cursor: "pointer", background: checked ? "var(--g-50)" : "transparent" }}>
                            <td style={{ padding: "8px 12px" }}>
                              <input type="checkbox" checked={checked} readOnly />
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <div className="row" style={{ gap: 8 }}>
                                <Avatar name={displayName} size={28} />
                                <span style={{ fontWeight: 700, fontSize: 13 }} className="ellip">{displayName}</span>
                              </div>
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{lead.email || "-"}</span>
                            </td>
                            <td style={{ padding: "8px 12px" }}>
                              <span className="faint" style={{ fontSize: 12.5 }}>{lead.company || "-"}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length > 100 && (
                <p className="faint" style={{ fontSize: 12, marginTop: 8, textAlign: "center" }}>Showing first 100 of {filteredLeads.length} leads. Use search to narrow down.</p>
              )}
            </section>
          </div>

          <aside className="card campaign-new-summary" style={{ padding: 18, borderRadius: 8, position: "sticky", top: 0 }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--g-700)", gap: 2, flex: "none" }}>
                {emailEnabled && <Icon name="mail" size={19} />}
                {voiceEnabled && <Icon name="phone" size={19} />}
              </span>
              <div className="col" style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }} className="ellip">{form.name || "Untitled campaign"}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>
                  {form.channel === "voice" ? "Voice campaign" : "Email campaign"} draft
                </span>
              </div>
            </div>

            <hr className="divider" style={{ margin: "16px 0" }} />

            {[
              ["Max leads", form.maxLeads],
              ...(emailEnabled ? [["Daily cap", form.dailySendCap]] : []),
              ["Weekly lead target", form.weeklyQualifiedLeadTarget],
              ["Preparation days", WEEKDAYS.filter(day => form.leadPreparationWeekdays.includes(day.value)).map(day => day.label).join(", ") || "None"],
              ...(voiceEnabled ? [["Call cadence", `${form.callCadencePerHour}/hr`]] : []),
              ["Business hours", `${form.businessHoursStart} - ${form.businessHoursEnd}`],
              ["Timezone", form.timezone],
              ...(emailEnabled ? [["Sequence steps", `${steps.length} timed touch${steps.length === 1 ? "" : "es"}`]] : []),
              ["Leads selected", selectedLeadIds.size],
            ].map(([label, value]) => (
              <div key={label} className="row spread campaign-new-summary-row" style={{ gap: 14, padding: "9px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span className="faint" style={{ fontSize: 12.5, fontWeight: 800 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, textAlign: "right" }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: setupReady ? "var(--g-50)" : "#fff7ed", border: `1px solid ${setupReady ? "var(--g-100)" : "#fed7aa"}` }}>
              <div className="row" style={{ gap: 7, fontWeight: 800, fontSize: 13 }}>
                <Icon name={setupReady ? "checkCircle" : "alertCircle"} size={15} color={setupReady ? "var(--g-600)" : "#c2410c"} />
                {setupReady ? "Ready to create draft" : "Setup incomplete"}
              </div>
              <p style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.5, color: setupReady ? "var(--muted)" : "#9a3412" }}>
                {setupReady
                  ? "Launch is available from the campaign list after the shell is created."
                  : "Campaign name is required before saving this draft."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
