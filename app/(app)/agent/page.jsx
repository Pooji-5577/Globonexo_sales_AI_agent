"use client";
import React, { useState, useRef, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import Typing from "../../../components/ui/Typing";
import api from "../../../lib/api";

const QUICK = ['Draft follow-ups for no-replies', 'Give me 50 ICP leads', 'Summarize hottest leads', 'Pause weekend sending'];

const STAT_ICONS = { 'emails sent': 'send', 'replies': 'chat', 'meetings booked': 'calendar' };

function apiMessageToMsg(m) {
  return {
    id: m.id,
    who: m.role === 'user' ? 'user' : 'agent',
    kind: m.kind || 'text',
    text: m.content,
    stats: m.metadata?.stats,
    drafts: m.metadata?.drafts,
  };
}

const bubbleStyle = (isUser) => ({
  maxWidth: 480, padding: '12px 16px', fontSize: 14.5, lineHeight: 1.55,
  borderRadius: 18, fontWeight: isUser ? 600 : 500, whiteSpace: 'pre-line',
  background: isUser ? 'linear-gradient(180deg,var(--g-400),var(--g-500))' : '#fff',
  color: isUser ? '#06231a' : 'var(--ink)',
  border: isUser ? 'none' : '1px solid var(--line)',
  borderTopRightRadius: isUser ? 4 : 18, borderTopLeftRadius: isUser ? 18 : 4,
  boxShadow: isUser ? 'var(--sh-green)' : 'var(--sh-xs)',
});

function AgentAvatar() {
  return (
    <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: '0 4px 12px rgba(0,168,106,.22)' }}>
      <Icon name="spark" size={17} color="#06231a" />
    </span>
  );
}

function TextRow({ text, isUser }) {
  return (
    <div className="row" style={{ gap: 9, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <AgentAvatar />}
      <div style={bubbleStyle(isUser)}>{text}</div>
    </div>
  );
}

function DraftCard({ draft }) {
  const [status, setStatus] = useState('pending');
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(draft.subject || '');
  const [body, setBody] = useState(draft.body || '');
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState('');

  const approve = async () => {
    setBusy(true);
    setErrorText('');
    try {
      await api.post(`/emails/drafts/${draft.id}/approve`);
      setStatus('approved');
    } catch (err) {
      setErrorText(err?.response?.data?.error || 'Failed to approve this draft.');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    setErrorText('');
    try {
      await api.post(`/emails/drafts/${draft.id}/reject`);
      setStatus('rejected');
    } catch (err) {
      setErrorText(err?.response?.data?.error || 'Failed to reject this draft.');
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    setErrorText('');
    try {
      await api.patch(`/emails/drafts/${draft.id}`, { subject, body });
      setEditing(false);
    } catch (err) {
      setErrorText(err?.response?.data?.error || 'Failed to save changes.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 16, maxWidth: 480, borderRadius: 16 }}>
      <div className="row" style={{ gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <Avatar name={draft.leadName || 'Lead'} size={32} />
        <div className="col grow" style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{draft.leadName}</span>
          {draft.company && <span className="faint" style={{ fontSize: 11.5 }}>{draft.company}</span>}
        </div>
        {status !== 'pending' && (
          <span className="chip" style={{ fontSize: 11, flex: 'none' }}>
            {status === 'approved' ? 'Approved · queued to send' : 'Rejected'}
          </span>
        )}
      </div>

      {editing ? (
        <div className="col" style={{ gap: 6 }}>
          <input className="input" value={subject} onChange={e => setSubject(e.target.value)} disabled={busy} />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={busy}
            style={{
              width: '100%', minHeight: 120, resize: 'vertical', border: '1px solid var(--line)',
              borderRadius: 8, padding: '10px 12px', font: 'inherit', fontSize: 13.5, lineHeight: 1.55,
              color: 'var(--ink-2)', background: '#fff', outline: 'none',
            }}
          />
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{subject}</div>
          <div className="faint" style={{ fontSize: 12.5, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      )}

      {errorText && <p style={{ color: 'var(--red-600, #c0392b)', fontSize: 12, marginTop: 8 }}>{errorText}</p>}

      {status === 'pending' && (
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          {editing ? (
            <>
              <button className="btn btn-primary btn-sm" disabled={busy || !subject.trim() || !body.trim()} onClick={saveEdit}>Save</button>
              <button className="btn btn-sm" disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={approve}>Approve</button>
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-ghost btn-sm btn-reject" disabled={busy} onClick={reject}>Reject</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Bubble({ m }) {
  const isUser = m.who === 'user';

  if (m.kind === 'stats') {
    return (
      <div className="col" style={{ gap: 10 }}>
        {m.text && <TextRow text={m.text} isUser={false} />}
        {(m.stats || []).length > 0 && (
          <div className="row" style={{ gap: 9, marginLeft: 41 }}>
            {m.stats.map(([v, k]) => (
              <div key={k} className="card kpi-card-accent" style={{ padding: '12px 14px 11px', minWidth: 106, borderRadius: 14 }}>
                <span className="kpi-icon-badge" style={{ width: 26, height: 26, borderRadius: 8 }}>
                  <Icon name={STAT_ICONS[k] || 'trend'} size={14} />
                </span>
                <div className="display" style={{ fontSize: 20, color: 'var(--g-700)', marginTop: 8 }}>{v}</div>
                <div className="faint" style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (m.kind === 'draft_review') {
    return (
      <div className="col" style={{ gap: 10 }}>
        {m.text && <TextRow text={m.text} isUser={false} />}
        {(m.drafts || []).length > 0 && (
          <div className="col" style={{ gap: 10, marginLeft: 41 }}>
            {m.drafts.map(d => <DraftCard key={d.id} draft={d} />)}
          </div>
        )}
      </div>
    );
  }

  return <TextRow text={m.text} isUser={isUser} />;
}

export default function AgentPage() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sidebarData, setSidebarData] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [name, setName] = useState('GNX sales');
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard').catch(() => null),
      api.get('/agent/messages').catch(() => null),
    ]).then(([dashboardRes, messagesRes]) => {
      const d = dashboardRes?.data;
      if (d) {
        setSidebarData(d);
        if (d.agentName) setName(d.agentName);
      }

      const items = messagesRes?.data?.items || [];
      if (items.length > 0) {
        setMsgs(items.map(apiMessageToMsg));
        return;
      }

      if (d) {
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
      } else {
        setMsgs([
          { who: 'agent', kind: 'text', text: `Hi 👋 I'm ${name}, your AI sales agent. How can I help?` },
        ]);
      }
    }).finally(() => setInitialLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setMsgs(m => [...m, { who: 'user', kind: 'text', text: t }]);
    setInput('');
    setTyping(true);

    try {
      // Search/draft tools can chase Apollo results across several calls plus
      // an extra LLM round-trip, so this needs real headroom past the 10s
      // default set on the shared api client.
      const { data } = await api.post('/agent/chat', { message: t }, { timeout: 60000 });
      setMsgs(m => [...m, apiMessageToMsg(data)]);
    } catch (err) {
      const isTimeout = err?.code === 'ECONNABORTED';
      const reason = err?.response?.data?.error
        || (isTimeout
          ? "That took too long to finish. It may still be running - check the relevant page, or try again."
          : "Something went wrong reaching the agent. Please try again.");
      setMsgs(m => [...m, { who: 'agent', kind: 'text', text: reason }]);
    } finally {
      setTyping(false);
    }
  };

  const kpis = sidebarData?.kpis ?? {};
  const activity = sidebarData?.activity ?? [];

  return (
    <div className="row agent-page" style={{ flex: 1, minHeight: 0, alignItems: 'stretch', overflow: 'hidden' }}>
      <div className="grow col agent-chat-pane" style={{ minWidth: 0 }}>
        <div className="row spread agent-chat-head" style={{ padding: '16px 24px 12px', flex: 'none', borderBottom: '1px solid var(--line)' }}>
          <div className="row" style={{ gap: 12 }}>
            <span className="agent-avatar-ring" style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', flex: 'none' }}>
              <Icon name="spark" size={22} color="#06231a" />
            </span>
            <div className="col">
              <div className="row" style={{ gap: 8 }}>
                <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{name}</span>
                <span className="chip agent-status-chip"><span className="dot" style={{ animation: 'pulse-dot 1.4s infinite' }} /> Active</span>
              </div>
              <span className="faint" style={{ fontSize: 12.5 }}>Your autonomous sales agent</span>
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="scroll grow agent-chat-scroll" style={{ padding: '16px 24px', minHeight: 0 }}>
          <div className="col agent-message-list" style={{ gap: 14, maxWidth: 700, margin: '0 auto', paddingBottom: 8 }}>
            {!initialLoaded ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <p className="muted">Loading…</p>
              </div>
            ) : (
              msgs.map((m, i) => <Bubble key={m.id ?? i} m={m} />)
            )}
            {typing && (
              <div className="row" style={{ gap: 9 }}>
                <AgentAvatar />
                <div className="card" style={{ padding: '10px 14px', borderTopLeftRadius: 4 }}><Typing /></div>
              </div>
            )}
          </div>
        </div>
        <div className="agent-composer" style={{ flex: 'none', padding: '10px 24px 18px', borderTop: '1px solid var(--line)', background: '#fff' }}>
          <div className="row wrap agent-quick-actions" style={{ gap: 7, maxWidth: 700, margin: '0 auto 10px' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} className="chip" style={{ cursor: 'pointer', background: '#fff', border: '1px solid var(--line)', color: 'var(--ink-2)', height: 30, fontSize: 12.5 }} disabled={typing}>
                <Icon name="bolt" size={12} color="var(--g-600)" /> {q}
              </button>
            ))}
          </div>
          <div className="row agent-input-row" style={{ gap: 10, maxWidth: 700, margin: '0 auto' }}>
            <div className="input-wrap grow">
              <span className="lead-ico"><Icon name="spark" size={16} /></span>
              <input className="input has-ico" style={{ height: 50 }} placeholder={`Ask ${name} to prospect, draft, or follow up…`} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={typing} />
            </div>
            <button className="btn btn-primary agent-send-btn" style={{ width: 50, height: 50, padding: 0, borderRadius: 14, flex: 'none' }} onClick={() => send()} disabled={typing}>
              <Icon name="send" size={19} color="#06231a" />
            </button>
          </div>
        </div>
      </div>

      <aside data-tour="agent-overview" className="scroll agent-overview-panel" style={{ width: 300, flex: 'none', borderLeft: '1px solid var(--line)', background: '#fff', padding: 18 }}>
        <span className="eyebrow">Overview</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[
            { k: 'Emails sent', v: kpis.emailsSent ?? 0, ico: 'send' },
            { k: 'Replies', v: kpis.replies ?? 0, ico: 'chat' },
            { k: 'Meetings', v: kpis.meetings ?? 0, ico: 'calendar' },
            { k: 'Hot leads', v: kpis.hotLeads ?? 0, ico: 'flame', warn: true },
          ].map(s => (
            <div key={s.k} className="card kpi-card-accent" data-tone={s.warn ? 'warn' : undefined} style={{ padding: 14, borderRadius: 14 }}>
              <span className="kpi-icon-badge" data-tone={s.warn ? 'warn' : undefined}>
                <Icon name={s.ico} size={15} />
              </span>
              <div className="display" style={{ fontSize: 22, marginTop: 8 }}>{s.v}</div>
              <div className="faint" style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{s.k}</div>
            </div>
          ))}
        </div>
        <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Recent activity</span>
        <div className="col" style={{ gap: 2, marginTop: 10 }}>
          {activity.length === 0 ? (
            <p className="faint" style={{ fontSize: 12.5, padding: '8px 0' }}>No recent activity.</p>
          ) : (
            activity.slice(0, 5).map((a, i) => (
              <div key={i} className="row agent-activity-row" style={{ gap: 10, padding: '9px 6px' }}>
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
