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
    const redirect = setTimeout(() => router.push('/dashboard'), 6500);
    return () => { clearInterval(id); clearTimeout(stop); clearTimeout(redirect); };
  }, [router]);

  const items = [
    'ICP profile saved', 'Outreach templates generated', 'Cadence configured',
    'Tools connected', 'First 50 prospects queued', 'Agent ready',
  ];
  const completeCount = items.filter((_, i) => tick > i * 4).length;
  const progress = Math.round((completeCount / items.length) * 100);

  return (
    <div className="screen celebrate-screen">
      <Aurora />
      <div className="celebrate-shell">
        <section className="celebrate-copy" aria-labelledby="celebrate-title">
          <div className="celebrate-mark" aria-hidden="true">
            <Icon name="bolt" size={42} color="#06231a" stroke={2.25} />
          </div>
          <h1 id="celebrate-title" className="display">Your agent is ready.</h1>
          <p>
            GNX sales is fully configured and queueing your first outreach. Your prospect list,
            templates, cadence, and connected tools are ready to start booking meetings.
          </p>
          <div className="celebrate-actions">
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')}>
              Open dashboard <Icon name="arrow" size={18} color="#06231a" />
            </button>
            <span className="celebrate-auto">Auto-opening dashboard in a few seconds</span>
          </div>
        </section>

        <aside className="celebrate-card" aria-label="Agent launch checklist">
          <div className="celebrate-card-top">
            <div>
              <span>Launch sequence</span>
              <strong>{completeCount}/{items.length} complete</strong>
            </div>
            <span className="celebrate-status"><span /> Ready</span>
          </div>
          <div className="celebrate-progress" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="celebrate-list">
            {items.map((item, i) => {
              const done = tick > i * 4;
              return (
                <div key={item} className={'celebrate-item ' + (done ? 'is-done' : '')}>
                  <span className="celebrate-check">
                    {done ? <Icon name="check" size={14} color="#06231a" stroke={3} /> : <span />}
                  </span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
          <div className="celebrate-metrics">
            <div><strong>50</strong><span>Prospects queued</span></div>
            <div><strong>6</strong><span>Steps verified</span></div>
            <div><strong>Now</strong><span>First wave ready</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
