"use client";
import React, { useState, useEffect } from "react";
import RouteSkeleton from "../../../components/ui/RouteSkeleton";
import { useFirstLoad } from "../../../hooks/useFirstLoad";
import api from "../../../lib/api";

function buildFallbackAnalytics(campaignsPayload, callsPayload) {
  const campaigns = campaignsPayload?.campaigns ?? [];
  const callSummary = callsPayload?.summary ?? {};

  const sent = campaigns.reduce((sum, item) => sum + (item.sent ?? 0), 0);
  const replied = campaigns.reduce((sum, item) => sum + (item.replies ?? 0), 0);
  const meetingsFromEmail = campaigns.reduce((sum, item) => sum + (item.meetings ?? 0), 0);
  const prospects = campaigns.reduce((sum, item) => sum + (item.enrolled ?? 0), 0);
  const meetingsBooked = meetingsFromEmail + (callSummary.meetingsBooked ?? 0);
  const replyRate = sent > 0 ? ((replied / sent) * 100).toFixed(1) : "0";

  return {
    summary: {
      meetings: meetingsBooked,
      replyRate,
      emailsSent: sent,
    },
    dailyEmails: [],
    dailyMeetings: [],
    dayLabels: [],
    funnel: {
      prospects,
      emailed: sent,
      replied,
      meetingsBooked,
      closed: 0,
    },
    calls: {
      total: callSummary.totalCalls ?? 0,
      answered: callSummary.answered ?? 0,
      answerRate: callSummary.answerRate ?? '0',
      meetingsBooked: callSummary.meetingsBooked ?? 0,
      voicemail: callSummary.voicemail ?? 0,
      failed: callSummary.failed ?? 0,
    },
  };
}

async function loadAnalytics() {
  try {
    const res = await api.get('/dashboard/analytics');
    return res.data;
  } catch {
    const [campaignsRes, callsRes] = await Promise.all([
      api.get('/analytics/campaigns'),
      api.get('/analytics/calls'),
    ]);
    return buildFallbackAnalytics(campaignsRes.data, callsRes.data);
  }
}

function BarChart({ title, data, labels, color, max }) {
  const actualMax = max || Math.max(...data, 1);
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{title}</div>
      <div className="row" style={{ gap: 8, alignItems: 'flex-end', height: 100 }}>
        {data.map((v, i) => (
          <div key={i} className="col center grow" style={{ gap: 4 }}>
            <div style={{ width: '100%', height: (v / actualMax) * 90, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height .5s ease' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--faint)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelChart({ funnel }) {
  const stages = [
    { label: 'Prospects found', v: funnel.prospects, color: '#d1fae5' },
    { label: 'Emailed', v: funnel.emailed, color: 'var(--g-300)' },
    { label: 'Replied', v: funnel.replied, color: 'var(--g-400)' },
    { label: 'Meeting booked', v: funnel.meetingsBooked, color: 'var(--g-500)' },
    { label: 'Closed', v: funnel.closed, color: 'var(--g-700)' },
  ];
  const maxVal = Math.max(...stages.map(s => s.v), 1);
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Conversion funnel</div>
      <div className="col" style={{ gap: 8 }}>
        {stages.map((s, i) => (
          <div key={i} className="row" style={{ gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', width: 130, flex: 'none', textAlign: 'right' }}>{s.label}</span>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.max((s.v / maxVal) * 100, 1) + '%', background: s.color, borderRadius: 6, transition: 'width .6s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', width: 40 }}>{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useFirstLoad(loading);

  useEffect(() => {
    loadAnalytics()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (showSkeleton) return <RouteSkeleton />;

  if (!data) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p className="muted" style={{ fontSize: 15 }}>Unable to load analytics. Please try again.</p>
      </div>
    );
  }

  const summary = data.summary ?? {};
  const funnel = data.funnel ?? { prospects: 0, emailed: 0, replied: 0, meetingsBooked: 0, closed: 0 };
  const calls = data.calls ?? null;

  return (
    <div className="scroll grow analytics-page" style={{ minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 22 }} data-tour="analytics-header">Analytics</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Performance over the last 30 days</p>
      </div>
      <div className="analytics-summary-grid">
        {[
          { k: 'Meetings booked', v: summary.meetings ?? 0 },
          { k: 'Reply rate', v: `${summary.replyRate ?? 0}%` },
          { k: 'Emails sent', v: summary.emailsSent ?? 0 },
        ].map(s => (
          <div key={s.k} className="card" style={{ padding: 16 }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="analytics-chart-grid">
        <BarChart title="Emails sent (last 7 days)" data={(data.dailyEmails?.length ? data.dailyEmails : [summary.emailsSent ?? 0])} labels={(data.dayLabels?.length ? data.dayLabels : ['Total'])} color="var(--teal)" />
        <BarChart title="Meetings booked (last 7 days)" data={(data.dailyMeetings?.length ? data.dailyMeetings : [summary.meetings ?? 0])} labels={(data.dayLabels?.length ? data.dayLabels : ['Total'])} color="var(--g-500)" />
      </div>
      <FunnelChart funnel={funnel} />
      {calls && (
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Call performance</div>
          <div className="analytics-call-grid">
            {[
              { k: 'Total calls', v: calls.total ?? 0 },
              { k: 'Answer rate', v: `${calls.answerRate ?? 0}%` },
              { k: 'Meetings booked', v: calls.meetingsBooked ?? 0 },
              { k: 'Voicemail', v: calls.voicemail ?? 0 },
              { k: 'Failed', v: calls.failed ?? 0 },
            ].map(s => (
              <div key={s.k} className="col">
                <span className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.k}</span>
                <span style={{ fontWeight: 800, fontSize: 20, marginTop: 4 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
