"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import api from "../../../lib/api";

const ICON_MAP = {
  email_sent: "send",
  reply: "chat",
  meeting: "calendar",
};

const TASK_ICON_MAP = {
  gmail: "mail",
  reply: "chat",
  email: "send",
  campaign: "target",
  lead: "users",
};

function KpiCard({ item }) {
  return (
    <div className="card" style={{ padding: "14px 16px", borderRadius: 8 }}>
      <div className="row spread">
        <span className="faint nw" style={{ fontSize: 12, fontWeight: 800 }}>{item.label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: item.tone === "warn" ? "#fff7ed" : "var(--g-50)", color: item.tone === "warn" ? "#c2410c" : "var(--g-700)" }}>
          <Icon name={item.icon} size={16} />
        </span>
      </div>
      <div className="display" style={{ fontSize: 28, marginTop: 8, color: "var(--ink)" }}>{item.value}</div>
      <span style={{ fontSize: 12, fontWeight: 800, color: item.tone === "warn" ? "#c2410c" : "var(--g-700)", marginTop: 4, display: "block" }}>{item.detail}</span>
    </div>
  );
}

function formatMeetingTime(value) {
  const meetingDate = new Date(value);
  if (Number.isNaN(meetingDate.getTime())) return "Time to be confirmed";

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dateKey = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const meetingKey = dateKey(meetingDate);
  const day = meetingKey === dateKey(today)
    ? "Today"
    : meetingKey === dateKey(tomorrow)
      ? "Tomorrow"
      : meetingDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = meetingDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return `${day} at ${time}`;
}

function NextMeetingCard({ meeting, onViewMeetings }) {
  if (!meeting) {
    return (
      <div className="card" style={{ padding: 18, borderRadius: 8 }}>
        <div className="row spread">
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Next meeting</span>
            <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Your nearest scheduled call.</p>
          </div>
          <Icon name="calendar" size={20} color="var(--g-700)" />
        </div>
        <div style={{ padding: "22px 0 10px", textAlign: "center" }}>
          <p className="muted" style={{ fontSize: 13, fontWeight: 800 }}>No upcoming meetings.</p>
          <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 10 }} onClick={onViewMeetings}>
            View meetings
          </button>
        </div>
      </div>
    );
  }

  const attendee = meeting.attendee ?? {};
  const attendeeDetail = [attendee.title, attendee.company].filter(Boolean).join(" · ");

  return (
    <div className="card" style={{ padding: 18, borderRadius: 8, background: "linear-gradient(160deg,#fff,#f4fdf8)" }}>
      <div className="row spread">
        <span className="eyebrow">Next meeting</span>
        <Icon name="calendar" size={20} color="var(--g-700)" />
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{meeting.title}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {formatMeetingTime(meeting.scheduledAt)} · {meeting.durationMinutes ?? 30} min
        </div>
      </div>
      <div className="row" style={{ gap: 9, marginTop: 14 }}>
        <Avatar name={attendee.name || "Guest"} size={30} />
        <div className="col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{attendee.name || "Guest"}</span>
          {attendeeDetail ? <span className="faint" style={{ fontSize: 12 }}>{attendeeDetail}</span> : null}
        </div>
      </div>
      {meeting.joinUrl ? (
        <a className="btn btn-primary btn-sm btn-block" style={{ marginTop: 14 }} href={meeting.joinUrl} target="_blank" rel="noreferrer">
          <Icon name="play" size={14} color="#06231a" /> Join call
        </a>
      ) : (
        <button className="btn btn-ghost btn-sm btn-block" type="button" style={{ marginTop: 14 }} onClick={onViewMeetings}>
          View meeting
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setData(res.data))
      .catch(() => setError("Dashboard data could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis ?? {};
  const activity = data?.activity ?? [];
  const tasks = data?.tasks ?? [];
  const weeklyGoal = data?.weeklyGoal ?? { current: 0, target: 1, progress: 0, monthlyTarget: 0 };
  const nextMeeting = data?.nextMeeting ?? null;
  const firstName = data?.user?.firstName || "there";
  const agentName = data?.agentName || "Nexo";

  const kpiItems = useMemo(() => ([
    { label: "Emails sent", value: kpis.emailsSent ?? 0, detail: "total sent", icon: "send" },
    { label: "Replies", value: kpis.replies ?? 0, detail: `${kpis.replyRate ?? 0}% reply rate`, icon: "chat" },
    { label: "Meetings", value: kpis.meetings ?? 0, detail: "booked", icon: "calendar" },
    { label: "Hot leads", value: kpis.hotLeads ?? 0, detail: "needs attention", icon: "flame", tone: "warn" },
    { label: "Saved leads", value: kpis.savedLeads ?? 0, detail: `${kpis.activeCampaigns ?? 0} active campaigns`, icon: "users" },
  ]), [kpis]);

  if (showSkeleton) return <RouteSkeleton />;

  return (
    <div className="scroll grow" style={{ padding: "22px 24px", minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 20, gap: 16, alignItems: "flex-start" }}>
        <div>
          <h1 className="display" style={{ fontSize: 26 }}>Good morning, {firstName}</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>Pipeline health, reply work, and weekly progress.</p>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/prospects")}>
            <Icon name="users" size={15} /> Add leads
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/campaigns/new")}>
            <Icon name="plus" size={15} color="#06231a" /> New campaign
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/agent")}>
            <Icon name="spark" size={16} color="#06231a" /> Talk to {agentName}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", marginBottom: 16, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#9a3412", fontSize: 13, fontWeight: 800 }}>
          {error}
        </div>
      )}

      <div className="dashboard-kpi-grid">
        {kpiItems.map(item => <KpiCard key={item.label} item={item} />)}
      </div>

      <div className="dashboard-main-grid">
        <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 8 }}>
          <div className="row spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Activity feed</span>
              <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Latest sends, replies, and booked meetings.</p>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.push("/agent")}>Open agent</button>
          </div>
          {activity.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center" }}>
              <p className="muted" style={{ fontSize: 14 }}>No activity yet. Start a campaign to see activity here.</p>
            </div>
          ) : (
            activity.map((item, index) => (
              <div key={`${item.type}-${item.time}-${index}`} className="row" style={{ gap: 12, padding: "12px 18px", borderBottom: index < activity.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, flex: "none", display: "grid", placeItems: "center", background: item.hot ? "var(--g-50)" : "var(--bg-2)", color: item.hot ? "var(--g-700)" : "var(--muted)" }}>
                  <Icon name={ICON_MAP[item.type] || "send"} size={17} />
                </span>
                <span className="grow" style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>{item.text}</span>
                <span className="faint nw" style={{ fontSize: 12, fontWeight: 800 }}>{item.timeAgo}</span>
              </div>
            ))
          )}
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 18, borderRadius: 8 }}>
            <div className="row spread" style={{ marginBottom: 14 }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Tasks</span>
                <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Work that needs attention.</p>
              </div>
              <span className="chip" style={{ fontSize: 12 }}>{tasks.length} open</span>
            </div>
            {tasks.length === 0 ? (
              <div style={{ padding: "18px 0", textAlign: "center" }}>
                <Icon name="checkCircle" size={28} color="var(--g-700)" />
                <p className="muted" style={{ fontSize: 13, fontWeight: 800, marginTop: 8 }}>No priority tasks.</p>
              </div>
            ) : (
              <div className="col" style={{ gap: 10 }}>
                {tasks.map(task => (
                  <button key={`${task.type}-${task.title}`} type="button" onClick={() => router.push(task.href)} style={{ textAlign: "left", padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }}>
                    <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: task.priority === "high" ? "#fff7ed" : "var(--bg-2)", color: task.priority === "high" ? "#c2410c" : "var(--ink-2)", flex: "none" }}>
                        <Icon name={TASK_ICON_MAP[task.type] || "bell"} size={15} />
                      </span>
                      <span className="grow" style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 800, fontSize: 13.5 }}>{task.title}</span>
                        <span className="faint" style={{ display: "block", fontSize: 12.5, lineHeight: 1.35, marginTop: 2 }}>{task.detail}</span>
                        <span style={{ display: "block", color: "var(--g-700)", fontWeight: 800, fontSize: 12.5, marginTop: 8 }}>{task.actionLabel}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 18, borderRadius: 8 }}>
            <div className="row spread" style={{ marginBottom: 14 }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Weekly meeting goal</span>
                <p className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Based on {weeklyGoal.monthlyTarget || 0} meetings per month.</p>
              </div>
              <Icon name="target" size={20} color="var(--g-700)" />
            </div>
            <div className="row baseline" style={{ gap: 8 }}>
              <span className="display" style={{ fontSize: 32 }}>{weeklyGoal.current ?? 0}</span>
              <span className="muted" style={{ fontSize: 14, fontWeight: 800 }}>/ {weeklyGoal.target ?? 1} meetings</span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden", marginTop: 12 }}>
              <div style={{ width: `${weeklyGoal.progress ?? 0}%`, height: "100%", background: "var(--g-600)", borderRadius: 999 }} />
            </div>
            <div className="row spread" style={{ marginTop: 10 }}>
              <span className="faint" style={{ fontSize: 12, fontWeight: 800 }}>{weeklyGoal.progress ?? 0}% complete</span>
              <button type="button" style={{ color: "var(--g-700)", fontSize: 12.5, fontWeight: 800 }} onClick={() => router.push("/analytics")}>View analytics</button>
            </div>
          </div>

          <NextMeetingCard meeting={nextMeeting} onViewMeetings={() => router.push("/meetings")} />
        </div>
      </div>
    </div>
  );
}
