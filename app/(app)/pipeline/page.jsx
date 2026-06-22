"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

const STAGES = [
  { id: 'new', label: 'New leads', tint: '#9aa8a0' },
  { id: 'engaged', label: 'Engaged', tint: '#15c4c0' },
  { id: 'meeting_booked', label: 'Meeting set', tint: '#00c27a' },
  { id: 'won', label: 'Won', tint: '#088256' },
];

function LeadCard({ l }) {
  const name = l.name || [l.firstName, l.lastName].filter(Boolean).join(' ') || 'Unknown';
  const score = l.score ?? 0;
  const isHot = score >= 80;
  return (
    <div className="card" style={{ padding: 13, cursor: 'grab', transition: 'transform .12s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
      <div className="row spread">
        <div className="row" style={{ gap: 9 }}>
          <Avatar name={name} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">{name}</span>
            <span className="faint ellip" style={{ fontSize: 11.5 }}>{l.title ? `${l.title} · ` : ''}{l.company || ''}</span>
          </div>
        </div>
        {isHot && <Icon name="flame" size={16} color="#ef6f4e" />}
      </div>
      <div className="row spread" style={{ marginTop: 10 }}>
        <span className="chip" style={{ height: 24, fontSize: 11, background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <Icon name="bolt" size={11} color="var(--g-600)" /> {l.source || 'manual'}
        </span>
      </div>
      <div className="row" style={{ gap: 7, marginTop: 10, alignItems: 'center' }}>
        <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: 99, flex: 1 }}>
          <div style={{ height: '100%', width: score + '%', borderRadius: 99, background: score > 85 ? 'linear-gradient(90deg,var(--g-400),var(--teal))' : 'var(--g-300)' }} />
        </div>
        <span className="faint" style={{ fontSize: 11, fontWeight: 800 }}>{score}</span>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads')
      .then(res => setLeads(res.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = {};
  for (const stage of STAGES) {
    grouped[stage.id] = leads.filter(l => l.status === stage.id);
  }
  const totalLeads = leads.length;

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading pipeline…</p>
      </div>
    );
  }

  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Pipeline</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{totalLeads} active leads</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="sliders" size={15} /> Filters</button>
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add lead</button>
        </div>
      </div>
      {totalLeads === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Icon name="funnel" size={40} color="var(--faint)" />
          <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>Your pipeline is empty</p>
          <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Add leads to start building your pipeline.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignItems: 'start' }}>
          {STAGES.map(st => (
            <div key={st.id} className="col" style={{ gap: 10 }}>
              <div className="row spread" style={{ padding: '0 4px 6px' }}>
                <div className="row" style={{ gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: st.tint, flex: 'none' }} />
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{st.label}</span>
                </div>
                <span className="faint" style={{ fontWeight: 800, fontSize: 13 }}>{(grouped[st.id] || []).length}</span>
              </div>
              {(grouped[st.id] || []).map(l => <LeadCard key={l.id} l={l} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
