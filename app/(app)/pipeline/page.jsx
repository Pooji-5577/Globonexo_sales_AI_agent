"use client";
import React from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";

const STAGES = [
  { id: 'new', label: 'New leads', tint: '#9aa8a0' },
  { id: 'engaged', label: 'Engaged', tint: '#15c4c0' },
  { id: 'meeting', label: 'Meeting set', tint: '#00c27a' },
  { id: 'won', label: 'Won', tint: '#088256' },
];
const LEADS = {
  new: [
    { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', v: '$24k', score: 72, sig: 'Hiring SDRs' },
    { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', v: '$18k', score: 64, sig: 'Visited pricing' },
    { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', v: '$9k', score: 58, sig: 'New funding' },
  ],
  engaged: [
    { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', v: '$42k', score: 88, sig: 'Opened 4×', hot: true },
    { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', v: '$31k', score: 81, sig: 'Replied' },
  ],
  meeting: [
    { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', v: '$56k', score: 94, sig: 'Demo Fri', hot: true },
    { n: 'Amir Haddad', c: 'Acme', r: 'Director', v: '$38k', score: 79, sig: 'Call Wed' },
  ],
  won: [
    { n: 'Priya Raman', c: 'Loom Health', r: 'COO', v: '$72k', score: 100, sig: 'Closed' },
  ],
};

function LeadCard({ l }) {
  return (
    <div className="card" style={{ padding: 13, cursor: 'grab', transition: 'transform .12s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
      <div className="row spread">
        <div className="row" style={{ gap: 9 }}>
          <Avatar name={l.n} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">{l.n}</span>
            <span className="faint ellip" style={{ fontSize: 11.5 }}>{l.r} · {l.c}</span>
          </div>
        </div>
        {l.hot && <Icon name="flame" size={16} color="#ef6f4e" />}
      </div>
      <div className="row spread" style={{ marginTop: 10 }}>
        <span className="chip" style={{ height: 24, fontSize: 11, background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <Icon name="bolt" size={11} color="var(--g-600)" /> {l.sig}
        </span>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--g-700)' }}>{l.v}</span>
      </div>
      <div className="row" style={{ gap: 7, marginTop: 10, alignItems: 'center' }}>
        <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: 99, flex: 1 }}>
          <div style={{ height: '100%', width: l.score + '%', borderRadius: 99, background: l.score > 85 ? 'linear-gradient(90deg,var(--g-400),var(--teal))' : 'var(--g-300)' }} />
        </div>
        <span className="faint" style={{ fontSize: 11, fontWeight: 800 }}>{l.score}</span>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Pipeline</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>248 active leads · <b style={{ color: 'var(--g-700)' }}>$1.24M</b> open</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="sliders" size={15} /> Filters</button>
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add lead</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignItems: 'start' }}>
        {STAGES.map(st => (
          <div key={st.id} className="col" style={{ gap: 10 }}>
            <div className="row spread" style={{ padding: '0 4px 6px' }}>
              <div className="row" style={{ gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: st.tint, flex: 'none' }} />
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{st.label}</span>
              </div>
              <span className="faint" style={{ fontWeight: 800, fontSize: 13 }}>{LEADS[st.id].length}</span>
            </div>
            {LEADS[st.id].map(l => <LeadCard key={l.n} l={l} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
