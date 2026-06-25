"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import Avatar from "../../../../components/ui/Avatar";

const DEFAULT_FORM = {
  name: "",
  channel: "email",
  icpSource: "",
  promptNotes: "",
  maxLeads: 100,
  dailySendCap: 75,
  callCadencePerHour: 5,
  voiceMode: "ai",
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  timezone: "America/New_York",
};

const DEFAULT_STEPS = [
  { stepNumber: 1, delayDays: 0, subjectTemplate: "", bodyPromptContext: "" },
  { stepNumber: 2, delayDays: 3, subjectTemplate: "", bodyPromptContext: "" },
  { stepNumber: 3, delayDays: 5, subjectTemplate: "", bodyPromptContext: "" },
];

const ICP_OPTIONS = [
  "Apollo search",
  "CSV import",
  "Manual prospect list",
  "Saved ICP from onboarding",
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Kolkata",
];

function Field({ label, children, hint }) {
  return (
    <label className="field">
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

  const [allLeads, setAllLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [leadSearch, setLeadSearch] = useState("");

  useEffect(() => {
    api.get("/api/leads")
      .then(({ data }) => setAllLeads(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setAllLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

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

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 3 && form.icpSource.trim().length >= 2 && !saving;
  }, [form.name, form.icpSource, saving]);

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const updateStep = (index, key, value) => {
    setSteps(current => current.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const scrollToSection = useCallback((ref, { forceEmail = false } = {}) => {
    if (forceEmail && form.channel !== "email") {
      setForm(current => ({ ...current, channel: "email" }));
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return;
    }

    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [form.channel]);

  const submit = async event => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError("");

    try {
      const { data: campaign } = await api.post("/api/campaigns", {
        ...form,
        maxLeads: Number(form.maxLeads),
        dailySendCap: Number(form.dailySendCap),
        callCadencePerHour: Number(form.callCadencePerHour),
      });

      const campaignId = campaign.id;

      if (form.channel === "email" && steps.some(s => s.subjectTemplate || s.bodyPromptContext)) {
        await api.put(`/api/campaigns/${campaignId}/steps`, { steps });
      }

      if (selectedLeadIds.size > 0) {
        await api.post(`/api/campaigns/${campaignId}/assign-leads`, {
          leadIds: Array.from(selectedLeadIds),
        });
      }

      router.push("/campaigns");
    } catch (err) {
      setError(err?.response?.data?.error || "Campaign could not be created. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="col" onSubmit={submit} style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div className="row spread" style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", flex: "none", background: "#fff", gap: 16 }}>
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
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push("/campaigns")}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
            <Icon name="check" size={15} color="#06231a" /> {saving ? "Creating..." : "Create draft"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 24px", background: "#fff7ed", borderBottom: "1px solid #fed7aa", color: "#9a3412", fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div className="scroll grow" style={{ minHeight: 0, padding: 24, scrollBehavior: "smooth" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) 340px", gap: 18, alignItems: "start" }}>
          <div className="col" style={{ gap: 14 }}>
            <section ref={setupRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row" style={{ gap: 10, marginBottom: 18 }}>
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

                <Field label="Channel">
                  <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                    {[
                      { value: "email", label: "Email", icon: "mail", help: "Outbound sequence" },
                      { value: "voice", label: "Voice", icon: "phone", help: "AI or manual calling" },
                    ].map(option => {
                      const active = form.channel === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => set("channel", option.value)}
                          className="card row"
                          style={{
                            flex: "1 1 220px",
                            minHeight: 78,
                            padding: 14,
                            gap: 12,
                            borderRadius: 8,
                            textAlign: "left",
                            borderColor: active ? "var(--g-400)" : "var(--line)",
                            background: active ? "var(--g-50)" : "#fff",
                            boxShadow: active ? "0 0 0 4px var(--ring)" : "var(--sh-sm)",
                          }}
                        >
                          <span style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center", color: "var(--g-700)", flex: "none" }}>
                            <Icon name={option.icon} size={18} />
                          </span>
                          <span className="col" style={{ gap: 3 }}>
                            <span style={{ fontWeight: 800 }}>{option.label}</span>
                            <span className="faint" style={{ fontSize: 12.5 }}>{option.help}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="ICP source" hint="Where the initial target audience comes from. This is saved with the campaign for routing and later lead import work.">
                  <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 10 }}>
                    <select className="input" value={ICP_OPTIONS.includes(form.icpSource) ? form.icpSource : "custom"} onChange={event => set("icpSource", event.target.value === "custom" ? "" : event.target.value)} required>
                      <option value="">Select source</option>
                      {ICP_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                      <option value="custom">Custom</option>
                    </select>
                    <input
                      className="input"
                      placeholder="Example: Apollo - US SaaS, 51-500 employees, VP Sales"
                      value={form.icpSource}
                      onChange={event => set("icpSource", event.target.value)}
                      maxLength={240}
                      required
                    />
                  </div>
                </Field>

                <Field label="Prompt notes">
                  <textarea
                    className="input"
                    style={{ minHeight: 118, paddingTop: 14, resize: "vertical", lineHeight: 1.5 }}
                    placeholder="Add positioning, qualifying rules, exclusions, pain points, or list notes for the sales agent."
                    value={form.promptNotes}
                    onChange={event => set("promptNotes", event.target.value)}
                    maxLength={2000}
                  />
                </Field>
              </div>
            </section>

            <section ref={controlsRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row" style={{ gap: 10, marginBottom: 18 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                  <Icon name="sliders" size={18} />
                </span>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800 }}>Controls</h2>
                  <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Caps and timing protect deliverability and calling cadence.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
                <Field label="Maximum leads">
                  <input className="input" type="number" min="1" max="10000" value={form.maxLeads} onChange={event => set("maxLeads", event.target.value)} />
                </Field>

                {form.channel === "email" ? (
                  <Field label="Daily send cap" hint="Default is intentionally conservative for new outbound campaigns.">
                    <input className="input" type="number" min="1" max="500" value={form.dailySendCap} onChange={event => set("dailySendCap", event.target.value)} />
                  </Field>
                ) : (
                  <Field label="Calls per hour">
                    <input className="input" type="number" min="1" max="60" value={form.callCadencePerHour} onChange={event => set("callCadencePerHour", event.target.value)} />
                  </Field>
                )}

                {form.channel === "voice" && (
                  <Field label="Voice mode">
                    <select className="input" value={form.voiceMode} onChange={event => set("voiceMode", event.target.value)}>
                      <option value="ai">AI caller</option>
                      <option value="manual">Manual calling</option>
                    </select>
                  </Field>
                )}

                <Field label="Timezone">
                  <select className="input" value={form.timezone} onChange={event => set("timezone", event.target.value)}>
                    {TIMEZONES.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                </Field>

                <Field label="Start time">
                  <input className="input" type="time" value={form.businessHoursStart} onChange={event => set("businessHoursStart", event.target.value)} />
                </Field>

                <Field label="End time">
                  <input className="input" type="time" value={form.businessHoursEnd} onChange={event => set("businessHoursEnd", event.target.value)} />
                </Field>
              </div>
            </section>

            {form.channel === "email" && (
              <section ref={emailSequenceRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
                <div className="row" style={{ gap: 10, marginBottom: 18 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--g-50)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                    <Icon name="mail" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800 }}>Email sequence</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Define up to 3 steps with delays between each. Subjects and body prompts are templates for AI generation.</p>
                  </div>
                </div>

                <div className="col" style={{ gap: 16 }}>
                  {steps.map((step, index) => (
                    <div key={step.stepNumber} style={{ padding: 16, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--line)" }}>
                      <div className="row spread" style={{ marginBottom: 12 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--g-100)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "var(--g-700)" }}>
                            {step.stepNumber}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>
                            {index === 0 ? "Initial email" : `Follow-up ${index}`}
                          </span>
                        </div>
                        <div className="row" style={{ gap: 6 }}>
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
                        </div>
                      </div>

                      <div className="col" style={{ gap: 10 }}>
                        <Field label="Subject line template">
                          <input
                            className="input"
                            placeholder={index === 0 ? "Quick question about {{company}}'s outbound" : "Re: following up on my last note"}
                            value={step.subjectTemplate}
                            onChange={e => updateStep(index, "subjectTemplate", e.target.value)}
                            maxLength={500}
                            style={{ height: 42 }}
                          />
                        </Field>
                        <Field label="Body prompt context">
                          <textarea
                            className="input"
                            placeholder={index === 0 ? "Introduce yourself, mention their role, reference a pain point..." : "Reference the previous email, add new value prop or social proof..."}
                            value={step.bodyPromptContext}
                            onChange={e => updateStep(index, "bodyPromptContext", e.target.value)}
                            maxLength={4000}
                            style={{ minHeight: 80, paddingTop: 12, resize: "vertical", lineHeight: 1.5 }}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section ref={assignLeadsRef} className="card" style={{ padding: 18, borderRadius: 8, scrollMarginTop: 16 }}>
              <div className="row spread" style={{ marginBottom: 14 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--ink-2)" }}>
                    <Icon name="users" size={18} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800 }}>Assign leads</h2>
                    <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Select existing leads to enroll in this campaign.</p>
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 12 }}>{selectedLeadIds.size} selected</span>
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

              <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", maxHeight: 320, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                      <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}>Loading leads...</td></tr>
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

          <aside className="card" style={{ padding: 18, borderRadius: 8, position: "sticky", top: 0 }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--g-50)", border: "1px solid var(--g-100)", display: "grid", placeItems: "center", color: "var(--g-700)" }}>
                <Icon name={form.channel === "voice" ? "phone" : "mail"} size={19} />
              </span>
              <div className="col" style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }} className="ellip">{form.name || "Untitled campaign"}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>{form.channel === "voice" ? "Voice campaign" : "Email campaign"} draft</span>
              </div>
            </div>

            <hr className="divider" style={{ margin: "16px 0" }} />

            {[
              ["ICP source", form.icpSource || "Not selected"],
              ["Max leads", form.maxLeads],
              [form.channel === "email" ? "Daily cap" : "Call cadence", form.channel === "email" ? form.dailySendCap : `${form.callCadencePerHour}/hr`],
              ["Business hours", `${form.businessHoursStart} - ${form.businessHoursEnd}`],
              ["Timezone", form.timezone],
              ...(form.channel === "email" ? [["Sequence steps", `${steps.filter(s => s.subjectTemplate || s.bodyPromptContext).length} of ${steps.length} configured`]] : []),
              ["Leads selected", selectedLeadIds.size],
            ].map(([label, value]) => (
              <div key={label} className="row spread" style={{ gap: 14, padding: "9px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span className="faint" style={{ fontSize: 12.5, fontWeight: 800 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, textAlign: "right" }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--line)" }}>
              <div className="row" style={{ gap: 7, fontWeight: 800, fontSize: 13 }}>
                <Icon name="checkCircle" size={15} color="var(--g-600)" /> Saved as draft
              </div>
              <p className="muted" style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.5 }}>
                Launch is available from the campaign list after the shell is created.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
