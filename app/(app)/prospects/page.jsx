"use client";
import React, { useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";

const PROSPECT_DATA = [
  { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', stage: 'Engaged', score: 88, sig: 'Opened 4×', last: '1h ago', hot: true },
  { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', stage: 'Meeting set', score: 94, sig: 'Replied', last: '14m ago', hot: true },
  { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', stage: 'Engaged', score: 81, sig: 'Replied', last: '3h ago', hot: false },
  { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', stage: 'New', score: 72, sig: 'Hiring SDRs', last: '5h ago', hot: false },
  { n: 'Amir Haddad', c: 'Acme', r: 'Director', stage: 'Meeting set', score: 79, sig: 'Call Wed', last: '2h ago', hot: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', stage: 'New', score: 64, sig: 'Visited pricing', last: '6h ago', hot: false },
  { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', stage: 'New', score: 58, sig: 'New funding', last: '1d ago', hot: false },
  { n: 'Priya Raman', c: 'Loom Health', r: 'COO', stage: 'Won', score: 100, sig: 'Closed', last: '3d ago', hot: false },
];
const STAGE_COLORS = { New: '#9aa8a0', Engaged: '#15c4c0', 'Meeting set': '#00c27a', Won: '#088256', Nurture: '#f0a93c' };

export default function ProspectsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = PROSPECT_DATA.filter(p =>
    (filter === 'All' || p.stage === filter) &&
    (p.n.toLowerCase().includes(search.toLowerCase()) || p.c.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff', gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Prospects</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{PROSPECT_DATA.length} leads · agent-sourced 64%</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="lead-ico"><Icon name="search" size={16} /></span>
            <input className="input has-ico" style={{ height: 38, fontSize: 13.5, background: 'var(--bg)' }} placeholder="Search prospects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Segmented options={['All','New','Engaged','Meeting set','Won'].map(v=>({label:v,value:v}))} value={filter} onChange={setFilter} />
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add</button>
        </div>
      </div>
      <div className="scroll grow" style={{ minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
              {['Prospect','Stage','Signal','Score','Last action',''].map(h => (
                <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line-2)', transition: 'background .1s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--g-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 11 }}>
                    <Avatar name={p.n} size={34} />
                    <div className="col">
                      <div className="row" style={{ gap: 7 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }} className="nw">{p.n}</span>
                        {p.hot && <Icon name="flame" size={14} color="#ef6f4e" />}
                      </div>
                      <span className="faint" style={{ fontSize: 12 }}>{p.r} · {p.c}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="badge" style={{ background: STAGE_COLORS[p.stage] + '22', color: STAGE_COLORS[p.stage], border: '1px solid ' + STAGE_COLORS[p.stage] + '44' }}>{p.stage}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)', height: 26, fontSize: 12 }}>
                    <Icon name="bolt" size={12} color="var(--g-600)" />{p.sig}
                  </span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 6, background: 'var(--bg-2)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: p.score + '%', borderRadius: 99, background: p.score > 85 ? 'var(--g-500)' : 'var(--g-300)' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>{p.score}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.last}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="mail" size={14} /> Email</button>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="calendar" size={14} /> Book</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
