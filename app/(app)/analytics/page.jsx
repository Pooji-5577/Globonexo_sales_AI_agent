"use client";
import React from "react";

const WEEKLY = [12, 15, 11, 18, 14, 20, 18];
const DAILY_EMAILS = [62, 78, 84, 91, 70, 88, 84];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const PIPELINE_TREND = [180, 340, 520, 680, 900, 1240];

function BarChart({ title, data, labels, color, max }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{title}</div>
      <div className="row" style={{ gap: 8, alignItems: 'flex-end', height: 100 }}>
        {data.map((v, i) => (
          <div key={i} className="col center grow" style={{ gap: 4 }}>
            <div style={{ width: '100%', height: (v / max) * 90, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height .5s ease' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--faint)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ title, data, labels }) {
  const w = 360, h = 100;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - 40) + 20},${h - (v / max) * (h - 20) - 10}`).join(' ');
  const area = `M${pts.split(' ').join('L')} L${(data.length - 1) / (data.length - 1) * (w - 40) + 20},${h} L20,${h} Z`;
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: 120 }}>
        <defs>
          <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--g-400)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--g-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg-area)" />
        <polyline points={pts} fill="none" stroke="var(--g-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * (w - 40) + 20;
          const y = h - (v / max) * (h - 20) - 10;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--g-500)" stroke="#fff" strokeWidth="1.5" />;
        })}
        {labels.map((l, i) => (
          <text key={i} x={(i / (labels.length - 1)) * (w - 40) + 20} y={h + 16} textAnchor="middle" fill="var(--faint)" fontSize="11" fontWeight="700">{l}</text>
        ))}
      </svg>
    </div>
  );
}

function FunnelChart() {
  const stages = [
    { label: 'Prospects found', v: 1284, pct: 100, color: '#d1fae5' },
    { label: 'Emailed', v: 584, pct: 45, color: 'var(--g-300)' },
    { label: 'Replied', v: 132, pct: 10, color: 'var(--g-400)' },
    { label: 'Meeting booked', v: 47, pct: 4, color: 'var(--g-500)' },
    { label: 'Closed', v: 8, pct: 0.6, color: 'var(--g-700)' },
  ];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Conversion funnel</div>
      <div className="col" style={{ gap: 8 }}>
        {stages.map((s, i) => (
          <div key={i} className="row" style={{ gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', width: 130, flex: 'none', textAlign: 'right' }}>{s.label}</span>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.max(s.pct, 1) + '%', background: s.color, borderRadius: 6, transition: 'width .6s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', width: 40 }}>{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 22 }}>Analytics</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Performance over the last 30 days</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ k: 'Meetings booked', v: '18', d: '+38% vs last month' }, { k: 'Reply rate', v: '22.6%', d: '+4.2 pts' }, { k: 'Emails sent', v: '584', d: 'This month' }, { k: 'Pipeline added', v: '$1.24M', d: '+$380k vs last month' }].map(s => (
          <div key={s.k} className="card" style={{ padding: 16 }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{s.v}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g-700)', marginTop: 4, display: 'block' }}>{s.d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <BarChart title="Meetings booked (last 7 days)" data={WEEKLY} labels={['M','T','W','T','F','S','S']} color="var(--g-500)" max={25} />
        <BarChart title="Emails sent (last 7 days)" data={DAILY_EMAILS} labels={['M','T','W','T','F','S','S']} color="var(--teal)" max={120} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <LineChart title="Pipeline value growth ($k)" data={PIPELINE_TREND} labels={MONTHS} />
        <FunnelChart />
      </div>
    </div>
  );
}
