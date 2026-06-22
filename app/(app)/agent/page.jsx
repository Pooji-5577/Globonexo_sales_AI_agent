"use client";
import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Typing from "../../../components/ui/Typing";
import api from "../../../lib/api";

function getAgentName() {
  if (typeof window === "undefined") return "Nexo";
  return window.__agentName || "Nexo";
}

const QUICK = ['Draft follow-ups for no-replies', 'Find 50 new ICP accounts', 'Summarize hottest leads', 'Pause weekend sending'];

function Bubble({ m, name }) {
  const isUser = m.who === 'user';
  const AgentAvatar = () => (
    <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none' }}>
      <Icon name="spark" size={17} color="#06231a" />
    </span>
  );
  if (m.kind === 'text') {
    return (
      <div className="row" style={{ gap: 9, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && <AgentAvatar />}
        <div style={{
          maxWidth: 480, padding: '12px 16px', fontSize: 14.5, lineHeight: 1.55,
          borderRadius: 18, fontWeight: isUser ? 600 : 500,
          background: isUser ? 'linear-gradient(180deg,var(--g-400),var(--g-500))' : '#fff',
          color: isUser ? '#06231a' : 'var(--ink)',
          border: isUser ? 'none' : '1px solid var(--line)',
          borderTopRightRadius: isUser ? 4 : 18, borderTopLeftRadius: isUser ? 18 : 4,
          boxShadow: isUser ? 'var(--sh-green)' : 'var(--sh-xs)',
        }}>{m.text}</div>
      </div>
    );
  }
  if (m.kind === 'stats') {
    return (
      <div className="row" style={{ gap: 9 }}>
        <AgentAvatar />
        <div className="row" style={{ gap: 9 }}>
          {(m.stats || []).map(([v, k]) => (
            <div key={k} className="card" style={{ padding: '11px 14px', textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, color: 'var(--g-700)' }}>{v}</div>
              <div className="faint" style={{ fontSize: 11, fontWeight: 700 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function AgentPage() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sidebarData, setSidebarData] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const scrollRef = useRef(null);
  const name = getAgentName();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        const d = res.data;
        setSidebarData(d);
        const kpis = d.kpis || {};
        const firstName = d.user?.firstName || 'there';
        setMsgs([
          { who: 'agent', kind: 'text', text: `Hi ${firstName} 👋 Here's your current status:` },
          { who: 'agent', kind: 'stats', stats: [
            [kpis.emailsSent ?? 0, 'emails sent'],
            [kpis.replies ?? 0, 'replies'],
            [kpis.meetings ?? 0, 'meetings booked'],
          ]},
          { who: 'agent', kind: 'text', text: kpis.hotLeads > 0
            ? `You have ${kpis.hotLeads} hot leads that need attention. What would you like me to do?`
            : 'Everything looks good. What would you like me to work on?'
          },
        ]);
      })
      .catch(() => {
        setMsgs([
          { who: 'agent', kind: 'text', text: `Hi 👋 I'm ${name}, your AI sales agent. How can I help?` },
        ]);
      })
      .finally(() => setInitialLoaded(true));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setMsgs(m => [...m, { who: 'user', kind: 'text', text: t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { who: 'agent', kind: 'text', text: "On it — I'll handle that and report back. Anything worth your attention will land in your Inbox with a summary." }]);
    }, 1400);
  };

  const kpis = sidebarData?.kpis ?? {};
  const activity = sidebarData?.activity ?? [];

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, alignItems: 'stretch', overflow: 'hidden' }}>
      <div className="grow col" style={{ minWidth: 0 }}>
        <div className="row spread" style={{ padding: '16px 24px 12px', flex: 'none', borderBottom: '1px solid var(--line)' }}>
          <div className="row" style={{ gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-green)', flex: 'none' }}>
              <Icon name="spark" size={22} color="#06231a" />
            </span>
            <div className="col">
              <div className="row" style={{ gap: 8 }}>
                <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{name}</span>
                <span className="chip"><span className="dot" style={{ animation: 'pulse-dot 1.4s infinite' }} /> Active</span>
              </div>
              <span className="faint" style={{ fontSize: 12.5 }}>Your autonomous sales agent</span>
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="scroll grow" style={{ padding: '16px 24px', minHeight: 0 }}>
          <div className="col" style={{ gap: 14, maxWidth: 700, margin: '0 auto', paddingBottom: 8 }}>
            {!initialLoaded ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <p className="muted">Loading…</p>
              </div>
            ) : (
              msgs.map((m, i) => <Bubble key={i} m={m} name={name} />)
            )}
            {typing && (
              <div className="row" style={{ gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="spark" size={17} color="#06231a" /></span>
                <div className="card" style={{ padding: '10px 14px', borderTopLeftRadius: 4 }}><Typing /></div>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 'none', padding: '10px 24px 18px', borderTop: '1px solid var(--line)', background: '#fff' }}>
          <div className="row wrap" style={{ gap: 7, maxWidth: 700, margin: '0 auto 10px' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} className="chip" style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--line)', color: 'var(--ink-2)', height: 30, fontSize: 12.5 }}>
                <Icon name="bolt" size={12} color="var(--g-600)" /> {q}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 10, maxWidth: 700, margin: '0 auto' }}>
            <div className="input-wrap grow">
              <input className="input" style={{ height: 50 }} placeholder={`Ask ${name} to prospect, draft, or follow up…`} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            </div>
            <button className="btn btn-primary" style={{ width: 50, height: 50, padding: 0, borderRadius: 14, flex: 'none' }} onClick={() => send()}>
              <Icon name="send" size={19} color="#06231a" />
            </button>
          </div>
        </div>
      </div>

      <aside className="scroll" style={{ width: 300, flex: 'none', borderLeft: '1px solid var(--line)', background: '#fff', padding: 18 }}>
        <span className="eyebrow">Overview</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[
            { k: 'Emails sent', v: kpis.emailsSent ?? 0, ico: 'send' },
            { k: 'Replies', v: kpis.replies ?? 0, ico: 'chat' },
            { k: 'Meetings', v: kpis.meetings ?? 0, ico: 'calendar' },
            { k: 'Hot leads', v: kpis.hotLeads ?? 0, ico: 'flame' },
          ].map(s => (
            <div key={s.k} className="card" style={{ padding: 12 }}>
              <Icon name={s.ico} size={16} color="var(--g-600)" />
              <div className="display" style={{ fontSize: 24, marginTop: 6 }}>{s.v}</div>
              <div className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.k}</div>
            </div>
          ))}
        </div>
        <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Recent activity</span>
        <div className="col" style={{ gap: 2, marginTop: 10 }}>
          {activity.length === 0 ? (
            <p className="faint" style={{ fontSize: 12.5, padding: '8px 0' }}>No recent activity.</p>
          ) : (
            activity.slice(0, 5).map((a, i) => (
              <div key={i} className="row" style={{ gap: 10, padding: '9px 6px', borderRadius: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                  <Icon name={a.type === 'reply' ? 'chat' : a.type === 'meeting' ? 'calendar' : 'send'} size={15} />
                </span>
                <div className="col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</span>
                  <span className="faint" style={{ fontSize: 11.5 }}>{a.timeAgo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
