"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";

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
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 3 && form.icpSource.trim().length >= 2 && !saving;
  }, [form.name, form.icpSource, saving]);

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const submit = async event => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError("");

    try {
      await api.post("/api/campaigns", {
        ...form,
        maxLeads: Number(form.maxLeads),
        dailySendCap: Number(form.dailySendCap),
        callCadencePerHour: Number(form.callCadencePerHour),
      });
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

      <div className="scroll grow" style={{ minHeight: 0, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) 340px", gap: 18, alignItems: "start" }}>
          <div className="col" style={{ gap: 14 }}>
            <section className="card" style={{ padding: 18, borderRadius: 8 }}>
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

            <section className="card" style={{ padding: 18, borderRadius: 8 }}>
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
