"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/ui/Icon";
import Avatar from "../../../components/ui/Avatar";
import api from "../../../lib/api";

export default function MeetingsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads')
      .then(res => {
        const items = res.data.items || [];
        setLeads(items.filter(l => l.status === 'meeting_booked' || l.status === 'won'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p className="muted">Loading meetings…</p>
      </div>
    );
  }

  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Meetings</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{leads.length} meetings booked</p>
        </div>
        <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Schedule meeting</button>
      </div>

      {leads.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Icon name="calendar" size={40} color="var(--faint)" />
          <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>No meetings booked yet</p>
          <p className="faint" style={{ fontSize: 13, marginTop: 4 }}>When prospects book meetings through your campaigns, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {leads.map((lead, i) => {
            const name = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown';
            const isWon = lead.status === 'won';
            return (
              <div key={lead.id} className="row spread" style={{
                padding: '13px 18px',
                borderBottom: i < leads.length - 1 ? '1px solid var(--line-2)' : 'none',
                gap: 12,
              }}>
                <div className="row" style={{ gap: 12 }}>
                  <Avatar name={name} size={38} />
                  <div className="col">
                    <span style={{ fontWeight: 800, fontSize: 14.5 }}>{name}</span>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {lead.title ? `${lead.title} · ` : ''}{lead.company || ''}
                    </span>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="badge" style={{
                    background: isWon ? '#f0fdf4' : 'var(--g-50)',
                    color: isWon ? '#16a34a' : 'var(--g-700)',
                  }}>
                    {isWon ? 'Closed won' : 'Meeting booked'}
                  </span>
                  {lead.email && (
                    <button className="btn btn-ghost btn-sm" style={{ height: 32 }}>
                      <Icon name="mail" size={14} /> Email
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
