"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";
import Spinner from "../../../../components/ui/Spinner";
import VoicePermissionConfirm from "../../../../components/campaigns/VoicePermissionConfirm";
import {
  audienceDefaultsFromOnboarding,
  normalizeApolloLocations,
  uniqueApolloValues,
} from "../../../../lib/apollo-targeting";
import { normalizeSavedCampaignForm } from "../../../../lib/campaign-draft";
import { findPlan } from "../../../../lib/plans";

const DEFAULT_FORM = {
  name: "",
  channel: "email",
  promptNotes: "",
  maxLeads: 25,
  dailySendCap: 75,
  callCadencePerHour: 5,
  voiceMode: "ai",
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  timezone: "America/New_York",
  allowedWeekdays: [1, 2, 3, 4, 5],
  leadPreparationWeekdays: [0, 6],
  weeklyQualifiedLeadTarget: 25,
  voicePermissionConfirmed: false,
  maxCallAttempts: 3,
  researchPolicy: "strict",
};

// The backend accepts 1-10 steps. Step numbers are derived from list position
// at render and submit time rather than stored, so adding or removing a step
// can't leave the sequence with gaps or duplicates.
const MIN_STEPS = 1;
const MAX_STEPS = 10;
const DEFAULT_FOLLOW_UP_DELAY_DAYS = 3;
const VOICE_PERMISSION_ERROR = "Confirm your organization is permitted to make automated calls to these contacts.";

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

const DEFAULT_AUTOMATIC_AUDIENCE = {
  titles: ["VP Sales", "Head of Revenue"],
  customTitles: "",
  locations: ["United States"],
  customLocations: "",
  seniorities: ["vp", "head"],
  companySizes: ["51,200", "201,500"],
  industries: [],
  customIndustries: "",
  includeSimilarTitles: true,
  keywords: "",
  keywordSuggestions: [],
  organizationLocations: [],
  domains: "",
  technologies: [],
  hiringTitles: "",
  revenueMin: "",
  revenueMax: "",
};
const COMPANY_SIZE_OPTIONS = ["1,10", "11,50", "51,200", "201,500", "501,1000", "1001,5000", "5001,10000", "10001,"];
const TITLE_OPTIONS = ["Founder", "Co-Founder", "Owner", "CEO", "Chief Revenue Officer", "Chief Sales Officer", "VP Sales", "VP Revenue", "Head of Sales", "Head of Revenue", "Sales Director", "Revenue Operations Director"];
const LOCATION_OPTIONS = ["United States", "United Kingdom", "Canada", "Australia", "India", "Germany", "France", "Netherlands", "Singapore", "United Arab Emirates"];
const SENIORITY_OPTIONS = [["owner", "Owner"], ["founder", "Founder"], ["c_suite", "C-Suite"], ["partner", "Partner"], ["vp", "VP"], ["head", "Head"], ["director", "Director"], ["manager", "Manager"], ["senior", "Senior"], ["entry", "Entry"], ["intern", "Intern"]];
const INDUSTRY_OPTIONS = ["B2B SaaS", "IT Services", "Marketing Agencies", "Recruiting", "Fintech", "Healthcare", "Manufacturing", "Real Estate", "E-commerce", "Education"];
const TECHNOLOGY_OPTIONS = [["salesforce", "Salesforce"], ["hubspot", "HubSpot"], ["marketo", "Marketo"], ["outreach", "Outreach"], ["salesloft", "Salesloft"], ["intercom", "Intercom"], ["stripe", "Stripe"], ["shopify", "Shopify"]];
const splitTargetList = value => value.split(",").map(item => item.trim()).filter(Boolean);
function clampNumberInput(value, min, max) {
  if (value === "") return value;
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return String(Math.min(max, Math.max(min, number)));
}

function CampaignApolloMultiSelect({ label, options, value, onChange, placeholder, required = false }) {
  const selectedLabels = options.filter(option => value.includes(Array.isArray(option) ? option[0] : option)).map(option => Array.isArray(option) ? option[1] : option);
  return (
    <label className="field apollo-filter-field">
      <span>{label}{required ? " *" : ""}</span>
      <details className="apollo-multiselect">
        <summary>{selectedLabels.length ? `${selectedLabels.slice(0, 2).join(", ")}${selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : ""}` : placeholder}</summary>
        <div className="apollo-option-menu">
          {options.map(option => {
            const optionValue = Array.isArray(option) ? option[0] : option;
            const optionLabel = Array.isArray(option) ? option[1] : option;
            return <label key={optionValue} className="apollo-option"><input type="checkbox" checked={value.includes(optionValue)} onChange={() => onChange(value.includes(optionValue) ? value.filter(item => item !== optionValue) : [...value, optionValue])} /><span>{optionLabel}</span></label>;
          })}
          {value.length ? <button type="button" className="apollo-clear" onClick={() => onChange([])}>Clear selection</button> : null}
        </div>
      </details>
    </label>
  );
}

// Curated shortlist covering the regions this tool's orgs actually operate
// in - the full ~400-zone IANA list was overwhelming in a plain dropdown.
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Australia/Sydney",
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
  const voicePermissionRef = useRef(null);
  const emailSequenceRef = useRef(null);
  const assignLeadsRef = useRef(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [dailyEmailCap, setDailyEmailCap] = useState(100);
  const [planId, setPlanId] = useState("starter");

  const [allLeads, setAllLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [leadSearch, setLeadSearch] = useState("");
  const [manualLead, setManualLead] = useState(DEFAULT_MANUAL_LEAD);
  const [addingManualLead, setAddingManualLead] = useState(false);
  const [manualLeadError, setManualLeadError] = useState("");
  const [leadSource, setLeadSource] = useState("automatic");
  const [automaticAudience, setAutomaticAudience] = useState(DEFAULT_AUTOMATIC_AUDIENCE);
  const [showAutomaticMoreFilters, setShowAutomaticMoreFilters] = useState(false);
  const emailEnabled = usesEmail(form.channel);
  const voiceEnabled = usesVoice(form.channel);
  const setupReady = form.name.trim().length >= 3 && (!voiceEnabled || form.voicePermissionConfirmed);
  const setVoicePermission = useCallback(confirmed => {
    setForm(current => ({ ...current, voicePermissionConfirmed: confirmed }));
    if (confirmed) {
      setValidationErrors(current => current.filter(message => message !== VOICE_PERMISSION_ERROR));
    }
  }, []);
  useEffect(() => {
    api.get("/billing/usage")
      .then(({ data }) => {
        const plan = findPlan(data?.plan) ?? findPlan("starter");
        const cap = Number(plan?.dailyEmailCap ?? 100);
        setPlanId(plan?.id ?? "starter");
        setDailyEmailCap(cap);
        setForm(current => ({ ...current, dailySendCap: Math.min(Number(current.dailySendCap) || 75, cap) }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/leads")
      .then(({ data }) => setAllLeads(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setAllLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

  useEffect(() => {
    api.get("/onboarding")
      .then(({ data }) => {
        if (!data) return;
        const defaults = audienceDefaultsFromOnboarding(data);
        setAutomaticAudience(current => ({
          ...current,
          titles: defaults.titles.length ? defaults.titles : current.titles,
          locations: defaults.locations.length ? defaults.locations : current.locations,
          companySizes: defaults.companySizes.length ? defaults.companySizes : current.companySizes,
          industries: defaults.industries,
          seniorities: defaults.seniorities.length ? defaults.seniorities : current.seniorities,
          keywordSuggestions: defaults.keywordSuggestions,
          keywords: defaults.keywords,
        }));
      })
      .catch(() => {});
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
        if (saved.form) {
          const restoredForm = normalizeSavedCampaignForm(saved.form);
          setForm(current => ({ ...current, ...restoredForm, ...migrateIcpSource(restoredForm) }));
        }
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
    if (Number(form.maxLeads) > 25) {
      errors.push("Maximum leads cannot exceed 25 per campaign.");
    }

    if (usesEmail(form.channel) && Number(form.dailySendCap) < 1) {
      errors.push("Daily send cap must be at least 1.");
    }
    if (usesEmail(form.channel) && Number(form.dailySendCap) > dailyEmailCap) {
      errors.push(`Daily send cap cannot exceed ${dailyEmailCap} on the ${planId} plan.`);
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
    if (leadSource === "automatic") {
      if (automaticAudience.titles.length === 0 && splitTargetList(automaticAudience.customTitles).length === 0) errors.push("Add at least one target job title for automatic lead generation.");
      if (automaticAudience.locations.length === 0 && splitTargetList(automaticAudience.customLocations).length === 0) errors.push("Add at least one target location for automatic lead generation.");
      if (automaticAudience.companySizes.length === 0) errors.push("Select at least one company size for automatic lead generation.");
      if (automaticAudience.industries.length === 0 && splitTargetList(automaticAudience.customIndustries).length === 0) errors.push("Select at least one target industry for automatic lead generation.");
    }
    if (voiceEnabled && !form.voicePermissionConfirmed) {
      errors.push(VOICE_PERMISSION_ERROR);
    }

    return errors;
  }, [automaticAudience, dailyEmailCap, form, leadSource, planId, voiceEnabled]);

  const submit = async event => {
    event.preventDefault();
    if (saving) return;

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError("");
      const hasSetupError = errors.some(message => message.includes("Campaign name"));
      const hasVoicePermissionError = errors[0] === VOICE_PERMISSION_ERROR;
      const target = hasSetupError ? setupRef : hasVoicePermissionError ? voicePermissionRef : controlsRef;
      target.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (hasVoicePermissionError) {
        window.setTimeout(() => voicePermissionRef.current?.focus({ preventScroll: true }), 350);
      }
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

      if (leadSource === "existing" && selectedLeadIds.size > 0) {
        await api.post(`/campaigns/${campaignId}/assign-leads`, {
          leadIds: Array.from(selectedLeadIds),
        });
      }

      if (leadSource === "automatic") {
        // Apollo discovery persists this audience on the campaign. Its worker
        // hands qualified leads into preparation, research, and AI drafting.
        await api.post("/apollo/import", {
          campaignId,
          titles: [...automaticAudience.titles, ...splitTargetList(automaticAudience.customTitles)],
          locations: normalizeApolloLocations([...automaticAudience.locations, ...splitTargetList(automaticAudience.customLocations)]),
          seniorities: automaticAudience.seniorities,
          companySizes: automaticAudience.companySizes,
          industries: uniqueApolloValues([...automaticAudience.industries, ...splitTargetList(automaticAudience.customIndustries)]),
          includeSimilarTitles: automaticAudience.includeSimilarTitles,
          organizationLocations: automaticAudience.organizationLocations,
          organizationDomains: splitTargetList(automaticAudience.domains),
          technologyUids: automaticAudience.technologies,
          hiringJobTitles: splitTargetList(automaticAudience.hiringTitles),
          revenueMin: automaticAudience.revenueMin === "" ? undefined : Number(automaticAudience.revenueMin),
          revenueMax: automaticAudience.revenueMax === "" ? undefined : Number(automaticAudience.revenueMax),
          keywords: automaticAudience.keywords,
          limit: Math.min(100, Number(form.weeklyQualifiedLeadTarget)),
        });
      } else {
        // Preparation is safe pre-launch work and never contacts a prospect.
        await api.post(`/campaigns/${campaignId}/prepare`);
      }

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
                  <input className="input" type="number" min="1" max="25" value={form.maxLeads} onChange={event => set("maxLeads", clampNumberInput(event.target.value, 1, 25))} />
                  <span className="hint">Each campaign can contain at most 25 leads.</span>
                </Field>

                {leadSource === "automatic" && (
                  <Field label="Research policy" hint="Strict only selects leads with enough evidence; review holds ambiguous matches for inspection.">
                    <select className="input" value={form.researchPolicy} onChange={event => set("researchPolicy", event.target.value)}>
                      <option value="strict">Strict — evidence required</option>
                      <option value="review">Review — hold ambiguous matches</option>
                      <option value="flexible">Flexible — continue with factual context</option>
                      <option value="volume">Volume — optional research</option>
                    </select>
                  </Field>
                )}

                {emailEnabled && (
                  <Field label="Daily send cap" hint="Default is intentionally conservative for new outbound campaigns.">
                    <input className="input" type="number" min="1" max={dailyEmailCap} value={form.dailySendCap} onChange={event => set("dailySendCap", clampNumberInput(event.target.value, 1, dailyEmailCap))} />
                    <span className="hint">Up to {dailyEmailCap} emails/day on the {planId} plan.</span>
                  </Field>
                )}

                {voiceEnabled && (
                  <Field label="Calls per hour">
                    <input className="input" type="number" min="1" max="60" value={form.callCadencePerHour} onChange={event => set("callCadencePerHour", clampNumberInput(event.target.value, 1, 60))} />
                  </Field>
                )}

                {voiceEnabled && (
                  <Field label="Maximum call attempts" hint="No-answer and voicemail retries stop after this many prospect attempts.">
                    <input className="input" type="number" min="1" max="10" value={form.maxCallAttempts} onChange={event => set("maxCallAttempts", clampNumberInput(event.target.value, 1, 10))} />
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

                {voiceEnabled && (
                  <div className="field campaign-new-field" style={{ gridColumn: "1 / -1" }}>
                    <span>Automated calling permission</span>
                    <VoicePermissionConfirm
                      ref={voicePermissionRef}
                      checked={form.voicePermissionConfirmed}
                      onChange={setVoicePermission}
                    />
                  </div>
                )}

                <Field label="Display timezone" hint="Schedules run in each lead's local timezone. This controls how firm dates appear to you.">
                  <select className="input" value={form.timezone} onChange={event => set("timezone", event.target.value)}>
                    {(TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES]).map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
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

                <Field label="Lead preparation days" hint="Defaults to Saturday and Sunday. Lead discovery, deduplication, enrichment, research, and AI drafting run on these days in the campaign timezone.">
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

                <Field label="Qualified leads per week" hint="The platform keeps moving through the lead database until this many contactable leads are prepared, or the audience is exhausted.">
                  <input className="input" type="number" min="1" max="3500" value={form.weeklyQualifiedLeadTarget} onChange={event => set("weeklyQualifiedLeadTarget", event.target.value)} />
                </Field>

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
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>{leadSource === "automatic" ? "Define the audience and let GNX find qualified leads." : "Add a lead manually or select existing leads."}</p>
                  </div>
                </div>
                <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div role="tablist" aria-label="Lead assignment mode" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: 3, borderRadius: 999, background: "var(--bg-2)", border: "1px solid var(--line)", minWidth: 250 }}>
                    {[{ value: "automatic", label: "Automatic" }, { value: "existing", label: "Manual" }].map(option => {
                      const active = leadSource === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setLeadSource(option.value)}
                          style={{ border: active ? "1px solid var(--g-300)" : "1px solid transparent", borderRadius: 999, background: active ? "#fff" : "transparent", color: active ? "var(--ink)" : "var(--muted)", padding: "8px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: active ? "0 1px 4px rgba(20,50,35,.08)" : "none" }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {leadSource === "existing" ? <span className="chip" style={{ fontSize: 12 }}>{selectedLeadIds.size} selected</span> : null}
                </div>
              </div>

              {leadSource === "automatic" ? (
                <div style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)" }}>
                  <div style={{ marginBottom: 14 }}>
                    <strong style={{ fontSize: 14 }}>Automatic audience</strong>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 3 }}>GNX searches, deduplicates, enriches, and only admits leads with the contact method required by this campaign.</p>
                  </div>
                  <div className="form-grid">
                    <CampaignApolloMultiSelect label="Job titles" options={uniqueApolloValues([...TITLE_OPTIONS, ...automaticAudience.titles])} value={automaticAudience.titles} onChange={titles => setAutomaticAudience(current => ({ ...current, titles }))} placeholder="Select job titles" required />
                    <CampaignApolloMultiSelect label="Management level" options={SENIORITY_OPTIONS} value={automaticAudience.seniorities} onChange={seniorities => setAutomaticAudience(current => ({ ...current, seniorities }))} placeholder="Select seniority" required />
                    <CampaignApolloMultiSelect label="People locations" options={uniqueApolloValues([...LOCATION_OPTIONS, ...automaticAudience.locations])} value={automaticAudience.locations} onChange={locations => setAutomaticAudience(current => ({ ...current, locations }))} placeholder="Select locations" required />
                    <label className="field"><span>Other job titles</span><input className="input" value={automaticAudience.customTitles} onChange={event => setAutomaticAudience(current => ({ ...current, customTitles: event.target.value }))} placeholder="Add custom titles, comma separated" /></label>
                    <label className="field"><span>Other people locations</span><input className="input" value={automaticAudience.customLocations} onChange={event => setAutomaticAudience(current => ({ ...current, customLocations: event.target.value }))} placeholder="Add cities or regions, comma separated" /></label>
                    <CampaignApolloMultiSelect label="Target industries" options={uniqueApolloValues([...INDUSTRY_OPTIONS, ...automaticAudience.industries])} value={automaticAudience.industries} onChange={industries => setAutomaticAudience(current => ({ ...current, industries }))} placeholder="Select industries" required />
                    <label className="field"><span>Other industries</span><input className="input" value={automaticAudience.customIndustries} onChange={event => setAutomaticAudience(current => ({ ...current, customIndustries: event.target.value }))} placeholder="Add custom industries, comma separated" /></label>
                  </div>
                  <div className="field" style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Company size *</span>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      {uniqueApolloValues([...COMPANY_SIZE_OPTIONS, ...automaticAudience.companySizes]).map(value => {
                        const active = automaticAudience.companySizes.includes(value);
                        const sizeLabel = value.endsWith(",") ? `${value.slice(0, -1)}+` : value.replace(",", "-");
                        return <button key={value} type="button" className="btn btn-ghost btn-sm" style={{ height: 32, padding: "0 11px", fontSize: 12, background: active ? "var(--g-50)" : "#fff", borderColor: active ? "var(--g-300)" : "var(--line)" }} onClick={() => setAutomaticAudience(current => ({ ...current, companySizes: active ? current.companySizes.filter(item => item !== value) : [...current.companySizes, value] }))}>{sizeLabel} employees</button>;
                      })}
                    </div>
                  </div>
                  <label className="apollo-checkbox-row">
                    <input type="checkbox" checked={automaticAudience.includeSimilarTitles} onChange={event => setAutomaticAudience(current => ({ ...current, includeSimilarTitles: event.target.checked }))} /> Include people with similar job titles
                  </label>

                  <button className="btn btn-ghost btn-sm apollo-more-button" type="button" onClick={() => setShowAutomaticMoreFilters(value => !value)}>
                    <Icon name="sliders" size={14} /> {showAutomaticMoreFilters ? "Hide additional filters" : "More filters"}
                  </button>
                  {showAutomaticMoreFilters ? (
                    <div className="apollo-more-panel">
                      <div className="form-grid">
                        <label className="field"><span>Focused keyword (optional)</span><input className="input" value={automaticAudience.keywords} onChange={event => setAutomaticAudience(current => ({ ...current, keywords: event.target.value }))} placeholder="Choose one focused term, e.g. B2B SaaS" /></label>
                        <CampaignApolloMultiSelect label="Company HQ locations" options={LOCATION_OPTIONS} value={automaticAudience.organizationLocations} onChange={organizationLocations => setAutomaticAudience(current => ({ ...current, organizationLocations }))} placeholder="Select company locations" />
                        <label className="field"><span>Company domains</span><input className="input" value={automaticAudience.domains} onChange={event => setAutomaticAudience(current => ({ ...current, domains: event.target.value }))} placeholder="acme.com, example.com" /></label>
                        <CampaignApolloMultiSelect label="Technologies used" options={TECHNOLOGY_OPTIONS} value={automaticAudience.technologies} onChange={technologies => setAutomaticAudience(current => ({ ...current, technologies }))} placeholder="Select technologies" />
                        <label className="field"><span>Companies hiring for</span><input className="input" value={automaticAudience.hiringTitles} onChange={event => setAutomaticAudience(current => ({ ...current, hiringTitles: event.target.value }))} placeholder="Account Executive, SDR" /></label>
                        <label className="field"><span>Annual revenue (minimum)</span><input className="input" type="number" min="0" value={automaticAudience.revenueMin} onChange={event => setAutomaticAudience(current => ({ ...current, revenueMin: event.target.value }))} placeholder="1000000" /></label>
                        <label className="field"><span>Annual revenue (maximum)</span><input className="input" type="number" min="1" value={automaticAudience.revenueMax} onChange={event => setAutomaticAudience(current => ({ ...current, revenueMax: event.target.value }))} placeholder="50000000" /></label>
                        <label className="field"><span>Leads to prepare</span><select className="input" value={form.weeklyQualifiedLeadTarget} onChange={event => set("weeklyQualifiedLeadTarget", Number(event.target.value))}>{[10, 25, 50, 100].map(value => <option key={value} value={value}>{value} leads</option>)}</select></label>
                      </div>
                      {automaticAudience.keywordSuggestions.length ? <div style={{ marginTop: 12 }}><span className="faint" style={{ fontSize: 12 }}>Choose one onboarding suggestion. This is treated as one query, not an OR list.</span><div className="row" style={{ gap: 7, flexWrap: "wrap", marginTop: 7 }}>{automaticAudience.keywordSuggestions.map(keyword => <button key={keyword} type="button" className="btn btn-ghost btn-sm" style={{ background: automaticAudience.keywords === keyword ? "var(--g-50)" : "#fff" }} onClick={() => setAutomaticAudience(current => ({ ...current, keywords: current.keywords === keyword ? "" : keyword }))}>{keyword}</button>)}</div></div> : null}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 14, padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }}>
                    <strong style={{ fontSize: 12.5 }}>Final audience</strong>
                    <p className="faint" style={{ fontSize: 12, marginTop: 5, lineHeight: 1.55 }}>
                      {uniqueApolloValues([...automaticAudience.titles, ...splitTargetList(automaticAudience.customTitles)]).join(", ") || "No titles"} · {normalizeApolloLocations([...automaticAudience.locations, ...splitTargetList(automaticAudience.customLocations)]).join(", ") || "No locations"} · {uniqueApolloValues([...automaticAudience.industries, ...splitTargetList(automaticAudience.customIndustries)]).join(", ") || "No industries"} · {automaticAudience.companySizes.length} company-size range{automaticAudience.companySizes.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 14 }}>{emailEnabled ? "Only leads with an enriched email will enter this campaign." : "Only leads with an enriched callable phone will enter this campaign."}</p>
                </div>
              ) : <>

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
              </>}
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
                  : form.name.trim().length < 3
                    ? "Campaign name is required before saving this draft."
                    : "Confirm automated calling permission before saving this Voice campaign."}
              </p>
              {voiceEnabled && !form.voicePermissionConfirmed ? (
                <div style={{ marginTop: 10 }}>
                  <VoicePermissionConfirm
                    checked={form.voicePermissionConfirmed}
                    onChange={setVoicePermission}
                    compact
                  />
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
