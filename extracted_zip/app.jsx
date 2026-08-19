/* App shell + Dashboard + Agent workspace → window */
const { useState: useStateS, useRef: useRefS, useEffect: useEffectS } = React;

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

function AppShell({ tab, setTab, go, children }) {
  return (
    <div className="screen" style={{ flexDirection: 'row', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 248, flex: 'none', background: '#fff', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
        <div style={{ padding: '4px 6px 16px' }}><Logo size={28} /></div>
        <button className="btn btn-primary btn-sm" style={{ marginBottom: 14, fontSize: 13.5 }} onClick={() => setTab('campaigns')}>
          <Icon name="plus" size={15} color="#06231a" /> New campaign
        </button>

        <nav className="col scroll grow" style={{ gap: 0 }}>
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {g.label && <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', padding: '10px 10px 4px' }}>{g.label}</div>}
              {g.items.map(n => {
                const active = tab === n.id;
                return (
                  <button key={n.id} onClick={() => setTab(n.id)} style={{
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

        {/* Agent status */}
        <div className="card" style={{ marginTop: 8, padding: 12, background: 'linear-gradient(160deg,#06311f,#075a3e)', border: 'none', color: '#fff', flex: 'none' }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#6fe7b0', animation: 'pulse-dot 1.4s infinite', boxShadow: '0 0 7px #6fe7b0', flex: 'none' }} />
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">Agent is working</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 5, lineHeight: 1.4 }}>Prospecting Tier-1 · next action 2m</p>
        </div>
        <button className="row nw" onClick={() => go('splash')} style={{ gap: 9, marginTop: 10, padding: '0 6px', height: 36, color: 'var(--muted)', fontWeight: 700, fontSize: 13.5, flex: 'none' }}>
          <Icon name="logout" size={17} /> Log out
        </button>
      </aside>

      {/* Main */}
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

/* ===================== DASHBOARD ===================== */
const ACTIVITY = [
  { ico: 'send', text: 'Sent intro to Devon Cole · Brightloop', t: '2m', hot: false },
  { ico: 'chat', text: 'Positive reply from Mara Ito · Northwind', t: '14m', hot: true },
  { ico: 'target', text: '23 new accounts matched your ICP', t: '31m', hot: false },
  { ico: 'calendar', text: 'Meeting booked: Acme demo, Fri 9am', t: '1h', hot: true },
  { ico: 'send', text: 'Follow-up sent to Sara Nilsen · Polar Freight', t: '2h', hot: false },
  { ico: 'flame', text: 'Brightloop opened email 4× in 20 min', t: '3h', hot: true },
];

const TASKS = [
  { ico: 'chat', text: 'Approve reply to Mara Ito (Northwind)', cta: 'Review', hot: true },
  { ico: 'mail', text: 'Review 3 draft intros before sending', cta: 'Review', hot: false },
  { ico: 'calendar', text: 'Confirm Acme demo slot: Fri 9am', cta: 'Confirm', hot: false },
];

function Dashboard({ setTab }) {
  return (
    <div className="scroll grow" style={{ padding: '22px 24px', minHeight: 0 }}>
      {/* Welcome */}
      <div className="row spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 26 }}>Good morning, Mara 👋</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>Your agent worked overnight. Here's where things stand.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setTab('agent')}>
          <Icon name="spark" size={16} color="#06231a" /> Talk to Nexo
        </button>
      </div>

      {/* KPI strip */}
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
        {/* Activity feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="row spread" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Agent activity feed</span>
            <button onClick={() => setTab('agent')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--g-700)' }}>See all</button>
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

        {/* Right col: tasks + goal */}
        <div className="col" style={{ gap: 14 }}>
          {/* Needs attention */}
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

          {/* Weekly goal */}
          <div className="card" style={{ padding: 16, background: 'linear-gradient(160deg,#f4fdf8,#e8f8f0)' }}>
            <div className="row spread">
              <span style={{ fontWeight: 800, fontSize: 14 }}>Weekly meeting goal</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--g-700)' }}>18 / 25</span>
            </div>
            <div style={{ height: 8, background: '#fff', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '72%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width 1s ease' }} />
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>7 more meetings to hit your target. Nexo is on pace.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setTab('analytics')}>
              View analytics
            </button>
          </div>

          {/* Next meeting */}
          <div className="card" style={{ padding: 14 }}>
            <div className="eyebrow">Next meeting</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Northwind: Discovery call</div>
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

/* ===================== AI AGENT ===================== */
const SEED_MSGS = [
  { who: 'agent', kind: 'text', text: "Morning, Mara 👋 Overnight I worked your Tier-1 list. Here's where things stand:" },
  { who: 'agent', kind: 'stats' },
  { who: 'agent', kind: 'text', text: "Northwind replied to our funding-angle email and asked about onboarding time. Want me to propose 3 meeting times and send a tailored reply?" },
  { who: 'agent', kind: 'draft' },
  { who: 'user', kind: 'text', text: "Looks great. Send it, and prioritize the accounts hiring SDRs." },
  { who: 'agent', kind: 'text', text: "Done ✅ Reply sent to Mara at Northwind. I've re-ranked your queue. Twelve accounts actively hiring SDRs are now at the top. I'll book straight to your calendar when they reply." },
];

const QUICK = ['Draft follow-ups for no-replies', 'Find 50 new ICP accounts', 'Summarize hottest leads', 'Pause weekend sending'];

function AgentWorkspace() {
  const [msgs, setMsgs] = useStateS(SEED_MSGS);
  const [input, setInput] = useStateS('');
  const [typing, setTyping] = useStateS(false);
  const scrollRef = useRefS(null);
  const name = window.__agentName || 'Nexo';

  useEffectS(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const send = (text) => {
    const t = (text || input).trim(); if (!t) return;
    setMsgs(m => [...m, { who: 'user', kind: 'text', text: t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { who: 'agent', kind: 'text', text: "On it. I'll handle that and report back. Anything worth your attention will land in your Inbox with a summary." }]);
    }, 1400);
  };

  return (
    <div className="row" style={{ height: '100%', minHeight: 0 }}>
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
            {msgs.map((m, i) => <Bubble key={i} m={m} name={name} />)}
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

      {/* Right rail */}
      <aside className="scroll" style={{ width: 300, flex: 'none', borderLeft: '1px solid var(--line)', background: '#fff', padding: 18 }}>
        <span className="eyebrow">Today's impact</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[{ k: 'Emails sent', v: 84, ico: 'send' }, { k: 'Replies', v: 19, ico: 'chat' }, { k: 'Meetings', v: 3, ico: 'calendar' }, { k: 'Hot leads', v: 7, ico: 'flame' }].map(s => (
            <div key={s.k} className="card" style={{ padding: 12 }}>
              <Icon name={s.ico} size={16} color="var(--g-600)" />
              <div className="display" style={{ fontSize: 24, marginTop: 6 }}>{s.v}</div>
              <div className="faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.k}</div>
            </div>
          ))}
        </div>
        <span className="eyebrow" style={{ display: 'block', marginTop: 20 }}>Live activity</span>
        <div className="col" style={{ gap: 2, marginTop: 10 }}>
          {[{ i: 'send', t: 'Sent to Devon Cole', s: 'Brightloop · 2m ago' }, { i: 'chat', t: 'Reply from Northwind', s: 'positive · 14m ago', hot: true }, { i: 'target', t: 'Found 23 new accounts', s: 'matching ICP · 31m ago' }, { i: 'calendar', t: 'Meeting booked', s: 'Acme demo, Fri · 1h ago' }].map((a, i) => (
            <div key={i} className="row" style={{ gap: 10, padding: '9px 6px', borderRadius: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, flex: 'none', display: 'grid', placeItems: 'center', background: a.hot ? 'var(--g-50)' : 'var(--bg-2)', color: a.hot ? 'var(--g-600)' : 'var(--muted)' }}>
                <Icon name={a.i} size={15} />
              </span>
              <div className="col" style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }} className="nw">{a.t}</span>
                <span className="faint" style={{ fontSize: 11.5 }}>{a.s}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 16, padding: 14, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
          <div className="row spread">
            <span style={{ fontWeight: 800, fontSize: 13 }}>Weekly goal</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--g-700)' }}>18 / 25</span>
          </div>
          <div style={{ height: 7, background: '#fff', borderRadius: 99, marginTop: 10 }}>
            <div style={{ height: '100%', width: '72%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>7 more to hit target. {name} is on pace.</p>
        </div>
      </aside>
    </div>
  );
}

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
          {[['84', 'emails sent'], ['19', 'replies'], ['3', 'meetings booked']].map(([v, k]) => (
            <div key={k} className="card" style={{ padding: '11px 14px', textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, color: 'var(--g-700)' }}>{v}</div>
              <div className="faint" style={{ fontSize: 11, fontWeight: 700 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m.kind === 'draft') {
    return (
      <div className="row" style={{ gap: 9 }}>
        <AgentAvatar />
        <div className="card" style={{ maxWidth: 460, padding: 0, overflow: 'hidden', borderTopLeftRadius: 4 }}>
          <div className="row spread" style={{ padding: '10px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
            <div className="row" style={{ gap: 8 }}><Icon name="mail" size={15} color="var(--g-600)" /><span style={{ fontWeight: 800, fontSize: 13 }} className="nw">Draft reply · Northwind</span></div>
            <span className="chip" style={{ height: 22, fontSize: 11 }}>AI written</span>
          </div>
          <div style={{ padding: '12px 14px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            Hi Mara, great question. Most teams your size are fully ramped in <b style={{ color: 'var(--g-700)' }}>under 2 weeks</b>. I'd love to walk you through it. Are you free Tue 10:00, Wed 14:30, or Fri 09:00?
          </div>
          <div className="row" style={{ gap: 9, padding: '10px 14px', borderTop: '1px solid var(--line)' }}>
            <button className="btn btn-primary btn-sm"><Icon name="send" size={14} color="#06231a" /> Approve & send</button>
            <button className="btn btn-ghost btn-sm">Edit</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

Object.assign(window, { AppShell, Dashboard, AgentWorkspace });
