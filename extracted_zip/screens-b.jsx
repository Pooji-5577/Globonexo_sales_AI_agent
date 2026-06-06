/* Meetings + Analytics + Billing + Settings → window */
const { useState: useStateSB } = React;

/* =================== MEETINGS =================== */
const MTG_DATA = [
  { n: 'Mara Ito', c: 'Northwind', type: 'Discovery call', date: 'Today', time: '2:30 PM', dur: '30 min', status: 'Upcoming', link: true },
  { n: 'Devon Cole', c: 'Brightloop', type: 'Product demo', date: 'Tomorrow', time: '10:00 AM', dur: '45 min', status: 'Upcoming', link: true },
  { n: 'Amir Haddad', c: 'Acme', type: 'Follow-up call', date: 'Wed, Jun 11', time: '3:00 PM', dur: '30 min', status: 'Upcoming', link: false },
  { n: 'Lena Park', c: 'Cobalt', type: 'Technical review', date: 'Thu, Jun 12', time: '11:00 AM', dur: '60 min', status: 'Upcoming', link: false },
  { n: 'Priya Raman', c: 'Loom Health', type: 'Closing call', date: 'Mon, Jun 2', time: '2:00 PM', dur: '30 min', status: 'Completed', link: false },
  { n: 'Sara Nilsen', c: 'Polar Freight', type: 'Intro call', date: 'Fri, May 30', time: '9:00 AM', dur: '20 min', status: 'Cancelled', link: false },
];
const MTG_STATUS = {
  Upcoming: { bg: 'var(--g-50)', color: 'var(--g-700)' },
  Completed: { bg: '#f0f9ff', color: '#0369a1' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

function Meetings() {
  const upcoming = MTG_DATA.filter(m => m.status === 'Upcoming');
  const past = MTG_DATA.filter(m => m.status !== 'Upcoming');
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div className="row spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 22 }}>Meetings</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>18 booked this week · 3 today</p>
        </div>
        <button className="btn btn-dark btn-sm"><Icon name="plus" size={15} color="#fff" /> Schedule meeting</button>
      </div>
      {/* Today highlight */}
      <div className="card" style={{ padding: 18, marginBottom: 20, background: 'linear-gradient(135deg,#f4fdf8,#eafaf2)', border: '1px solid var(--g-100)' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Today · {upcoming.filter(m=>m.date==='Today').length} meetings</div>
        <div className="col" style={{ gap: 10 }}>
          {upcoming.filter(m => m.date === 'Today').map((m, i) => (
            <div key={i} className="row spread" style={{ padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--g-100)' }}>
              <div className="row" style={{ gap: 12 }}>
                <Avatar name={m.n} size={38} />
                <div className="col">
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>{m.type}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {m.link && <button className="btn btn-primary btn-sm"><Icon name="play" size={14} /> Join call</button>}
                <button className="btn btn-ghost btn-sm">Prep brief</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming */}
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Upcoming</div>
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        {upcoming.filter(m => m.date !== 'Today').map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', gap: 12 }}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 52, textAlign: 'center', flex: 'none' }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--g-700)', textTransform: 'uppercase' }}>{m.date.split(', ')[0]}</div>
                <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{m.date.split(' ').pop()}</div>
              </div>
              <Avatar name={m.n} size={36} />
              <div className="col">
                <span style={{ fontWeight: 800, fontSize: 14 }}>{m.type}</span>
                <span className="muted" style={{ fontSize: 12.5 }}>{m.n} · {m.c} · {m.time} · {m.dur}</span>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
      {/* Past */}
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--ink-2)' }}>Past meetings</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {past.map((m, i, arr) => (
          <div key={i} className="row spread" style={{ padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none', opacity: m.status === 'Cancelled' ? 0.55 : 1 }}>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={m.n} size={34} />
              <div className="col">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{m.type} · {m.n}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>{m.date} · {m.time} · {m.c}</span>
              </div>
            </div>
            <span className="badge" style={{ background: MTG_STATUS[m.status].bg, color: MTG_STATUS[m.status].color }}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== ANALYTICS =================== */
const WEEKLY = [12, 15, 11, 18, 14, 20, 18];
const DAILY_EMAILS = [62, 78, 84, 91, 70, 88, 84];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const PIPELINE_TREND = [180, 340, 520, 680, 900, 1240];

function Analytics() {
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 22 }}>Analytics</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Performance over the last 30 days</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[{ k: 'Meetings booked', v: '18', d: '+38% vs last month' }, { k: 'Reply rate', v: '22.6%', d: '+4.2 pts' }, { k: 'Emails sent', v: '584', d: 'This month' }, { k: 'Pipeline added', v: '$1.24M', d: '+$380k vs last month' }].map(s => (
          <div key={s.k} className="card" style={{ padding: 16 }}>
            <div className="faint" style={{ fontSize: 12, fontWeight: 700 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{s.v}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g-700)', marginTop: 4, display: 'block' }}>{s.d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <BarChart title="Meetings booked (last 7 days)" data={WEEKLY} labels={['M','T','W','T','F','S','S']} color="var(--g-500)" max={25} />
        <BarChart title="Emails sent (last 7 days)" data={DAILY_EMAILS} labels={['M','T','W','T','F','S','S']} color="var(--teal)" max={120} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <LineChart title="Pipeline value growth ($k)" data={PIPELINE_TREND} labels={MONTHS} />
        <FunnelChart />
      </div>
    </div>
  );
}

function BarChart({ title, data, labels, color, max }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{title}</div>
      <div className="row" style={{ gap: 8, alignItems: 'flex-end', height: 100 }}>
        {data.map((v, i) => (
          <div key={i} className="col center grow" style={{ gap: 4 }}>
            <div style={{ width: '100%', height: (v / max) * 90, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height .5s ease' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--faint)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ title, data, labels }) {
  const w = 360, h = 100;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - 40) + 20},${h - (v / max) * (h - 20) - 10}`).join(' ');
  const area = `M${pts.split(' ').join('L')} L${(data.length - 1) / (data.length - 1) * (w - 40) + 20},${h} L20,${h} Z`;
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: 120 }}>
        <defs>
          <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--g-400)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--g-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg-area)" />
        <polyline points={pts} fill="none" stroke="var(--g-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * (w - 40) + 20;
          const y = h - (v / max) * (h - 20) - 10;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--g-500)" stroke="#fff" strokeWidth="1.5" />;
        })}
        {labels.map((l, i) => (
          <text key={i} x={(i / (labels.length - 1)) * (w - 40) + 20} y={h + 16} textAnchor="middle" fill="var(--faint)" fontSize="11" fontWeight="700">{l}</text>
        ))}
      </svg>
    </div>
  );
}

function FunnelChart() {
  const stages = [
    { label: 'Prospects found', v: 1284, pct: 100, color: '#d1fae5' },
    { label: 'Emailed', v: 584, pct: 45, color: 'var(--g-300)' },
    { label: 'Replied', v: 132, pct: 10, color: 'var(--g-400)' },
    { label: 'Meeting booked', v: 47, pct: 4, color: 'var(--g-500)' },
    { label: 'Closed', v: 8, pct: 0.6, color: 'var(--g-700)' },
  ];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Conversion funnel</div>
      <div className="col" style={{ gap: 8 }}>
        {stages.map((s, i) => (
          <div key={i} className="row" style={{ gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', width: 130, flex: 'none', textAlign: 'right' }}>{s.label}</span>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.max(s.pct, 1) + '%', background: s.color, borderRadius: 6, transition: 'width .6s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', width: 40 }}>{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================== BILLING =================== */
function Billing() {
  const [annual, setAnnual] = useStateSB(true);
  const plans = [
    { name: 'Starter', price: annual ? 49 : 59, desc: 'For solo reps getting started', feats: ['1 seat', '50 emails/day', 'Basic ICP targeting', 'Email only', '3 active campaigns'] },
    { name: 'Growth', price: annual ? 149 : 179, desc: 'For small sales teams', feats: ['5 seats', '200 emails/day', 'Advanced ICP + signals', 'Email + LinkedIn', 'Unlimited campaigns', 'CRM sync'], current: true },
    { name: 'Scale', price: annual ? 399 : 479, desc: 'For high-velocity teams', feats: ['20 seats', 'Unlimited emails', 'Priority intent data', 'All channels incl. SMS', 'Custom AI training', 'Dedicated CSM'] },
  ];
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="row spread" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="display" style={{ fontSize: 22 }}>Billing & plan</h1>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>You're on the <b style={{ color: 'var(--g-700)' }}>Growth plan</b> · renews Jul 5, 2026</p>
          </div>
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 28, borderRadius: 99, padding: 3, background: annual ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s' }}>
              <span style={{ display: 'block', width: 22, height: 22, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-xs)', transform: annual ? 'translateX(20px)' : 'none', transition: 'transform .2s' }} />
            </button>
            <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>Annual <span className="badge" style={{ background: 'var(--g-50)', color: 'var(--g-700)' }}>Save 20%</span></span>
          </div>
        </div>
        {/* Usage */}
        <div className="card" style={{ padding: 18, marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>Current usage</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[{ k: 'Emails sent this month', v: 584, max: 6000, unit: '' }, { k: 'Seats used', v: 3, max: 5, unit: '' }, { k: 'Active campaigns', v: 2, max: 'Unlimited', unit: '' }].map(u => (
              <div key={u.k}>
                <div className="row spread" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>{u.k}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--g-700)' }}>{u.v}{u.max !== 'Unlimited' ? ` / ${u.max}` : ' / ∞'}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: (u.max !== 'Unlimited' ? (u.v / u.max) * 100 : 10) + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{ padding: 22, border: p.current ? '2px solid var(--g-400)' : '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
              {p.current && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--g-500)', color: '#06231a', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 10 }}>Current plan</div>}
              <div className="display" style={{ fontSize: 22 }}>{p.name}</div>
              <div style={{ marginTop: 8 }}>
                <span className="display" style={{ fontSize: 36 }}>${p.price}</span>
                <span className="muted" style={{ fontSize: 13, marginLeft: 4 }}>/mo</span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 16 }}>{p.desc}</p>
              <div className="col" style={{ gap: 8, marginBottom: 18 }}>
                {p.feats.map(f => (
                  <div key={f} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <Icon name="check" size={14} color="var(--g-500)" stroke={2.5} style={{ marginTop: 2, flex: 'none' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className={'btn btn-block ' + (p.current ? 'btn-ghost' : 'btn-primary')} style={{ fontSize: 14 }}>
                {p.current ? 'Current plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =================== SETTINGS =================== */
function Settings() {
  const [tone, setTone] = useStateSB('Consultative');
  const [vol, setVol] = useStateSB(120);
  const [chans, setChans] = useStateSB(['Email', 'LinkedIn']);
  const toggleChan = c => setChans(chans.includes(c) ? chans.filter(x => x !== c) : [...chans, c]);
  const [autos, setAutos] = useStateSB({ firstTouch: true, approveReplies: true, autoBook: true, weekends: false });
  const toggle = k => setAutos(a => ({ ...a, [k]: !a[k] }));
  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="display" style={{ fontSize: 22 }}>Agent settings</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 20 }}>Tune how {window.__agentName || 'Nexo'} sells on your behalf. Changes apply immediately.</p>
        <SetCard title="Persona & tone" ico="user" sub="How your agent sounds in every message.">
          <div className="field">
            <label>Writing tone</label>
            <div className="row wrap" style={{ gap: 9 }}>
              {['Consultative', 'Friendly', 'Direct', 'Challenger', 'Formal'].map(t => (
                <button key={t} onClick={() => setTone(t)} className="nw" style={{ height: 40, padding: '0 16px', borderRadius: 99, fontWeight: 700, fontSize: 13.5, border: '1.5px solid ' + (tone === t ? 'var(--g-400)' : 'var(--line)'), background: tone === t ? 'var(--g-50)' : '#fff', color: tone === t ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .14s' }}>{t}</button>
              ))}
            </div>
          </div>
          <Field label="Email signature" placeholder="Mara Ito · VP Sales, Northwind" value="Mara Ito · VP Sales, Northwind" onChange={() => {}} />
        </SetCard>
        <SetCard title="Outreach volume" ico="send" sub="Daily caps keep deliverability healthy.">
          <div className="field">
            <div className="row spread"><label>Emails per day</label><span style={{ fontWeight: 800, color: 'var(--g-700)' }}>{vol}</span></div>
            <input type="range" min="20" max="300" value={vol} onChange={e => setVol(+e.target.value)} style={{ accentColor: 'var(--g-500)', width: '100%' }} />
            <span className="faint" style={{ fontSize: 12.5 }}>Recommended: 80–150 for a warmed-up inbox.</span>
          </div>
          <SToggle label="Pause on weekends" sub="No messages sent Sat–Sun." on={autos.weekends} onChange={() => toggle('weekends')} />
        </SetCard>
        <SetCard title="Channels" ico="link" sub="Where the agent can reach out.">
          <div className="col" style={{ gap: 10 }}>
            {[['Email', 'mail'], ['LinkedIn', 'users'], ['SMS', 'phone']].map(([c, i]) => (
              <SToggle key={c} ico={i} label={c} on={chans.includes(c)} onChange={() => toggleChan(c)} />
            ))}
          </div>
        </SetCard>
        <SetCard title="Autonomy" ico="spark" sub="How much the agent does without asking you.">
          <div className="col" style={{ gap: 10 }}>
            <SToggle label="Auto-send first touches" sub="Send approved-template intros without review." on={autos.firstTouch} onChange={() => toggle('firstTouch')} />
            <SToggle label="Require approval for replies" sub="You confirm replies to live conversations." on={autos.approveReplies} onChange={() => toggle('approveReplies')} />
            <SToggle label="Auto-book meetings" sub="Drop confirmed times straight on your calendar." on={autos.autoBook} onChange={() => toggle('autoBook')} />
          </div>
        </SetCard>
        <div className="row" style={{ gap: 10, margin: '24px 0 8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  );
}
function SetCard({ title, sub, ico, children }) {
  return (
    <div className="card" style={{ padding: 20, marginTop: 16 }}>
      <div className="row" style={{ gap: 11, marginBottom: 16 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={ico} size={19} color="var(--g-600)" /></span>
        <div className="col"><span style={{ fontWeight: 800, fontSize: 15 }}>{title}</span><span className="muted" style={{ fontSize: 13 }}>{sub}</span></div>
      </div>
      <div className="col" style={{ gap: 16 }}>{children}</div>
    </div>
  );
}
function SToggle({ label, sub, ico, on, onChange }) {
  return (
    <div className="row spread" style={{ padding: '4px 0' }}>
      <div className="row" style={{ gap: 10 }}>
        {ico && <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--muted)', flex: 'none' }}><Icon name={ico} size={17} /></span>}
        <div className="col"><span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>{sub && <span className="faint" style={{ fontSize: 12.5 }}>{sub}</span>}</div>
      </div>
      <button onClick={onChange} style={{ width: 46, height: 26, borderRadius: 99, padding: 3, flex: 'none', background: on ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s' }}>
        <span style={{ display: 'block', width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: 'var(--sh-xs)', transform: on ? 'translateX(20px)' : 'none', transition: 'transform .2s' }} />
      </button>
    </div>
  );
}

Object.assign(window, { Meetings, Analytics, Billing, Settings });
