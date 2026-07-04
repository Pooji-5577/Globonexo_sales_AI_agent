"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/ui/Icon";
import api from "../../../lib/api";

const ICON_MAP = {
  email_sent: 'send',
  reply: 'chat',
  meeting: 'calendar',
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  const kpis = data?.kpis ?? {};
  const activity = data?.activity ?? [];
  const firstName = data?.user?.firstName || 'there';
  const agentName = data?.agentName || 'Nexo';

  return (
    <div className="scroll grow" style={{ padding: '22px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 26 }}>Good morning, {firstName} 👋</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>Here's where things stand.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => router.push('/agent')}>
          <Icon name="spark" size={16} color="#06231a" /> Talk to {agentName}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { k: 'Emails sent', v: kpis.emailsSent ?? 0, d: 'total sent', ico: 'send', good: true },
          { k: 'Replies', v: kpis.replies ?? 0, d: `${kpis.replyRate ?? 0}% reply rate`, ico: 'chat', good: true },
          { k: 'Meetings', v: kpis.meetings ?? 0, d: 'booked', ico: 'calendar', good: true },
          { k: 'Hot leads', v: kpis.hotLeads ?? 0, d: 'needs attention', ico: 'flame', good: false },
          { k: 'Active campaigns', v: kpis.activeCampaigns ?? 0, d: 'running', ico: 'trend', good: true },
        ].map(s => (
          <div key={s.k} className="card" style={{ padding: '14px 16px' }}>
            <div className="row spread">
              <span className="faint nw" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</span>
              <Icon name={s.ico} size={17} color="var(--g-600)" />
            </div>
            <div className="display" style={{ fontSize: 28, marginTop: 8, color: 'var(--ink)' }}>{s.v}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.good ? 'var(--g-700)' : '#d97706', marginTop: 4, display: 'block' }}>{s.d}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="row spread" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Recent activity</span>
          <button onClick={() => router.push('/agent')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--g-700)' }}>See all</button>
        </div>
        {activity.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: 14 }}>No activity yet. Start a campaign to see activity here.</p>
          </div>
        ) : (
          activity.map((a, i) => (
            <div key={i} className="row" style={{ gap: 12, padding: '12px 18px', borderBottom: i < activity.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                <Icon name={ICON_MAP[a.type] || 'send'} size={17} />
              </span>
              <span className="grow" style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-2)' }}>{a.text}</span>
              <span className="faint nw" style={{ fontSize: 12, fontWeight: 700 }}>{a.timeAgo}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
