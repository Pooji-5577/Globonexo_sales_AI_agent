"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

function getAgentName() {
  if (typeof window === "undefined") return "Nexo";
  return window.__agentName || "Nexo";
}

export default function InboxPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const name = getAgentName();

  useEffect(() => {
    api.get('/inbox')
      .then(res => setThreads(res.data.threads || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading inbox…</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="inbox" size={40} color="var(--faint)" />
        <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>Your inbox is empty</p>
        <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>Replies from prospects will appear here.</p>
      </div>
    );
  }

  const th = threads[sel] || threads[0];

  return (
    <div className="row" style={{ flex: 1, minHeight: 0, alignItems: 'stretch', overflow: 'hidden' }}>
      <div className="scroll" style={{ width: 340, flex: 'none', borderRight: '1px solid var(--line)', background: '#fff' }}>
        <div className="row spread" style={{ padding: '16px 18px 12px' }}>
          <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
          <span className="faint" style={{ fontSize: 13, fontWeight: 700 }}>{threads.length} threads</span>
        </div>
        {threads.map((t, i) => (
          <button key={t.id} onClick={() => setSel(i)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '13px 18px',
            borderBottom: '1px solid var(--line-2)', borderLeft: '3px solid ' + (sel === i ? 'var(--g-500)' : 'transparent'),
            background: sel === i ? 'var(--g-50)' : '#fff', transition: 'all .12s',
          }}>
            <div className="row spread">
              <div className="row" style={{ gap: 9 }}>
                <Avatar name={t.name} size={34} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{t.name}</span>
                  <span className="faint nw" style={{ fontSize: 11.5 }}>{t.company}</span>
                </div>
              </div>
              <span className="faint nw" style={{ fontSize: 11.5, fontWeight: 700 }}>{t.time}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 7, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.preview}</div>
          </button>
        ))}
      </div>
      <div className="grow col" style={{ minWidth: 0, background: 'var(--bg)' }}>
        <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', background: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 11 }}>
            <Avatar name={th.name} size={40} />
            <div className="col">
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{th.name} · {th.company}</span>
              <span className="faint ellip" style={{ fontSize: 12.5 }}>{th.subject}</span>
            </div>
          </div>
        </div>
        <div className="scroll grow" style={{ padding: '20px 24px' }}>
          <div className="card" style={{ padding: 18, maxWidth: 620 }}>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Avatar name={th.name} size={32} />
              <div className="col">
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{th.name}</span>
                <span className="faint" style={{ fontSize: 12 }}>received {th.time}</span>
              </div>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>{th.preview}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
