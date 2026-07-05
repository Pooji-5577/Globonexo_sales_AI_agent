"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import api from "../../lib/api";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
      { id: 'agent', label: 'AI Agent', ico: 'spark' },
    ]
  },
  {
    label: 'Sales',
    items: [
      { id: 'prospects', label: 'Prospects', ico: 'users' },
      { id: 'leads', label: 'Leads', ico: 'doc' },
      { id: 'pipeline', label: 'Pipeline', ico: 'funnel' },
      { id: 'campaigns', label: 'Campaigns', ico: 'send' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'inbox', label: 'Inbox', ico: 'inbox' },
      { id: 'meetings', label: 'Meetings', ico: 'calendar' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', ico: 'trend' },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', ico: 'star' },
      { id: 'settings', label: 'Settings', ico: 'sliders' },
    ]
  },
];

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split('/')[1] || 'dashboard';
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.user);
        setOrg(res.data.organization);
      })
      .catch(() => {});
  }, []);

  const userName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : '';
  const orgName = org?.name || '';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    window.location.href = '/login';
  };

  return (
    <div className="screen" style={{ flexDirection: 'row', background: 'var(--bg)' }}>
      <aside style={{ width: 248, flex: 'none', background: '#fff', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
        <div style={{ padding: '4px 6px 16px' }}><Logo size={28} /></div>
        <button className="btn btn-primary btn-sm" style={{ marginBottom: 14, fontSize: 13.5 }} onClick={() => router.push('/campaigns/new')}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>

        <nav className="col scroll grow" style={{ gap: 0 }}>
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {g.label && <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', padding: '10px 10px 4px' }}>{g.label}</div>}
              {g.items.map(n => {
                const active = activeTab === n.id;
                return (
                  <button key={n.id} onClick={() => router.push('/' + n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 10px', width: '100%',
                    borderRadius: 10, fontWeight: 700, fontSize: 14, textAlign: 'left',
                    color: active ? '#06231a' : 'var(--ink-2)',
                    background: active ? 'var(--g-50)' : 'transparent',
                    boxShadow: active ? 'inset 0 0 0 1px var(--g-100)' : 'none', transition: 'all .12s',
                  }}>
                    <Icon name={n.ico} size={18} color={active ? 'var(--g-600)' : 'var(--muted)'} />
                    <span className="nw">{n.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button className="row nw" onClick={handleLogout} style={{ gap: 9, marginTop: 10, padding: '0 6px', height: 36, color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, flex: 'none' }}>
          <Icon name="logout" size={17} /> Log out
        </button>
      </aside>

      <div className="grow col" style={{ minWidth: 0 }}>
        <header className="row spread" style={{ height: 62, flex: 'none', padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)' }}>
          <div className="input-wrap" style={{ width: 320 }}>
            <span className="lead-ico"><Icon name="search" size={17} /></span>
            <input className="input has-ico" style={{ height: 40, background: 'var(--bg)', fontSize: 14 }} placeholder="Search leads, accounts, replies…" />
          </div>
          <div className="row" style={{ gap: 14 }}>
            <button style={{ position: 'relative', color: 'var(--muted)' }}>
              <Icon name="bell" size={20} />
            </button>
            {userName && (
              <div className="row" style={{ gap: 9 }}>
                <Avatar name={userName} size={34} />
                <div className="col" style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{userName}</span>
                  <span className="faint nw" style={{ fontSize: 11.5 }}>{orgName}</span>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="grow" style={{ minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
      </div>
    </div>
  );
}
