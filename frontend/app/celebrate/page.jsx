"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "../../components/ui/Aurora";
import Icon from "../../components/ui/Icon";

export default function CelebratePage() {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    const stop = setTimeout(() => clearInterval(id), 2400);
    const redirect = setTimeout(() => router.push('/dashboard'), 3400);
    return () => { clearInterval(id); clearTimeout(stop); clearTimeout(redirect); };
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
          Nexo is fully configured and queuing your first outreach. Let&apos;s get those meetings in the calendar.
        </p>

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

        <button className="btn btn-primary btn-lg" style={{ marginTop: 28 }} onClick={() => router.push('/dashboard')}>
          Open dashboard <Icon name="arrow" size={18} color="#06231a" />
        </button>
      </div>
    </div>
  );
}
