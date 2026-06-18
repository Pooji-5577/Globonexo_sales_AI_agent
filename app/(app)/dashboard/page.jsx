"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";

const ACTIVITY = [
  { ico: 'send', text: 'Sent intro to Devon Cole · Brightloop', t: '2m', hot: false },
  { ico: 'chat', text: 'Positive reply from Mara Ito · Northwind', t: '14m', hot: true },
  { ico: 'target', text: '23 new accounts matched your ICP', t: '31m', hot: false },
  { ico: 'calendar', text: 'Meeting booked — Acme demo, Fri 9am', t: '1h', hot: true },
  { ico: 'send', text: 'Follow-up sent to Sara Nilsen · Polar Freight', t: '2h', hot: false },
  { ico: 'flame', text: 'Brightloop opened email 4× in 20 min', t: '3h', hot: true },
];

const TASKS = [
  { ico: 'chat', text: 'Approve reply to Mara Ito (Northwind)', cta: 'Review', hot: true },
  { ico: 'mail', text: 'Review 3 draft intros before sending', cta: 'Review', hot: false },
  { ico: 'calendar', text: 'Confirm Acme demo slot — Fri 9am', cta: 'Confirm', hot: false },
];

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div className="scroll grow" style={{ padding: '22px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 26 }}>Good morning, Mara 👋</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>Your agent worked overnight. Here's where things stand.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => router.push('/agent')}>
          <Icon name="spark" size={16} color="#06231a" /> Talk to Nexo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { k: 'Emails sent', v: '84', d: '+12 vs yesterday', ico: 'send', good: true },
          { k: 'Replies', v: '19', d: '22.6% reply rate', ico: 'chat', good: true },
          { k: 'Meetings', v: '3', d: 'booked today', ico: 'calendar', good: true },
          { k: 'Hot leads', v: '7', d: 'needs your attention', ico: 'flame', good: false },
          { k: 'Pipeline', v: '$1.24M', d: '+$56k this week', ico: 'trend', good: true },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="row spread" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Agent activity feed</span>
            <button onClick={() => router.push('/agent')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--g-700)' }}>See all</button>
          </div>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="row" style={{ gap: 12, padding: '12px 18px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                <Icon name={a.ico} size={17} />
              </span>
              <span className="grow" style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-2)' }}>{a.text}</span>
              <span className="faint nw" style={{ fontSize: 12, fontWeight: 700 }}>{a.t}</span>
            </div>
          ))}
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(90deg,var(--g-50),#fff)' }}>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="spark" size={16} color="var(--g-600)" />
                <span style={{ fontWeight: 800, fontSize: 14 }}>Needs your attention</span>
                <span style={{ marginLeft: 'auto', background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '1px 7px' }}>{TASKS.length}</span>
              </div>
            </div>
            {TASKS.map((t, i) => (
              <div key={i} className="row spread" style={{ padding: '11px 16px', borderBottom: i < TASKS.length - 1 ? '1px solid var(--line-2)' : 'none', gap: 10 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center', background: t.hot ? 'var(--g-50)' : 'var(--bg-2)', color: t.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                    <Icon name={t.ico} size={15} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.35 }}>{t.text}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12.5, height: 32, padding: '0 12px', flex: 'none' }}>{t.cta}</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 16, background: 'linear-gradient(160deg,#f4fdf8,#e8f8f0)' }}>
            <div className="row spread">
              <span style={{ fontWeight: 800, fontSize: 14 }}>Weekly meeting goal</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>18 / 25</span>
            </div>
            <div style={{ height: 8, background: '#fff', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '72%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width 1s ease' }} />
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>7 more meetings to hit your target. Nexo is on pace.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => router.push('/analytics')}>
              View analytics
            </button>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div className="eyebrow">Next meeting</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Northwind — Discovery call</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Today at 2:30 PM · 30 min</div>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <Avatar name="Mara Ito" size={28} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>with Mara Ito, VP Sales</span>
            </div>
            <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 12 }}>
              <Icon name="play" size={14} /> Join call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
