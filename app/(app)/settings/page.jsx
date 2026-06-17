"use client";
import React, { useState } from "react";
import Icon from "../../../components/ui/Icon";
import Field from "../../../components/ui/Field";

function getAgentName() {
  if (typeof window === "undefined") return "Nexo";
  return window.__agentName || "Nexo";
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

export default function SettingsPage() {
  const name = getAgentName();
  const [tone, setTone] = useState('Consultative');
  const [vol, setVol] = useState(120);
  const [chans, setChans] = useState(['Email', 'LinkedIn']);
  const toggleChan = c => setChans(chans.includes(c) ? chans.filter(x => x !== c) : [...chans, c]);
  const [autos, setAutos] = useState({ firstTouch: true, approveReplies: true, autoBook: true, weekends: false });
  const toggle = k => setAutos(a => ({ ...a, [k]: !a[k] }));

  return (
    <div className="scroll grow" style={{ padding: '18px 24px', minHeight: 0 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="display" style={{ fontSize: 22 }}>Agent settings</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 20 }}>Tune how {name} sells on your behalf. Changes apply immediately.</p>
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
