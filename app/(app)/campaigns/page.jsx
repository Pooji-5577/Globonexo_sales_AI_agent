"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/ui/Icon";
import api from "../../../lib/api";

const STATUS_STYLES = {
  active: { bg: 'var(--g-50)', color: 'var(--g-700)', dot: 'var(--g-500)' },
  paused: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  draft: { bg: 'var(--bg-2)', color: 'var(--faint)', dot: 'var(--faint)' },
  completed: { bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString();
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns')
      .then(res => {
        setCampaigns(res.data.items || []);
        setSummary(res.data.summary || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusToggle = async (campaign) => {
    try {
      if (campaign.status === 'active') {
        await api.post(`/campaigns/${campaign.id}/pause`);
      } else if (campaign.status === 'paused' || campaign.status === 'draft') {
        await api.post(`/campaigns/${campaign.id}/launch`);
      }
      const res = await api.get('/campaigns');
      setCampaigns(res.data.items || []);
      setSummary(res.data.summary || {});
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading campaigns…</p>
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Campaigns</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {summary.total ?? 0} sequences · {summary.active ?? 0} active · {summary.meetings ?? 0} meetings booked
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => router.push('/campaigns/new')}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>
      </div>

      {campaigns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
          {[
            { k: 'Total enrolled', v: summary.enrolled ?? 0 },
            { k: 'Emails sent', v: summary.sent ?? 0 },
            { k: 'Meetings', v: summary.meetings ?? 0 },
            { k: 'Active campaigns', v: summary.active ?? 0 },
          ].map(s => (
            <div key={s.k} className="card" style={{ padding: '12px 16px' }}>
              <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
              <div className="display" style={{ fontSize: 26, marginTop: 5 }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="scroll grow" style={{ padding: '16px 24px', minHeight: 0 }}>
        {campaigns.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Icon name="send" size={40} color="var(--faint)" />
            <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>No campaigns yet</p>
            <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Create your first campaign to start reaching prospects.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push('/campaigns/new')}>
              <Icon name="plus" size={15} color="#06231a" /> Create campaign
            </button>
          </div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {campaigns.map((c) => {
              const ss = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
              const statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1);
              return (
                <div key={c.id} className="card" style={{ padding: 18, cursor: 'pointer' }}
                  onClick={() => router.push(`/campaigns/${c.id}`)}>
                  <div className="row spread">
                    <div className="row" style={{ gap: 12 }}>
                      <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                        <Icon name="send" size={20} color="var(--g-600)" />
                      </span>
                      <div className="col">
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</span>
                        <span className="faint" style={{ fontSize: 12.5 }}>Created {formatDate(c.createdAt)}</span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 10 }} onClick={e => e.stopPropagation()}>
                      <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: ss.dot, flex: 'none' }} />{statusLabel}
                      </span>
                      <button className="btn btn-ghost btn-sm" style={{ height: 32 }}
                        onClick={() => handleStatusToggle(c)}>
                        {c.status === 'active' ? 'Pause' : c.status === 'paused' ? 'Resume' : 'Launch'}
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ height: 32 }}
                        onClick={() => router.push(`/campaigns/${c.id}`)}>Edit</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
                    {[
                      ['Enrolled', c.stats?.enrolled ?? 0],
                      ['Emails sent', c.stats?.sent ?? 0],
                      ['Meetings', c.stats?.meetings ?? 0],
                    ].map(([k, v]) => (
                      <div key={k} className="col">
                        <span className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{k}</span>
                        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginTop: 3 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
