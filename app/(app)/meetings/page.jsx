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

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
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

function MeetingRow({ meeting, bookingLink, compact = false }) {
  const style = STATUS_STYLES[meeting.status] ?? STATUS_STYLES.scheduled;
  return (
    <div className="row spread meeting-row">
      <div className="row meeting-row-main">
        {!compact && (
          <div className="meeting-date-tile">
            <span>{formatDate(meeting.scheduled).split(" ")[0]}</span>
            <strong>{meeting.scheduled.getDate()}</strong>
          </div>
        )}
        <Avatar name={meeting.name} size={compact ? 34 : 40} />
        <div className="col" style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: compact ? 13.5 : 14.5 }} className="ellip">{meeting.title}</span>
          <span className="muted ellip" style={{ fontSize: 12.5 }}>
            {meeting.name}{meeting.companyLine ? ` · ${meeting.companyLine}` : ""} · {formatTime(meeting.scheduled)} · {meeting.duration} min
          </span>
        </div>
      </div>
      <div className="row meeting-actions">
        <span className="badge" style={{ background: style.bg, color: style.color }}>{style.label}</span>
        {meeting.joinUrl ? (
          <a className="btn btn-primary btn-sm" href={meeting.joinUrl} target="_blank" rel="noreferrer">
            <Icon name="play" size={14} color="#06231a" /> Join call
          </a>
        ) : bookingLink ? (
          <a className="btn btn-ghost btn-sm" href={bookingLink} target="_blank" rel="noreferrer">
            <Icon name="link" size={14} /> Booking link
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const [data, setData] = useState(null);
  const [bookingLink, setBookingLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    api.get("/meetings")
      .then(res => {
        setData(res.data);
        setBookingLink(res.data?.bookingLink || "");
      })
      .catch(() => setError("Meetings could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const todayMeetings = useMemo(() => (data?.today || []).map(normalizeMeeting), [data]);
  const upcomingMeetings = useMemo(() => (data?.upcoming || []).map(normalizeMeeting), [data]);
  const pastMeetings = useMemo(() => (data?.past || []).map(normalizeMeeting), [data]);
  const meetingCount = data?.summary?.total ?? 0;

  if (showSkeleton) return <RouteSkeleton />;

  return (
    <div className="scroll grow app-page">
      <div className="row spread page-head">
        <div>
          <h1 className="display page-title">Meetings</h1>
          <p className="muted page-subtitle">{meetingCount} booked conversations · calendar link only</p>
        </div>
        {bookingLink ? (
          <a className="btn btn-dark btn-sm" href={bookingLink} target="_blank" rel="noreferrer">
            <Icon name="link" size={15} color="#fff" /> Open booking link
          </a>
        ) : (
          <a className="btn btn-ghost btn-sm" href="/settings">
            <Icon name="cog" size={15} /> Add booking link
          </a>
        )}
      </div>

      {error ? <div className="notice-warn">{error}</div> : null}

      <section className="booking-hero" data-tour="meetings-booking">
        <div>
          <span className="eyebrow">Calendar booking</span>
          <h2>Native booking stays off. Every CTA sends prospects to your calendar link.</h2>
          <p>Keep availability, buffers, conferencing, and reschedules inside Calendly, Google Calendar, or your preferred scheduler.</p>
        </div>
        <div className="booking-link-card">
          <span className="faint">Active booking URL</span>
          <strong className="ellip">{bookingLink || "No booking link configured"}</strong>
          <a className="btn btn-primary btn-sm btn-block" href={bookingLink || "/settings"} target={bookingLink ? "_blank" : undefined} rel="noreferrer">
            <Icon name={bookingLink ? "link" : "cog"} size={14} color="#06231a" /> {bookingLink ? "Open calendar" : "Configure in settings"}
          </a>
        </div>
      </section>

      {meetingCount === 0 ? (
        <div className="empty-state">
          <Icon name="calendar" size={42} color="var(--faint)" />
          <p className="muted">No meetings booked yet</p>
          <span className="faint">When prospects book through your campaigns, they appear here.</span>
        </div>
      ) : (
        <>
          <section className="card today-meetings">
            <div className="row spread" style={{ marginBottom: 12 }}>
              <span className="eyebrow">Today · {todayMeetings.length} meetings</span>
              <span className="chip"><Icon name="clock" size={13} /> Live prep queue</span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              {todayMeetings.length === 0 ? (
                <div className="soft-empty">No meetings today.</div>
              ) : todayMeetings.map(meeting => (
                <MeetingRow key={meeting.id} meeting={meeting} bookingLink={bookingLink} compact />
              ))}
            </div>
          </section>

          <div className="section-label">Upcoming</div>
          <div className="card list-card">
            {upcomingMeetings.length === 0 ? (
              <div className="soft-empty">No upcoming meetings.</div>
            ) : upcomingMeetings.map(meeting => (
              <MeetingRow key={meeting.id} meeting={meeting} bookingLink={bookingLink} />
            ))}
          </div>

          <div className="section-label">Past meetings</div>
          <div className="card list-card">
            {pastMeetings.length === 0 ? (
              <div className="soft-empty">No past meetings yet.</div>
            ) : pastMeetings.map(meeting => (
              <MeetingRow key={meeting.id} meeting={meeting} bookingLink={bookingLink} compact />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
