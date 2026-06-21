"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";
import api from "../../../lib/api";

const STAGE_COLORS = { new: '#9aa8a0', contacted: '#60a5fa', engaged: '#15c4c0', meeting_booked: '#00c27a', won: '#088256', lost: '#ef4444', nurture: '#f0a93c' };
const STAGE_LABELS = { new: 'New', contacted: 'Contacted', engaged: 'Engaged', meeting_booked: 'Meeting set', won: 'Won', lost: 'Lost', nurture: 'Nurture' };

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/leads')
      .then(res => setProspects(res.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = prospects.filter(p => {
    const name = p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || '';
    const company = p.company || '';
    const stageLabel = STAGE_LABELS[p.status] || p.status;
    const matchesFilter = filter === 'All' || stageLabel === filter;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading prospects…</p>
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff', gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Prospects</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{prospects.length} leads</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="lead-ico"><Icon name="search" size={16} /></span>
            <input className="input has-ico" style={{ height: 38, fontSize: 13.5, background: 'var(--bg)' }} placeholder="Search prospects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Segmented options={['All', 'New', 'Engaged', 'Meeting set', 'Won'].map(v => ({ label: v, value: v }))} value={filter} onChange={setFilter} />
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add</button>
        </div>
      </div>
      <div className="scroll grow" style={{ minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Icon name="users" size={40} color="var(--faint)" />
            <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>No prospects yet</p>
            <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Add leads manually or search Apollo to find prospects.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
                {['Prospect', 'Stage', 'Score', 'Source', 'Last updated', ''].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const name = p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Unknown';
                const stageLabel = STAGE_LABELS[p.status] || p.status;
                const stageColor = STAGE_COLORS[p.status] || '#9aa8a0';
                const score = p.score ?? 0;
                const isHot = score >= 80;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--line-2)', transition: 'background .1s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--g-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 18px' }}>
                      <div className="row" style={{ gap: 11 }}>
                        <Avatar name={name} size={34} />
                        <div className="col">
                          <div className="row" style={{ gap: 7 }}>
                            <span style={{ fontWeight: 800, fontSize: 14 }} className="nw">{name}</span>
                            {isHot && <Icon name="flame" size={14} color="#ef6f4e" />}
                          </div>
                          <span className="faint" style={{ fontSize: 12 }}>{p.title ? `${p.title} · ` : ''}{p.company || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span className="badge" style={{ background: stageColor + '22', color: stageColor, border: '1px solid ' + stageColor + '44' }}>{stageLabel}</span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 48, height: 6, background: 'var(--bg-2)', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: score + '%', borderRadius: 99, background: score > 85 ? 'var(--g-500)' : 'var(--g-300)' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>{score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.source || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="mail" size={14} /> Email</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
