"use client";
import React, { useState } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Segmented from "../../../components/ui/Segmented";

function getAgentName() {
  if (typeof window === "undefined") return "Nexo";
  return window.__agentName || "Nexo";
}

const THREADS = [
  { n: 'Mara Ito', c: 'Northwind', sub: 'Re: Cutting ramp time for your 12 new AEs', prev: "This is helpful — can we do Friday at 9?", t: '14m', unread: true, hot: true, tag: 'Positive' },
  { n: 'Devon Cole', c: 'Brightloop', sub: "Re: Quick idea for Brightloop's Q3", prev: "Opened your deck. What's pricing for 40 seats?", t: '1h', unread: true, tag: 'Pricing' },
  { n: 'Lena Park', c: 'Cobalt', sub: 'Re: RevOps benchmark report', prev: "Thanks, forwarding to my VP.", t: '3h', tag: 'Forwarded' },
  { n: 'Amir Haddad', c: 'Acme', sub: 'Re: Following up', prev: "Not right now, circle back in Q4.", t: '5h', tag: 'Nurture' },
  { n: 'Sara Nilsen', c: 'Polar Freight', sub: "Re: Saw you're hiring", prev: "Who handles this on your end?", t: '1d', tag: 'Question' },
];

export default function InboxPage() {
  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState('a');
  const visible = filter === 'h' ? THREADS.filter(t => t.hot) : THREADS;
  const th = THREADS[sel] || THREADS[0];
  const name = getAgentName();

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, alignItems: 'stretch', overflow: 'hidden' }}>
      <div className="scroll" style={{ width: 340, flex: 'none', borderRight: '1px solid var(--line)', background: '#fff' }}>
        <div className="row spread" style={{ padding: '16px 18px 12px' }}>
          <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
          <Segmented options={[{ label: 'All', value: 'a' }, { label: 'Hot', value: 'h' }]} value={filter} onChange={v => { setFilter(v); setSel(0); }} />
        </div>
        {visible.map((t, i) => {
          const globalIdx = THREADS.indexOf(t);
          return (
            <button key={globalIdx} onClick={() => setSel(globalIdx)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '13px 18px',
              borderBottom: '1px solid var(--line-2)', borderLeft: '3px solid ' + (sel === globalIdx ? 'var(--g-500)' : 'transparent'),
              background: sel === globalIdx ? 'var(--g-50)' : '#fff', transition: 'all .12s',
            }}>
              <div className="row spread">
                <div className="row" style={{ gap: 9 }}>
                  <Avatar name={t.n} size={34} />
                  <div className="col">
                    <div className="row" style={{ gap: 6, fontWeight: 800, fontSize: 13.5 }}>
                      <span className="nw">{t.n}</span>{t.hot && <Icon name="flame" size={13} color="#ef6f4e" />}
                    </div>
                    <span className="faint nw" style={{ fontSize: 11.5 }}>{t.c}</span>
                  </div>
                </div>
                <span className="faint nw" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.t}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 7, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sub}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.prev}</div>
              <span className="badge" style={{ marginTop: 7, background: 'var(--bg-2)', color: 'var(--ink-2)' }}>{t.tag}</span>
            </button>
          );
        })}
      </div>
      <div className="grow col" style={{ minWidth: 0, background: 'var(--bg)' }}>
        <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', background: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 11 }}>
            <Avatar name={th.n} size={40} />
            <div className="col">
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{th.n} · {th.c}</span>
              <span className="faint ellip" style={{ fontSize: 12.5 }}>{th.sub}</span>
            </div>
          </div>
          <span className="chip"><span className="dot" /> {th.tag}</span>
        </div>
        <div className="scroll grow" style={{ padding: '20px 24px' }}>
          <div className="card" style={{ padding: 18, maxWidth: 620 }}>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Avatar name={th.n} size={32} />
              <div className="col"><span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{th.n}</span><span className="faint" style={{ fontSize: 12 }}>to me · {th.t} ago</span></div>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>{th.prev} Looking forward to it — let me know what works.</p>
          </div>
          <div className="card" style={{ padding: 0, maxWidth: 620, marginTop: 16, overflow: 'hidden', boxShadow: 'var(--sh-md)' }}>
            <div className="row spread" style={{ padding: '11px 16px', background: 'linear-gradient(90deg,var(--g-50),#fff)', borderBottom: '1px solid var(--g-100)' }}>
              <div className="row" style={{ gap: 8 }}><Icon name="spark" size={16} color="var(--g-600)" /><span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{name} drafted a reply</span></div>
              <span className="chip" style={{ height: 22, fontSize: 11 }}>Recommended</span>
            </div>
            <div style={{ padding: '14px 16px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
              Hi {th.n.split(' ')[0]} — Friday at 9:00 works perfectly. I&apos;ll send a calendar invite with a short agenda so we keep it to 25 minutes. Talk soon!
            </div>
            <div className="row" style={{ gap: 9, padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
              <button className="btn btn-primary btn-sm"><Icon name="send" size={14} color="#06231a" /> Approve & send</button>
              <button className="btn btn-ghost btn-sm"><Icon name="spark" size={14} /> Regenerate</button>
              <button className="btn btn-ghost btn-sm">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
