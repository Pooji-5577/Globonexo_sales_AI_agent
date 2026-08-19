/* 7-step onboarding wizard + celebration → window */
const { useState: useStateO } = React;

const STEPS = [
  { title: 'About you', sub: 'Tell us who you are so Nexo can personalize outreach.', ico: 'user' },
  { title: 'What you sell', sub: 'Nexo needs to understand your product to sell it.', ico: 'bolt' },
  { title: 'Who you sell to', sub: 'Define your ideal customer profile.', ico: 'target' },
  { title: 'Your goals', sub: 'Set the targets Nexo optimizes for.', ico: 'trend' },
  { title: 'Your tone', sub: 'Make the agent sound like you.', ico: 'spark' },
  { title: 'Connect your tools', sub: 'Nexo works best with your stack.', ico: 'link' },
  { title: 'Review & launch', sub: 'Everything looks right? Let\'s go.', ico: 'checkCircle' },
];

const DEFAULTS = {
  firstName: '', lastName: '', role: 'Account Executive', company: '', industry: 'SaaS / Software',
  productDescription: '', valueProp: '', painPoints: '', bookingLink: '',
  titles: [], companySizes: [], targetIndustries: [], geos: [],
  meetingTarget: 15, dealSize: '$25k–$100k', salesCycle: '1–3 months',
  tone: 'Consultative', hook: 'Pain-based', followup: 'Standard 5-day',
  tools: [],
  agentName: 'Nexo',
};

function OnboardingWizard({ go }) {
  const [step, setStep] = useStateO(0);
  const [d, setD] = useStateO(DEFAULTS);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k, v) => setD(prev => ({
    ...prev,
    [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v],
  }));

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : go('celebrate');
  const back = () => step > 0 ? setStep(step - 1) : go('signup');

  const s = STEPS[step];
  const pct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="screen" style={{ flexDirection: 'row' }}>
      {/* Left progress rail */}
      <div style={{
        width: 300, flex: 'none', background: 'linear-gradient(170deg,#06311f,#085c40)',
        color: '#fff', display: 'flex', flexDirection: 'column', padding: '32px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <Aurora />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={30} light />
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: 20, letterSpacing: '.05em', textTransform: 'uppercase' }}>Setup steps</div>
            <div className="col" style={{ gap: 4 }}>
              {STEPS.map((st, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} className="row" style={{ gap: 12, padding: '10px 10px', borderRadius: 12, background: active ? 'rgba(255,255,255,.12)' : 'transparent', cursor: done ? 'pointer' : 'default' }}
                    onClick={() => done && setStep(i)}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', flex: 'none',
                      display: 'grid', placeItems: 'center',
                      background: done ? 'var(--g-500)' : active ? '#fff' : 'rgba(255,255,255,.12)',
                      color: done ? '#06231a' : active ? 'var(--ink)' : 'rgba(255,255,255,.5)',
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {done ? <Icon name="check" size={14} color="#06231a" stroke={3} /> : i + 1}
                    </span>
                    <span className="nw" style={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? '#fff' : done ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.45)' }}>
                      {st.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 28, position: 'relative' }}>
            <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: pct + '%', borderRadius: 99, background: 'linear-gradient(90deg,var(--g-400),var(--teal))', transition: 'width .4s ease' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="grow col" style={{ background: '#fff', minWidth: 0 }}>
        <div className="scroll grow" style={{ padding: '44px 56px 24px' }}>
          <div style={{ maxWidth: 560, animation: 'rise .35s both' }} key={step}>
            {/* Step header */}
            <div className="row" style={{ gap: 14, marginBottom: 28 }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Icon name={s.ico} size={26} color="var(--g-600)" />
              </span>
              <div className="col">
                <h2 className="display" style={{ fontSize: 26 }}>{s.title}</h2>
                <p className="muted" style={{ fontSize: 14, marginTop: 3 }}>{s.sub}</p>
              </div>
            </div>

            {/* Step content */}
            {step === 0 && <Step0 d={d} set={set} />}
            {step === 1 && <Step1 d={d} set={set} />}
            {step === 2 && <Step2 d={d} toggle={toggle} />}
            {step === 3 && <Step3 d={d} set={set} />}
            {step === 4 && <Step4 d={d} set={set} />}
            {step === 5 && <Step5 d={d} toggle={toggle} />}
            {step === 6 && <Step6 d={d} set={set} go={go} />}
          </div>
        </div>
        {/* Nav buttons */}
        <div className="row spread" style={{ padding: '16px 56px 28px', borderTop: '1px solid var(--line)', flex: 'none' }}>
          <button className="btn btn-ghost" onClick={back}>
            <Icon name="arrowLeft" size={17} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-lg" onClick={next}>
              Continue <Icon name="arrow" size={18} color="#06231a" />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => go('celebrate')} style={{ background: 'linear-gradient(135deg,var(--g-400),var(--teal))' }}>
              <Icon name="bolt" size={18} color="#06231a" /> Launch my agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----- Step 0: About you ----- */
function Step0({ d, set }) {
  return (
    <div className="col" style={{ gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="First name" icon="user" placeholder="e.g. Sarah" value={d.firstName} onChange={e => set('firstName', e.target.value)} />
        <Field label="Last name" placeholder="e.g. Chen" value={d.lastName} onChange={e => set('lastName', e.target.value)} />
      </div>
      <Field label="Company name" icon="building" placeholder="e.g. Acme Corp" value={d.company} onChange={e => set('company', e.target.value)} />
      <OSelect label="Your role" value={d.role} onChange={v => set('role', v)}
        options={['Account Executive', 'SDR / BDR', 'Sales Manager', 'VP of Sales', 'Founder / CEO', 'RevOps', 'Customer Success']} />
      <OSelect label="Your industry" value={d.industry} onChange={v => set('industry', v)}
        options={['SaaS / Software', 'Financial Services', 'Healthcare', 'Agency / Services', 'E-commerce / Retail', 'Manufacturing', 'Real Estate', 'Education', 'Other']} />
    </div>
  );
}

/* ----- Step 1: What you sell ----- */
function Step1({ d, set }) {
  return (
    <div className="col" style={{ gap: 22 }}>
      <div className="field">
        <label>What does your company sell?</label>
        <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>Describe your product or service in 1–2 sentences. Nexo uses this in every email it writes.</span>
        <textarea className="input" style={{ minHeight: 80, resize: 'vertical', padding: '12px 14px', fontFamily: 'inherit' }}
          placeholder="e.g. We sell an AI-powered CRM that automates data entry and surfaces deal insights for B2B sales teams."
          value={d.productDescription} onChange={e => set('productDescription', e.target.value)} />
      </div>
      <div className="field">
        <label>What makes you different?</label>
        <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>Your unique value proposition. Why should prospects pick you over alternatives?</span>
        <textarea className="input" style={{ minHeight: 80, resize: 'vertical', padding: '12px 14px', fontFamily: 'inherit' }}
          placeholder="e.g. Unlike traditional CRMs, we cut admin time by 60% and increase pipeline visibility with zero manual logging."
          value={d.valueProp} onChange={e => set('valueProp', e.target.value)} />
      </div>
      <div className="field">
        <label>Key pain points you solve</label>
        <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>What problems do your best customers face before they buy? Nexo uses these to craft compelling hooks.</span>
        <textarea className="input" style={{ minHeight: 80, resize: 'vertical', padding: '12px 14px', fontFamily: 'inherit' }}
          placeholder="e.g. Reps waste 5+ hours/week on manual data entry. Managers lack real-time pipeline visibility. Forecasts are unreliable."
          value={d.painPoints} onChange={e => set('painPoints', e.target.value)} />
      </div>
    </div>
  );
}

/* ----- Step 2: ICP ----- */
function Step2({ d, toggle }) {
  return (
    <div className="col" style={{ gap: 24 }}>
      <OMulti label="Decision-maker titles you target" hint="Nexo will prioritize these roles when finding prospects."
        options={['CEO / Founder', 'CTO / CIO', 'CFO / VP Finance', 'COO', 'VP Sales', 'VP Marketing / CMO', 'VP Engineering / Product', 'Head of Sales', 'Head of Growth', 'Sales Manager', 'RevOps / SalesOps', 'Director of IT', 'Procurement / Purchasing']}
        value={d.titles} onChange={v => toggle('titles', v)} />
      <OMulti label="Target company sizes"
        options={['Startup (1–20)', 'SMB (21–200)', 'Mid-Market (201–1k)', 'Enterprise (1k–10k)', 'Large Enterprise (10k+)']}
        value={d.companySizes} onChange={v => toggle('companySizes', v)} />
      <OMulti label="Target industries" hint="Which industries are your best-fit customers in?"
        options={['Technology / SaaS', 'Financial Services', 'Healthcare & Life Sciences', 'E-commerce / Retail', 'Manufacturing', 'Professional Services', 'Education', 'Media & Entertainment', 'Real Estate', 'Logistics & Supply Chain']}
        value={d.targetIndustries} onChange={v => toggle('targetIndustries', v)} />
      <OMulti label="Geographies"
        options={['North America', 'Europe', 'APAC', 'LATAM', 'Middle East & Africa', 'Global']}
        value={d.geos} onChange={v => toggle('geos', v)} />
    </div>
  );
}

/* ----- Step 3: Goals ----- */
function Step3({ d, set }) {
  return (
    <div className="col" style={{ gap: 24 }}>
      <div className="field">
        <div className="row spread"><label>Meetings per week target</label><span style={{ fontWeight: 800, color: 'var(--g-700)', fontSize: 18 }}>{d.meetingTarget}</span></div>
        <input type="range" min={1} max={50} value={d.meetingTarget} onChange={e => set('meetingTarget', +e.target.value)} style={{ accentColor: 'var(--g-500)', width: '100%', marginTop: 8 }} />
        <span className="faint" style={{ fontSize: 12.5 }}>Nexo will pace daily outreach to hit this number.</span>
      </div>
      <OSelect label="Average deal size" value={d.dealSize} onChange={v => set('dealSize', v)}
        options={['Under $5k', '$5k–$25k', '$25k–$100k', '$100k–$500k', '$500k+']} />
      <OSelect label="Typical sales cycle" value={d.salesCycle} onChange={v => set('salesCycle', v)}
        options={['Under 1 week', '1–4 weeks', '1–3 months', '3–6 months', '6+ months']} />
      <Field label="Booking / scheduling link" icon="calendar" placeholder="e.g. https://calendly.com/your-name"
        value={d.bookingLink} onChange={e => set('bookingLink', e.target.value)} />
      <span className="faint" style={{ fontSize: 12.5, marginTop: -16 }}>Nexo will include this link when proposing meetings to prospects.</span>
    </div>
  );
}

/* ----- Step 4: Tone ----- */
function Step4({ d, set }) {
  const sampleLines = {
    'Pain-based (problem-first)': d.painPoints
      ? `"Hi [First Name], ${d.painPoints.split('.')[0].trim().toLowerCase()}. ${d.company || 'We'} help teams like yours fix that. Open to a quick chat?"`
      : `"Hi [First Name], most ${d.titles[0] || 'sales leaders'} tell us their team wastes hours on low-value tasks. ${d.company || 'We'} built a better way. Worth 15 minutes?"`,
    'Insight-based (data/trend)': `"Hi [First Name], we've seen teams like yours cut sales cycle time by 30%+ after switching their approach. Happy to share how ${d.company || 'we'} can help. Quick call this week?"`,
    'Social proof (customer story)': `"Hi [First Name], one of our customers in ${d.targetIndustries[0] || 'your space'} booked 3× more qualified meetings in their first month. Want to see how?"`,
    'Personalized signal (news/hire)': `"Hi [First Name], I saw [Company] just [recent trigger]. When that happens, teams usually need ${d.productDescription ? d.productDescription.split(' ').slice(0,6).join(' ').toLowerCase() + '…' : 'help scaling fast'}. Worth exploring?"`,
    'Question-led': `"Hi [First Name], quick question: how is your team currently handling ${d.painPoints ? d.painPoints.split('.')[0].trim().toLowerCase() : 'outbound prospecting'}? We might be able to help."`,
  };
  return (
    <div className="col" style={{ gap: 24 }}>
      <OSelect label="Writing tone" value={d.tone} onChange={v => set('tone', v)}
        options={['Consultative', 'Direct & concise', 'Friendly & warm', 'Challenger', 'Formal']} />
      <OSelect label="Opening hook style" value={d.hook} onChange={v => set('hook', v)}
        options={['Pain-based (problem-first)', 'Insight-based (data/trend)', 'Social proof (customer story)', 'Personalized signal (news/hire)', 'Question-led']} />
      <OSelect label="Follow-up cadence" value={d.followup} onChange={v => set('followup', v)}
        options={['Aggressive (every 3 days)', 'Standard (every 5 days)', 'Gentle (every 7 days)', 'Custom (I\'ll configure later)']} />
      <div className="card" style={{ padding: 16, background: 'var(--g-50)', border: '1px solid var(--g-100)' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Sample opening line</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', fontStyle: 'italic' }}>
          {sampleLines[d.hook] || sampleLines['Pain-based (problem-first)']}
        </p>
        <span className="faint" style={{ fontSize: 11.5, marginTop: 8, display: 'block' }}>This preview adapts to your product info and hook style. Nexo will personalize each email per prospect.</span>
      </div>
    </div>
  );
}

/* ----- Step 5: Connect tools ----- */
function Step5({ d, toggle }) {
  const tools = [
    { t: 'Gmail', d: 'Send & track outreach emails', i: 'mail', group: 'Email' },
    { t: 'Outlook', d: 'Alternative email sender', i: 'mail', group: 'Email' },
    { t: 'HubSpot', d: 'Sync contacts, deals & activities', i: 'funnel', group: 'CRM' },
    { t: 'Salesforce', d: 'Enterprise CRM sync', i: 'funnel', group: 'CRM' },
    { t: 'Google Calendar', d: 'Auto-book meetings on open slots', i: 'calendar', group: 'Calendar' },
    { t: 'LinkedIn', d: 'Reach prospects via DM', i: 'users', group: 'Channels' },
    { t: 'Slack', d: 'Get notified on hot replies', i: 'chat', group: 'Notifications' },
  ];
  const groups = [...new Set(tools.map(t => t.group))];
  return (
    <div className="col" style={{ gap: 20 }}>
      {groups.map(g => (
        <div key={g}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{g}</div>
          <div className="col" style={{ gap: 8 }}>
            {tools.filter(t => t.group === g).map(c => {
              const on = d.tools.includes(c.t);
              return (
                <div key={c.t} className="row spread" style={{ padding: '12px 14px', border: '1.5px solid ' + (on ? 'var(--g-300)' : 'var(--line)'), borderRadius: 'var(--r-md)', background: on ? 'var(--g-50)' : '#fff', transition: 'all .14s' }}>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line)', color: on ? 'var(--g-600)' : 'var(--muted)' }}>
                      <Icon name={c.i} size={19} />
                    </span>
                    <div className="col">
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{c.t}</span>
                      <span className="faint" style={{ fontSize: 12 }}>{c.d}</span>
                    </div>
                  </div>
                  <button onClick={() => toggle('tools', c.t)} style={{
                    width: 44, height: 26, borderRadius: 99, padding: 3, flex: 'none',
                    background: on ? 'var(--g-500)' : 'var(--line)', transition: 'background .2s',
                  }}>
                    <span style={{ display: 'block', width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.15)', transform: on ? 'translateX(18px)' : 'none', transition: 'transform .2s' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----- Step 6: Review ----- */
function Step6({ d, set }) {
  const truncate = (s, len) => s && s.length > len ? s.slice(0, len) + '…' : (s || 'Not provided');
  const rows = [
    { l: 'Name', v: `${d.firstName} ${d.lastName}`.trim() || 'Not provided' },
    { l: 'Company', v: d.company || 'Not provided' },
    { l: 'Role', v: d.role },
    { l: 'Product', v: truncate(d.productDescription, 60) },
    { l: 'Value prop', v: truncate(d.valueProp, 60) },
    { l: 'Target titles', v: d.titles.join(', ') || 'Not provided' },
    { l: 'Target industries', v: d.targetIndustries.join(', ') || 'Not provided' },
    { l: 'Target market', v: d.companySizes.join(', ') || 'Not provided' },
    { l: 'Geographies', v: d.geos.join(', ') || 'Not provided' },
    { l: 'Meeting goal', v: `${d.meetingTarget} / week` },
    { l: 'Deal size', v: d.dealSize },
    { l: 'Tone', v: `${d.tone} · ${d.hook}` },
    { l: 'Booking link', v: d.bookingLink || 'Not set' },
    { l: 'Connected tools', v: d.tools.join(', ') || 'None' },
  ];
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="field">
        <label>Agent name</label>
        <div className="input-wrap">
          <span className="lead-ico"><Icon name="spark" size={19} /></span>
          <input className="input has-ico" value={d.agentName} onChange={e => set('agentName', e.target.value)} placeholder="Nexo" />
        </div>
        <span className="faint" style={{ fontSize: 12.5 }}>This is what your AI agent is called in the app.</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Your setup summary</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="row spread" style={{ padding: '11px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
            <span className="faint" style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</span>
            <span style={{ fontWeight: 700, fontSize: 13.5, textAlign: 'right', maxWidth: 280, color: 'var(--ink-2)' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- helpers ---- */
function OSelect({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="row wrap" style={{ gap: 9 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            height: 40, padding: '0 16px', borderRadius: 'var(--r-pill)', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
            border: '1.5px solid ' + (value === o ? 'var(--g-400)' : 'var(--line)'),
            background: value === o ? 'var(--g-50)' : '#fff',
            color: value === o ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .13s',
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}
function OMulti({ label, hint, options, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <span className="faint" style={{ fontSize: 12.5, marginTop: -4 }}>{hint}</span>}
      <div className="row wrap" style={{ gap: 9 }}>
        {options.map(o => {
          const on = value.includes(o);
          return (
            <button key={o} onClick={() => onChange(o)} style={{
              height: 40, padding: '0 16px', borderRadius: 'var(--r-pill)', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
              border: '1.5px solid ' + (on ? 'var(--g-400)' : 'var(--line)'),
              background: on ? 'var(--g-50)' : '#fff',
              color: on ? 'var(--g-700)' : 'var(--ink-2)', transition: 'all .13s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {on && <Icon name="check" size={14} color="var(--g-600)" stroke={2.5} />}{o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ CELEBRATION SCREEN ============ */
function CelebrationScreen({ go }) {
  const [tick, setTick] = useStateO(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    const stop = setTimeout(() => clearInterval(id), 2400);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, []);

  const items = [
    'ICP profile saved', 'Outreach templates generated', 'Cadence configured',
    'Tools connected', 'First 50 prospects queued', 'Agent ready',
  ];

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#f4fdf8,#e8f8f0 55%,#dff4ea)' }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '48px 40px', maxWidth: 580, animation: 'rise .5s both' }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: 'linear-gradient(140deg,#29d68f,#15c4c0)', display: 'grid', placeItems: 'center', margin: '0 auto', boxShadow: '0 16px 40px rgba(0,194,122,.3)', animation: 'pop .6s both' }}>
          <Icon name="bolt" size={46} color="#06231a" />
        </div>
        <h1 className="display" style={{ fontSize: 46, marginTop: 24 }}>Your agent is ready.</h1>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.55, marginTop: 14, maxWidth: 440, marginInline: 'auto' }}>
          Nexo is fully configured and queuing your first outreach. Let's get those meetings in the calendar.
        </p>

        {/* Boot checklist */}
        <div className="card" style={{ padding: '14px 20px', marginTop: 28, textAlign: 'left' }}>
          {items.map((item, i) => {
            const done = tick > i * 4;
            return (
              <div key={item} className="row" style={{ gap: 12, padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: done ? 'var(--g-500)' : 'var(--bg-2)', transition: 'background .3s' }}>
                  {done ? <Icon name="check" size={13} color="#06231a" stroke={3} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--line)' }} />}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: done ? 'var(--ink)' : 'var(--faint)', transition: 'color .3s' }}>{item}</span>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary btn-lg" style={{ marginTop: 28 }} onClick={() => go('dashboard')}>
          Open dashboard <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingWizard, CelebrationScreen });
