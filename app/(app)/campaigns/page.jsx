"use client";
import React from "react";
import Icon from "../../../components/ui/Icon";

const CAMPAIGNS_DATA = [
  { name: 'SaaS VP Sales — Q3 push', status: 'Active', enrolled: 142, sent: 284, opens: '68%', replies: '24%', meetings: 18, created: '2 weeks ago' },
  { name: 'Series B funded — hiring signal', status: 'Active', enrolled: 87, sent: 174, opens: '72%', replies: '31%', meetings: 12, created: '10 days ago' },
  { name: 'Re-engage cold Q1 pipeline', status: 'Paused', enrolled: 63, sent: 126, opens: '54%', replies: '18%', meetings: 5, created: '3 weeks ago' },
  { name: 'Enterprise healthcare outbound', status: 'Draft', enrolled: 0, sent: 0, opens: '—', replies: '—', meetings: 0, created: '1 day ago' },
];
const STATUS_STYLES = {
  Active: { bg: 'var(--g-50)', color: 'var(--g-700)', dot: 'var(--g-500)' },
  Paused: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Draft: { bg: 'var(--bg-2)', color: 'var(--faint)', dot: 'var(--faint)' },
};

export default function CampaignsPage() {
  return (
    <div className="col" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Campaigns</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>4 sequences · 2 active · 30 meetings booked this month</p>
        </div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={15} color="#06231a" /> New campaign</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        {[{ k: 'Total enrolled', v: '292' }, { k: 'Emails sent', v: '584' }, { k: 'Avg reply rate', v: '24%' }, { k: 'Meetings from campaigns', v: '30' }].map(s => (
          <div key={s.k} className="card" style={{ padding: '12px 16px' }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 26, marginTop: 5 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="scroll grow" style={{ padding: '16px 24px', minHeight: 0 }}>
        <div className="col" style={{ gap: 12 }}>
          {CAMPAIGNS_DATA.map((c, i) => {
            const ss = STATUS_STYLES[c.status];
            return (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div className="row spread">
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                      <Icon name="send" size={20} color="var(--g-600)" />
                    </span>
                    <div className="col">
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</span>
                      <span className="faint" style={{ fontSize: 12.5 }}>Created {c.created}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="badge" style={{ background: ss.bg, color: ss.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: ss.dot, flex: 'none' }} />{c.status}
                    </span>
                    <button className="btn btn-ghost btn-sm" style={{ height: 32 }}>{c.status === 'Active' ? 'Pause' : c.status === 'Paused' ? 'Resume' : 'Launch'}</button>
                    <button className="btn btn-ghost btn-sm" style={{ height: 32 }}>Edit</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
                  {[['Enrolled', c.enrolled], ['Emails sent', c.sent], ['Open rate', c.opens], ['Reply rate', c.replies], ['Meetings', c.meetings]].map(([k, v]) => (
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
      </div>
    </div>
  );
}
