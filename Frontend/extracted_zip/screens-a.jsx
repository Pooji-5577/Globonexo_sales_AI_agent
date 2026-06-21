/* Prospects + Pipeline + Campaigns + Inbox → window */
const { useState: useStateSA } = React;

/* =================== PROSPECTS =================== */
const PROSPECT_DATA = [
  { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', email: 'devon@brightloop.io', stage: 'Engaged', score: 88, sig: 'Opened 4×', last: '1h ago', hot: true },
  { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', email: 'mara@northwind.io', stage: 'Meeting set', score: 94, sig: 'Replied', last: '14m ago', hot: true },
  { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', email: 'lena@cobalt.com', stage: 'Engaged', score: 81, sig: 'Replied', last: '3h ago', hot: false },
  { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', email: 'tobias@vertexlabs.io', stage: 'New', score: 72, sig: 'Hiring SDRs', last: '5h ago', hot: false },
  { n: 'Amir Haddad', c: 'Acme', r: 'Director', email: 'amir@acme.com', stage: 'Meeting set', score: 79, sig: 'Call Wed', last: '2h ago', hot: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', email: 'sara@polar.com', stage: 'New', score: 64, sig: 'Visited pricing', last: '6h ago', hot: false },
  { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', email: 'marcus@hatch.io', stage: 'New', score: 58, sig: 'New funding', last: '1d ago', hot: false },
  { n: 'Priya Raman', c: 'Loom Health', r: 'COO', email: 'priya@loomhealth.com', stage: 'Won', score: 100, sig: 'Closed', last: '3d ago', hot: false },
];
const STAGE_COLORS = { New: '#9aa8a0', Engaged: '#15c4c0', 'Meeting set': '#00c27a', Won: '#088256', Nurture: '#f0a93c' };

function Prospects() {
  const [search, setSearch] = useStateSA('');
  const [filter, setFilter] = useStateSA('All');
  const filtered = PROSPECT_DATA.filter(p =>
    (filter === 'All' || p.stage === filter) &&
    (p.n.toLowerCase().includes(search.toLowerCase()) || p.c.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      {/* Toolbar */}
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff', gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Prospects</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{PROSPECT_DATA.length} leads · agent-sourced 64%</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="lead-ico"><Icon name="search" size={16} /></span>
            <input className="input has-ico" style={{ height: 38, fontSize: 13.5, background: 'var(--bg)' }} placeholder="Search prospects…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Segmented options={['All','New','Engaged','Meeting set','Won'].map(v=>({label:v,value:v}))} value={filter} onChange={setFilter} />
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add</button>
        </div>
      </div>
      {/* Table */}
      <div className="scroll grow" style={{ minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
              {['Prospect','Stage','Signal','Score','Last action',''].map(h => (
                <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line-2)', transition: 'background .1s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--g-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 11 }}>
                    <Avatar name={p.n} size={34} />
                    <div className="col">
                      <div className="row" style={{ gap: 7 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }} className="nw">{p.n}</span>
                        {p.hot && <Icon name="flame" size={14} color="#ef6f4e" />}
                      </div>
                      <span className="faint" style={{ fontSize: 12 }}>{p.r} · {p.c}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="badge" style={{ background: STAGE_COLORS[p.stage] + '22', color: STAGE_COLORS[p.stage], border: '1px solid ' + STAGE_COLORS[p.stage] + '44' }}>{p.stage}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)', height: 26, fontSize: 12 }}>
                    <Icon name="bolt" size={12} color="var(--g-600)" />{p.sig}
                  </span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 6, background: 'var(--bg-2)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: p.score + '%', borderRadius: 99, background: p.score > 85 ? 'var(--g-500)' : 'var(--g-300)' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>{p.score}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span className="faint" style={{ fontSize: 13, fontWeight: 600 }}>{p.last}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="mail" size={14} /> Email</button>
                    <button className="btn btn-ghost btn-sm" style={{ height: 30, padding: '0 10px', fontSize: 12 }}><Icon name="calendar" size={14} /> Book</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =================== PIPELINE =================== */
const STAGES = [
  { id: 'new', label: 'New leads', tint: '#9aa8a0' },
  { id: 'engaged', label: 'Engaged', tint: '#15c4c0' },
  { id: 'meeting', label: 'Meeting set', tint: '#00c27a' },
  { id: 'won', label: 'Won', tint: '#088256' },
];
const LEADS = {
  new: [
    { n: 'Tobias Lang', c: 'Vertex Labs', r: 'CTO', v: '$24k', score: 72, sig: 'Hiring SDRs' },
    { n: 'Sara Nilsen', c: 'Polar Freight', r: 'VP Ops', v: '$18k', score: 64, sig: 'Visited pricing' },
    { n: 'Marcus Webb', c: 'Hatch.io', r: 'Founder', v: '$9k', score: 58, sig: 'New funding' },
  ],
  engaged: [
    { n: 'Devon Cole', c: 'Brightloop', r: 'Head of Sales', v: '$42k', score: 88, sig: 'Opened 4×', hot: true },
    { n: 'Lena Park', c: 'Cobalt', r: 'RevOps', v: '$31k', score: 81, sig: 'Replied' },
  ],
  meeting: [
    { n: 'Mara Ito', c: 'Northwind', r: 'VP Sales', v: '$56k', score: 94, sig: 'Demo Fri', hot: true },
    { n: 'Amir Haddad', c: 'Acme', r: 'Director', v: '$38k', score: 79, sig: 'Call Wed' },
  ],
  won: [
    { n: 'Priya Raman', c: 'Loom Health', r: 'COO', v: '$72k', score: 100, sig: 'Closed' },
  ],
};

function Pipeline() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Pipeline</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>248 active leads · <b style={{ color: 'var(--g-700)' }}>$1.24M</b> open</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="sliders" size={15} /> Filters</button>
          <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Add lead</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignItems: 'start' }}>
        {STAGES.map(st => (
          <div key={st.id} className="col" style={{ gap: 10 }}>
            <div className="row spread" style={{ padding: '0 4px 6px' }}>
              <div className="row" style={{ gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: st.tint, flex: 'none' }} />
                <span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{st.label}</span>
              </div>
              <span className="faint" style={{ fontWeight: 800, fontSize: 13 }}>{LEADS[st.id].length}</span>
            </div>
            {LEADS[st.id].map(l => <LeadCard key={l.n} l={l} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
function LeadCard({ l }) {
  return (
    <div className="card" style={{ padding: 13, cursor: 'grab', transition: 'transform .12s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
      <div className="row spread">
        <div className="row" style={{ gap: 9 }}>
          <Avatar name={l.n} size={34} />
          <div className="col" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }} className="nw">{l.n}</span>
            <span className="faint ellip" style={{ fontSize: 11.5 }}>{l.r} · {l.c}</span>
          </div>
        </div>
        {l.hot && <Icon name="flame" size={16} color="#ef6f4e" />}
      </div>
      <div className="row spread" style={{ marginTop: 10 }}>
        <span className="chip" style={{ height: 24, fontSize: 11, background: 'var(--bg-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <Icon name="bolt" size={11} color="var(--g-600)" /> {l.sig}
        </span>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--g-700)' }}>{l.v}</span>
      </div>
      <div className="row" style={{ gap: 7, marginTop: 10, alignItems: 'center' }}>
        <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: 99, flex: 1 }}>
          <div style={{ height: '100%', width: l.score + '%', borderRadius: 99, background: l.score > 85 ? 'linear-gradient(90deg,var(--g-400),var(--teal))' : 'var(--g-300)' }} />
        </div>
        <span className="faint" style={{ fontSize: 11, fontWeight: 800 }}>{l.score}</span>
      </div>
    </div>
  );
}

/* =================== CAMPAIGNS =================== */
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

function Campaigns() {
  return (
    <div className="col" style={{ height: '100%', minHeight: 0 }}>
      <div className="row spread" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', flex: 'none', background: '#fff' }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Campaigns</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>4 sequences · 2 active · 30 meetings booked this month</p>
        </div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={15} color="#06231a" /> New campaign</button>
      </div>
      {/* Stats strip */}
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

/* =================== INBOX =================== */
const THREADS = [
  { n: 'Mara Ito', c: 'Northwind', sub: 'Re: Cutting ramp time for your 12 new AEs', prev: "This is helpful — can we do Friday at 9?", t: '14m', unread: true, hot: true, tag: 'Positive' },
  { n: 'Devon Cole', c: 'Brightloop', sub: "Re: Quick idea for Brightloop's Q3", prev: "Opened your deck. What's pricing for 40 seats?", t: '1h', unread: true, tag: 'Pricing' },
  { n: 'Lena Park', c: 'Cobalt', sub: 'Re: RevOps benchmark report', prev: "Thanks, forwarding to my VP.", t: '3h', tag: 'Forwarded' },
  { n: 'Amir Haddad', c: 'Acme', sub: 'Re: Following up', prev: "Not right now, circle back in Q4.", t: '5h', tag: 'Nurture' },
  { n: 'Sara Nilsen', c: 'Polar Freight', sub: "Re: Saw you're hiring", prev: "Who handles this on your end?", t: '1d', tag: 'Question' },
];

function Inbox() {
  const [sel, setSel] = useStateSA(0);
  const th = THREADS[sel];
  return (
    <div className="row" style={{ height: '100%', minHeight: 0 }}>
      <div className="scroll" style={{ width: 340, flex: 'none', borderRight: '1px solid var(--line)', background: '#fff' }}>
        <div className="row spread" style={{ padding: '16px 18px 12px' }}>
          <h1 className="display" style={{ fontSize: 20 }}>Inbox</h1>
          <Segmented options={[{ label: 'All', value: 'a' }, { label: 'Hot', value: 'h' }]} value="a" onChange={() => {}} />
        </div>
        {THREADS.map((t, i) => (
          <button key={i} onClick={() => setSel(i)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '13px 18px',
            borderBottom: '1px solid var(--line-2)', borderLeft: '3px solid ' + (sel === i ? 'var(--g-500)' : 'transparent'),
            background: sel === i ? 'var(--g-50)' : '#fff', transition: 'all .12s',
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
        ))}
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
              <div className="row" style={{ gap: 8 }}><Icon name="spark" size={16} color="var(--g-600)" /><span style={{ fontWeight: 800, fontSize: 13.5 }} className="nw">{window.__agentName || 'Nexo'} drafted a reply</span></div>
              <span className="chip" style={{ height: 22, fontSize: 11 }}>Recommended</span>
            </div>
            <div style={{ padding: '14px 16px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
              Hi {th.n.split(' ')[0]} — Friday at 9:00 works perfectly. I'll send a calendar invite with a short agenda so we keep it to 25 minutes. Talk soon!
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

Object.assign(window, { Prospects, Pipeline, Campaigns, Inbox });
