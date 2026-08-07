"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import SetupChecklist from "../../../components/setup/SetupChecklist";
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

function OnboardingPreparationCard({ preparation, onOpenCampaign, onOpenProspects }) {
  if (!preparation?.status || preparation.status === "idle") return null;

  const target = Number(preparation.targetEnriched || 10);
  const enriched = Number(preparation.enriched || 0);
  const attached = Number(preparation.attached || preparation.candidatesFound || 0);
  const attempts = Number(preparation.candidatesAttempted || 0);
  const rejected = Number(preparation.rejected || 0);
  const progress = enriched >= target
    ? 100
    : Math.min(99, Math.round((enriched / Math.max(target, 1)) * 100));

  // A run that found some leads but not the full target is 'partial', not a
  // failure: Apollo may simply not hold ten verified people matching this ICP.
  // Reporting that plainly beats raising an alarm the customer cannot action.
  const partial = preparation.status === "partial" || (preparation.status === "attention" && enriched > 0);
  const ready = (preparation.status === "ready" || preparation.status === "completed") && enriched >= target;
  const attention = preparation.status === "attention" && enriched === 0;

  const title = ready
    ? "Your first audience is ready"
    : partial
      ? `Found ${enriched} of ${target} leads`
      : attention
        ? "Your first audience needs attention"
        : "Preparing your first audience";

  const detail = ready
    ? "Apollo found your verified prospects and the agent is writing their emails."
    : partial
      ? `Apollo had ${enriched} verified contact${enriched === 1 ? "" : "s"} matching this profile${rejected > 0 ? `, and ${rejected} more were filtered out as unreachable or shared inboxes` : ""}. You can broaden the profile for more.`
      : attention
        ? preparation.error || "Apollo found nobody matching this profile. Broaden the titles, industries, or regions in Prospects and try again."
        : "GNX is searching Apollo and enriching the audience in the background. You can keep working.";

  return (
    <div className="card" data-tour="dashboard-preparation" style={{ padding: 18, marginBottom: 18, borderRadius: 8, background: ready ? "linear-gradient(160deg,#fff,#f4fdf8)" : "#fff" }}>
      <div className="row spread" style={{ gap: 14, alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 11, alignItems: "flex-start" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", flex: "none", background: attention ? "#fff7ed" : "var(--g-50)", color: attention ? "#c2410c" : "var(--g-700)" }}>
            <Icon name={attention ? "bell" : ready ? "checkCircle" : "spark"} size={18} />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
            <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 3, maxWidth: 680 }}>{detail}</p>
          </div>
        </div>
        <span className="chip" style={{ color: attention ? "#9a3412" : ready ? "var(--g-700)" : "var(--ink-2)", background: attention ? "#fff7ed" : ready ? "var(--g-50)" : "var(--bg-2)" }}>
          {preparation.status === "preparing" ? "In progress" : preparation.status.charAt(0).toUpperCase() + preparation.status.slice(1)}
        </span>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden", marginTop: 15 }}>
        <div style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: attention ? "#f97316" : "var(--g-600)", transition: "width .25s ease" }} />
      </div>
      <div className="row spread" style={{ marginTop: 9, gap: 12, flexWrap: "wrap" }}>
        <span className="faint" style={{ fontSize: 12, fontWeight: 800 }}>{enriched}/{target} qualified</span>
        <div className="row" style={{ gap: 16 }}>
          <span className="faint" style={{ fontSize: 12 }}>Reviewed {attached}</span>
          {/* Rejections are shown rather than hidden: a shortfall the customer
              can see the reason for is a targeting insight, where a silent one
              just looks like the product underdelivering. */}
          {rejected > 0 && <span className="faint" style={{ fontSize: 12 }}>Filtered out {rejected}</span>}
          <span className="faint" style={{ fontSize: 12 }}>Searched {attempts}</span>
        </div>
      </div>

      {(ready || partial || attention) && (
        <button
          className={ready || partial ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
          type="button"
          style={{ marginTop: 13 }}
          onClick={ready || partial ? onOpenCampaign : onOpenProspects}
        >
          {ready || partial ? "Review your emails" : "Refine audience"}{" "}
          <Icon name="arrow" size={14} color={ready || partial ? "#06231a" : "currentColor"} />
        </button>
      )}
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
      {meeting.attendeePhone ? (
        <a className="btn btn-primary btn-sm btn-block" style={{ marginTop: 14 }} href={`tel:${meeting.attendeePhone}`}>
          <Icon name="phone" size={14} color="#06231a" /> Call {attendee.name || "Guest"}
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
  const [onboardingPreparation, setOnboardingPreparation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setData(res.data))
      .catch(() => setError("Dashboard data could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const loadPreparation = async () => {
      try {
        const { data: nextPreparation } = await api.get("/onboarding/preparation/current");
        if (cancelled) return;
        setOnboardingPreparation(nextPreparation || null);

        const target = Number(nextPreparation?.targetEnriched || 50);
        const enriched = Number(nextPreparation?.enriched || 0);
        const stillPreparing = nextPreparation?.status === "queued"
          || nextPreparation?.status === "preparing"
          || (enriched < target && nextPreparation?.status !== "attention" && nextPreparation?.status !== "ready");
        if (stillPreparing) timer = window.setTimeout(loadPreparation, 5000);
      } catch {
        // The dashboard should remain usable if preparation status is
        // temporarily unavailable; the campaign and other dashboard data are
        // independent of this background indicator.
      }
    };

    loadPreparation();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const kpis = data?.kpis ?? {};
  const activity = data?.activity ?? [];
  const tasks = data?.tasks ?? [];
  const weeklyGoal = data?.weeklyGoal ?? { current: 0, target: 1, progress: 0, monthlyTarget: 0 };
  const nextMeeting = data?.nextMeeting ?? null;
  const firstName = data?.user?.firstName || "there";
  const agentName = data?.agentName || "GNX sales";

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

      <OnboardingPreparationCard
        preparation={onboardingPreparation}
        onOpenCampaign={() => router.push(`/campaigns/${onboardingPreparation?.campaignId}`)}
        onOpenProspects={() => router.push("/prospects")}
      />

      <SetupChecklist variant="compact" />

      <div className="dashboard-kpi-grid" data-tour="dashboard-kpis">
        {kpiItems.map(item => <KpiCard key={item.label} item={item} />)}
      </div>

      <div className="dashboard-main-grid">
        <div className="card" data-tour="dashboard-activity" style={{ padding: 0, overflow: "hidden", borderRadius: 8 }}>
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

          <NextMeetingCard meeting={nextMeeting} onViewMeetings={() => router.push("/calendar")} />
        </div>
      </div>
    </div>
  );
}
