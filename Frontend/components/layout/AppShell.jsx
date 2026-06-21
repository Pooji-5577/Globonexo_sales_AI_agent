"use client";
import React from "react";
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
      { id: 'leads', label: 'Leads', ico: 'users' },
      { id: 'pipeline', label: 'Pipeline', ico: 'funnel' },
      { id: 'campaigns', label: 'Campaigns', ico: 'send' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'inbox', label: 'Inbox', ico: 'inbox', badge: 9 },
      { id: 'meetings', label: 'Meetings', ico: 'calendar', badge: 3 },
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
                    {n.badge && <span style={{ marginLeft: 'auto', background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '1px 7px', lineHeight: '18px' }}>{n.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="card" style={{ marginTop: 8, padding: 12, background: 'linear-gradient(160deg,#06311f,#075a3e)', border: 'none', color: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#6fe7b0', animation: 'pulse-dot 1.4s infinite', boxShadow: '0 0 7px #6fe7b0', flex: 'none' }} />
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">Agent is working</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 5, lineHeight: 1.4 }}>Prospecting Tier-1 · next action 2m</p>
        </div>
        <button className="row nw" onClick={async () => {
          try { await api.post('/auth/logout'); } catch {}
          document.cookie = 'onboarding_complete=; path=/; max-age=0';
          window.location.href = '/';
        }} style={{ gap: 9, marginTop: 10, padding: '0 6px', height: 36, color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, flex: 'none' }}>
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
              <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 99, background: 'var(--g-500)', boxShadow: '0 0 0 2px #fff' }} />
            </button>
            <div className="row" style={{ gap: 9 }}>
              <Avatar name="Mara Ito" size={34} />
              <div className="col" style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">Mara Ito</span>
                <span className="faint nw" style={{ fontSize: 11.5 }}>Northwind Inc.</span>
              </div>
            </div>
          </div>
        </header>
        <div className="grow" style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
      </div>
    </div>
  );
}
