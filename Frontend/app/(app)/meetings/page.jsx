"use client";
import React from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";

const MTG_DATA = [
  { n: 'Mara Ito', c: 'Northwind', type: 'Discovery call', date: 'Today', time: '2:30 PM', dur: '30 min', status: 'Upcoming', link: true },
  { n: 'Devon Cole', c: 'Brightloop', type: 'Product demo', date: 'Tomorrow', time: '10:00 AM', dur: '45 min', status: 'Upcoming', link: true },
  { n: 'Amir Haddad', c: 'Acme', type: 'Follow-up call', date: 'Wed, Jun 11', time: '3:00 PM', dur: '30 min', status: 'Upcoming', link: false },
  { n: 'Lena Park', c: 'Cobalt', type: 'Technical review', date: 'Thu, Jun 12', time: '11:00 AM', dur: '60 min', status: 'Upcoming', link: false },
  { n: 'Priya Raman', c: 'Loom Health', type: 'Closing call', date: 'Mon, Jun 2', time: '2:00 PM', dur: '30 min', status: 'Completed', link: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', type: 'Intro call', date: 'Fri, May 30', time: '9:00 AM', dur: '20 min', status: 'Cancelled', link: false },
];
const MTG_STATUS = {
  Upcoming: { bg: 'var(--g-50)', color: 'var(--g-700)' },
  Completed: { bg: '#f0f9ff', color: '#0369a1' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

export default function MeetingsPage() {
  const upcoming = MTG_DATA.filter(m => m.status === 'Upcoming');
  const past = MTG_DATA.filter(m => m.status !== 'Upcoming');
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Meetings</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>18 booked this week · 3 today</p>
        </div>
        <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Schedule meeting</button>
      </div>
      <div className="card" style={{ padding: 18, marginBottom: 20, background: 'linear-gradient(135deg,#f4fdf8,#eafaf2)', border: '1px solid var(--g-100)' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Today · {upcoming.filter(m=>m.date==='Today').length} meetings</div>
        <div className="col" style={{ gap: 10 }}>
          {upcoming.filter(m => m.date === 'Today').map((m, i) => (
            <div key={i} className="row spread" style={{ padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--g-100)' }}>
              <div className="row" style={{ gap: 12 }}>
                <Avatar name={m.n} size={38} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>{m.type}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {m.link && <button className="btn btn-primary btn-sm"><Icon name="play" size={14} /> Join call</button>}
                <button className="btn btn-ghost btn-sm">Prep brief</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Upcoming</div>
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        {upcoming.filter(m => m.date !== 'Today').map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', gap: 12 }}>
            <div className="row" style={{ gap: 20 }}>
              <div style={{ width: 72, textAlign: 'center', flex: 'none' }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--g-700)', textTransform: 'uppercase' }}>{m.date.split(', ')[0]}</div>
                <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{m.date.split(' ').pop()}</div>
              </div>
              <div className="row" style={{ gap: 14, marginLeft: 14 }}>
                <Avatar name={m.n} size={36} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{m.type}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Past meetings</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {past.map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', opacity: m.status === 'Cancelled' ? 0.55 : 1 }}>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={m.n} size={34} />
              <div className="col">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{m.type} · {m.n}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>{m.date} · {m.time} · {m.c}</span>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
