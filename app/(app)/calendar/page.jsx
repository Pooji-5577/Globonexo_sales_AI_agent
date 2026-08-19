"use client";

import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import api from "../../../lib/api";

const STATUS_STYLES = {
  scheduled: { label: "Scheduled", bg: "var(--g-50)", color: "var(--g-700)" },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#15803d" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#b91c1c" },
};

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 24 * 60 * 60 * 1000;

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

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function normalizeMeeting(meeting) {
  const lead = meeting.lead || {};
  return {
    ...meeting,
    scheduled: new Date(meeting.scheduledAt),
    name: lead.name || "Guest",
    companyLine: [lead.title, lead.company].filter(Boolean).join(" · "),
    duration: meeting.durationMinutes ?? 30,
  };
}

const DEFAULT_SETTINGS = {
  timezone: "America/New_York",
  workingDays: [1, 2, 3, 4, 5],
  dayStartTime: "09:00",
  dayEndTime: "17:00",
  meetingDurationMinutes: 30,
  bufferMinutes: 15,
  minNoticeMinutes: 120,
  bookingWindowDays: 14,
  defaultMeetingUrl: "",
};

function MeetingCard({ meeting, onCancel, canceling }) {
  const style = STATUS_STYLES[meeting.status] ?? STATUS_STYLES.scheduled;
  return (
    <div className="cal-meeting-card">
      <div className="row spread" style={{ gap: 8, alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 8, minWidth: 0 }}>
          <Avatar name={meeting.name} size={28} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="ellip">{meeting.name}</span>
            <span className="muted ellip" style={{ fontSize: 11.5 }}>{meeting.companyLine || "Company not provided"}</span>
          </div>
        </div>
        <span className="badge" style={{ background: style.bg, color: style.color, fontSize: 10.5, flex: "none" }}>{style.label}</span>
      </div>
      <div className="row spread" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>
          {formatTime(meeting.scheduled)} · {meeting.duration} min
        </span>
        {meeting.attendeePhone ? (
          <a className="row" style={{ gap: 4, fontSize: 12, color: "var(--g-700)", fontWeight: 700 }} href={`tel:${meeting.attendeePhone}`}>
            <Icon name="phone" size={13} /> Call
          </a>
        ) : null}
      </div>
      {meeting.joinUrl ? (
        <a
          className="row"
          style={{ gap: 4, marginTop: 8, fontSize: 12, color: "var(--g-700)", fontWeight: 700 }}
          href={meeting.joinUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="link" size={13} /> Join meeting
        </a>
      ) : null}
      {meeting.status === "scheduled" && (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-block"
          style={{ marginTop: 10, height: 30, fontSize: 12 }}
          disabled={canceling}
          onClick={() => onCancel(meeting.id)}
        >
          {canceling ? "Cancelling…" : "Cancel"}
        </button>
      )}
    </div>
  );
}

function SettingsPanel({ settings, onSave, saving }) {
  const [form, setForm] = useState(settings);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(settings);
    setDirty(false);
  }, [settings]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const toggleDay = (dow) => {
    setForm((f) => {
      const has = f.workingDays.includes(dow);
      const workingDays = has ? f.workingDays.filter((d) => d !== dow) : [...f.workingDays, dow].sort();
      return { ...f, workingDays };
    });
    setDirty(true);
  };

  return (
    <div className="card cal-settings-card">
      <div className="row" style={{ gap: 8, marginBottom: 4 }}>
        <Icon name="sliders" size={16} color="var(--g-700)" />
        <strong style={{ fontSize: 14 }}>Availability</strong>
      </div>
      <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
        What the AI agent offers leads when it books a meeting live on a call.
      </p>

      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label>Working days</label>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {WEEKDAY_SHORT.map((label, dow) => {
              const active = form.workingDays.includes(dow);
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => toggleDay(dow)}
                  className="cal-day-toggle"
                  style={{
                    background: active ? "var(--g-500)" : "var(--bg)",
                    color: active ? "#06231a" : "var(--muted)",
                    borderColor: active ? "var(--g-500)" : "var(--line)",
                  }}
                >
                  {label[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Start</label>
            <input className="input" type="time" value={form.dayStartTime} onChange={(e) => set("dayStartTime")(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>End</label>
            <input className="input" type="time" value={form.dayEndTime} onChange={(e) => set("dayEndTime")(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Timezone</label>
          <select className="input" value={form.timezone} onChange={(e) => set("timezone")(e.target.value)}>
            {(TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES]).map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
          <span style={{ fontSize: 11.5, color: "var(--faint)" }}>Slot times are spoken to leads in this timezone.</span>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Duration (min)</label>
            <input className="input" type="number" min={5} max={240} value={form.meetingDurationMinutes} onChange={(e) => set("meetingDurationMinutes")(Number(e.target.value))} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Buffer (min)</label>
            <input className="input" type="number" min={0} max={120} value={form.bufferMinutes} onChange={(e) => set("bufferMinutes")(Number(e.target.value))} />
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Min notice (min)</label>
            <input className="input" type="number" min={0} max={10080} value={form.minNoticeMinutes} onChange={(e) => set("minNoticeMinutes")(Number(e.target.value))} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Book within (days)</label>
            <input className="input" type="number" min={1} max={90} value={form.bookingWindowDays} onChange={(e) => set("bookingWindowDays")(Number(e.target.value))} />
          </div>
        </div>

        <div className="field">
          <label>Default meeting link</label>
          <input className="input" type="url" value={form.defaultMeetingUrl || ""} onChange={(e) => set("defaultMeetingUrl")(e.target.value)} placeholder="https://meet.google.com/…" />
          <span style={{ fontSize: 11.5, color: "var(--faint)" }}>Sent automatically to the prospect and your connected mailbox after a call booking.</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm btn-block"
          disabled={!dirty || saving}
          onClick={() => { onSave(form); setDirty(false); }}
        >
          {saving ? "Saving…" : "Save availability"}
        </button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const showSkeleton = useFirstLoad(loading || settingsLoading);

  const loadMeetings = () => {
    setLoading(true);
    return api.get("/meetings")
      .then((res) => setData(res.data))
      .catch(() => setError("Calendar could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMeetings();
    api.get("/calendar/settings")
      .then((res) => setSettings(res.data))
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const allMeetings = useMemo(() => (data?.meetings || []).map(normalizeMeeting), [data]);
  const pastMeetings = useMemo(() => (data?.past || []).map(normalizeMeeting), [data]);
  const meetingCount = data?.summary?.total ?? 0;

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS));
  }, [weekStart]);

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    weekDays.forEach((day) => map.set(day.toDateString(), []));
    allMeetings.forEach((meeting) => {
      const key = meeting.scheduled.toDateString();
      if (map.has(key)) map.get(key).push(meeting);
    });
    map.forEach((list) => list.sort((a, b) => a.scheduled - b.scheduled));
    return map;
  }, [allMeetings, weekDays]);

  const handleSaveSettings = (form) => {
    setSavingSettings(true);
    api.put("/calendar/settings", form)
      .then((res) => setSettings(res.data))
      .catch(() => setError("Could not save availability settings."))
      .finally(() => setSavingSettings(false));
  };

  const handleCancel = (meetingId) => {
    setCancelingId(meetingId);
    api.delete(`/meetings/${meetingId}`)
      .then(() => loadMeetings())
      .catch(() => setError("Could not cancel that meeting."))
      .finally(() => setCancelingId(null));
  };

  if (showSkeleton) return <RouteSkeleton />;

  const today = new Date();

  return (
    <div className="scroll grow app-page">
      <div className="row spread page-head">
        <div>
          <h1 className="display page-title">Calendar</h1>
          <p className="muted page-subtitle">{meetingCount} meeting{meetingCount === 1 ? "" : "s"} booked by your AI agent</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(startOfWeek(new Date(weekStart.getTime() - 7 * DAY_MS)))}>
            <Icon name="arrowLeft" size={15} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(startOfWeek(new Date(weekStart.getTime() + 7 * DAY_MS)))}>
            <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>

      {error ? <div className="notice-warn">{error}</div> : null}

      <div className="cal-layout" data-tour="calendar-hero">
        <div className="cal-grid">
          {weekDays.map((day) => {
            const isToday = sameDay(day, today);
            const dayMeetings = meetingsByDay.get(day.toDateString()) || [];
            return (
              <div key={day.toISOString()} className="cal-day-col">
                <div className={`cal-day-head ${isToday ? "is-today" : ""}`}>
                  <span className="faint">{WEEKDAY_SHORT[day.getDay()]}</span>
                  <strong>{day.getDate()}</strong>
                </div>
                <div className="cal-day-body">
                  {dayMeetings.length === 0 ? (
                    <span className="faint" style={{ fontSize: 11.5 }}>No meetings</span>
                  ) : (
                    dayMeetings.map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} onCancel={handleCancel} canceling={cancelingId === meeting.id} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <SettingsPanel settings={settings} onSave={handleSaveSettings} saving={savingSettings} />
      </div>

      {pastMeetings.length > 0 && (
        <section className="col" style={{ gap: 10, marginTop: 24 }}>
          <strong style={{ fontSize: 14 }}>Past</strong>
          {pastMeetings.slice(0, 10).map((meeting) => (
            <div key={meeting.id} className="row spread meeting-row">
              <div className="row" style={{ gap: 10, minWidth: 0 }}>
                <Avatar name={meeting.name} size={32} />
                <div className="col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="ellip">{meeting.title}</span>
                  <span className="muted ellip" style={{ fontSize: 12 }}>
                    {meeting.name}{meeting.companyLine ? ` · ${meeting.companyLine}` : ""} · {meeting.scheduled.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className="badge" style={{ background: STATUS_STYLES[meeting.status]?.bg, color: STATUS_STYLES[meeting.status]?.color }}>
                {STATUS_STYLES[meeting.status]?.label ?? meeting.status}
              </span>
            </div>
          ))}
        </section>
      )}

      {meetingCount === 0 && (
        <div className="empty-state">
          <Icon name="calendar" size={42} color="var(--faint)" />
          <p>No meetings booked yet</p>
          <span>Once a call leads to a booking, it'll show up here automatically.</span>
        </div>
      )}
    </div>
  );
}
