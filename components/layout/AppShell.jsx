"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../ui/Logo";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import api from "../../lib/api";
import { hasWorkspaceAccess } from "../../lib/billingAccess";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', ico: 'grid' },
      { id: 'setup', label: 'Get set up', ico: 'checkCircle' },
      { id: 'agent', label: 'AI Agent', ico: 'spark' },
    ]
  },
  {
    label: 'Sales',
    items: [
      { id: 'prospects', label: 'Prospects', ico: 'users' },
      { id: 'pipeline', label: 'Pipeline', ico: 'funnel' },
      { id: 'campaigns', label: 'Campaigns', ico: 'send' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { id: 'inbox', label: 'Inbox', ico: 'inbox' },
      { id: 'calls', label: 'Call History', ico: 'phone' },
      { id: 'calendar', label: 'Calendar', ico: 'calendar' },
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
      { id: 'support', label: 'Support', ico: 'chat' },
    ]
  },
];

// Routes an unpaid account may still reach inside the shell. /billing is not
// one of them any more — accounts without entitlement are sent to the
// standalone /subscribe checkout, which renders outside this shell entirely.
const BILLING_ALLOWED_PATHS = ['/support'];

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split('/')[1] || 'dashboard';
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [notifications, setNotifications] = useState({ items: [], unreadCount: 0 });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    let active = true;
    setAuthChecked(false);
    const next = encodeURIComponent(pathname || '/dashboard');
    const redirectToLogin = () => {
      if (!active) return;
      active = false;
      window.location.assign(`/login?next=${next}`);
    };
    const timeoutId = window.setTimeout(redirectToLogin, 8000);

    api.get('/auth/me')
      .then(res => {
        if (!active) return;
        setUser(res.data.user);
        setOrg(res.data.organization);
      })
      .catch(redirectToLogin)
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (active) setAuthChecked(true);
      });

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Polled rather than pushed. The feed is derived from the drafts themselves,
  // so a poll is always current and a send made in another tab clears the bell
  // here without anything having to tell it. Sixty seconds is well inside the
  // time it takes a customer to notice a pile of emails is waiting.
  useEffect(() => {
    if (!authChecked || !user) return undefined;

    let active = true;
    const load = () => {
      if (document.visibilityState !== 'visible') return;
      api.get('/notifications')
        .then(res => { if (active) setNotifications(res.data ?? { items: [], unreadCount: 0 }); })
        // A bell that cannot load is not worth an error state: it is ambient
        // information, and the campaign screen carries the same counts.
        .catch(() => {});
    };

    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [authChecked, user, pathname]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  // The product tour anchors several steps to sidebar items. On a narrow
  // viewport those only exist inside the mobile drawer, so the tour asks for it
  // to be opened rather than falling back to a targetless card.
  useEffect(() => {
    const handleTourNav = (event) => setMobileNavOpen(Boolean(event.detail?.open));
    window.addEventListener('gnx:tour:nav', handleTourNav);
    return () => window.removeEventListener('gnx:tour:nav', handleTourNav);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const paymentRequired = Boolean(
    authChecked
      && user
      && org
      && !hasWorkspaceAccess(user, org),
  );
  const billingRouteAllowed = BILLING_ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (paymentRequired && !billingRouteAllowed) {
      router.replace('/subscribe');
    }
  }, [paymentRequired, billingRouteAllowed, router]);

  const userName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : '';
  const orgName = org?.name || '';
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    window.location.href = '/login';
  };

  const goTo = (path) => {
    setMobileNavOpen(false);
    router.push(path);
  };

  if (!authChecked) {
    return (
      <div className="screen app-shell-screen" style={{ display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <p className="muted">Checking session...</p>
      </div>
    );
  }

  if (paymentRequired && !billingRouteAllowed) {
    return (
      <div className="screen app-shell-screen" style={{ display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div className="card" style={{ maxWidth: 460, padding: 32, textAlign: 'center' }}>
          <h1 className="display" style={{ fontSize: 24 }}>Complete billing to continue</h1>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            Your account is ready. Choose a monthly or yearly plan to unlock onboarding and the sales workspace.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => router.replace('/subscribe')}>
            Choose a plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen app-shell-screen" style={{ background: 'var(--bg)' }}>
      <aside className="app-shell-sidebar" style={{ background: '#fff', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
        <div className="app-shell-brand" style={{ padding: '4px 6px 16px' }}><Logo size={28} /></div>
        <button className="btn btn-primary btn-sm app-shell-new" style={{ marginBottom: 14, fontSize: 13.5 }} onClick={() => goTo('/campaigns/new')}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>
        <button
          className="app-shell-menu-btn"
          type="button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(open => !open)}
        >
          <Icon name={mobileNavOpen ? "close" : "menu"} size={22} />
        </button>

        <nav className="col scroll grow app-shell-nav" style={{ gap: 0 }}>
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {g.label && <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', padding: '10px 10px 4px' }}>{g.label}</div>}
              {g.items.map(n => {
                const active = activeTab === n.id;
                return (
                  <button key={n.id} data-tour={`nav-${n.id}`} onClick={() => goTo('/' + n.id)} style={{
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

        <div className={`app-shell-mobile-drawer ${mobileNavOpen ? 'is-open' : ''}`}>
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} className="app-shell-mobile-group">
              {g.label && <div className="app-shell-mobile-label">{g.label}</div>}
              {g.items.map(n => {
                const active = activeTab === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    data-tour={`nav-${n.id}`}
                    className={`app-shell-mobile-item ${active ? 'is-active' : ''}`}
                    onClick={() => goTo('/' + n.id)}
                  >
                    <Icon name={n.ico} size={18} color={active ? 'var(--g-600)' : 'var(--muted)'} />
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="app-shell-mobile-actions">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => goTo('/campaigns/new')}>
              <Icon name="plus" size={15} color="#06231a" /> New campaign
            </button>
            <button className="row nw app-shell-mobile-logout" type="button" onClick={handleLogout}>
              <Icon name="logout" size={17} /> Log out
            </button>
          </div>
        </div>

        <button className="row nw app-shell-logout" onClick={handleLogout} style={{ gap: 9, marginTop: 10, padding: '0 6px', height: 36, color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, flex: 'none' }}>
          <Icon name="logout" size={17} /> Log out
        </button>
      </aside>

      <div className="grow col" style={{ minWidth: 0 }}>
        <header className="row spread app-shell-header" style={{ height: 62, flex: 'none', padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)' }}>
          <div className="input-wrap app-shell-search">
            <span className="lead-ico"><Icon name="search" size={17} /></span>
            <input className="input has-ico" style={{ height: 40, background: 'var(--bg)', fontSize: 14 }} placeholder="Search leads, accounts, replies…" />
          </div>
          <div className="row" style={{ gap: 14 }}>
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                type="button"
                style={{ position: 'relative', color: notifications.unreadCount > 0 ? 'var(--ink-2)' : 'var(--muted)', display: 'block' }}
                onClick={() => setNotificationsOpen(open => !open)}
                aria-haspopup="menu"
                aria-expanded={notificationsOpen}
                aria-label={notifications.unreadCount > 0
                  ? `Notifications: ${notifications.unreadCount} email${notifications.unreadCount === 1 ? '' : 's'} need your OK`
                  : 'Notifications'}
              >
                <Icon name="bell" size={20} />
                {notifications.unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: -5, right: -6, minWidth: 17, height: 17, padding: '0 4px',
                      borderRadius: 9, background: '#b45309', color: '#fff', fontSize: 10.5, fontWeight: 800,
                      lineHeight: '17px', textAlign: 'center', border: '2px solid #fff', boxSizing: 'content-box',
                    }}
                  >
                    {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="card"
                  role="menu"
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 10, width: 340, maxWidth: '90vw', maxHeight: 420, overflowY: 'auto', padding: 6, zIndex: 40 }}
                >
                  <div style={{ padding: '8px 10px 6px' }}>
                    <strong style={{ fontSize: 13 }}>Notifications</strong>
                  </div>

                  {notifications.items.length === 0 ? (
                    <p className="faint" style={{ fontSize: 12.5, padding: '2px 10px 12px', margin: 0, lineHeight: 1.5 }}>
                      Nothing needs you right now. Emails your agent can send on its own never appear here.
                    </p>
                  ) : (
                    notifications.items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => { setNotificationsOpen(false); goTo(item.href); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '10px',
                          borderRadius: 8, background: 'transparent',
                        }}
                      >
                        <span className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ flex: 'none', marginTop: 2, color: '#b45309' }}>
                            <Icon name="bolt" size={14} />
                          </span>
                          <span className="col" style={{ gap: 3, minWidth: 0 }}>
                            <strong style={{ fontSize: 13 }}>{item.title}</strong>
                            <span className="faint" style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'normal' }}>
                              {item.body}
                            </span>
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {userName && !isAdmin && (
              <div className="row" style={{ gap: 9 }}>
                <Avatar name={userName} size={34} />
                <div className="col" style={{ lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{userName}</span>
                  <span className="faint nw" style={{ fontSize: 11.5 }}>{orgName}</span>
                </div>
              </div>
            )}
            {userName && isAdmin && (
              <div className="profile-menu" ref={profileMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="row profile-menu-trigger"
                  style={{ gap: 9, background: 'transparent' }}
                  onClick={() => setProfileMenuOpen(open => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <Avatar name={userName} size={34} />
                  <div className="col" style={{ lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{userName}</span>
                    <span className="faint nw" style={{ fontSize: 11.5 }}>{orgName}</span>
                  </div>
                  <Icon name="arrow" size={11} color="var(--faint)" style={{ transform: 'rotate(90deg)' }} />
                </button>
                {profileMenuOpen && (
                  <div className="card profile-menu-dropdown" role="menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, minWidth: 180, padding: 6, zIndex: 40 }}>
                    <button
                      type="button"
                      role="menuitem"
                      className="profile-menu-item"
                      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 8, fontWeight: 700, fontSize: 13.5, textAlign: 'left', color: 'var(--ink-2)' }}
                      onClick={() => { setProfileMenuOpen(false); goTo('/admin'); }}
                    >
                      <Icon name="sliders" size={16} color="var(--muted)" /> Admin panel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <div className="grow" style={{ minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
      </div>
    </div>
  );
}
