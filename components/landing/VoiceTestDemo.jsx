"use client";
import React from "react";

// Ported from the Claude Design export (tested_panel_literal.html). Four
// scenes play in sequence on a fixed schedule (not a continuous clock like
// QualifyDemo — this design is a discrete setTimeout chain per scene, so it's
// ported the same way: a flags object updated on a matching schedule).
// Scene 0 runs longer than the rest: it has to show a scenario fail, get
// corrected, and re-run before it passes, and that arc needs room to read.
const DWELL = [7900, 5000, 4400, 0];
const PILL_COUNT = 8; // 2 slots x 4 days, in DOM order; index 3 is the real slot (Tue 10:20)
const REAL_SLOT_INDEX = 3;

// The three scenarios shown in scene 0. Names match the real batch-testing
// suite; the middle one is deliberately shown failing and then being fixed —
// that arc is illustrative, not a replay of a specific logged failure.
export const RUNS = [
  { name: "Busy prospect" },
  { name: "Skeptical prospect", reason: "Too pushy — adjusting tone" },
  { name: "Wrong person" },
];

const initialFlags = {
  scene: 0,
  runs: ["idle", "idle", "idle"],
  total0: false,
  caption0: false,
  b1p: false, b1g: false, b1gStruck: false, b1gDissolve: false, b1r: false, caption1: false,
  dnc: false, waveFlat: false, statusEnded: false, caption2: false,
  scanning: [false, false, false, false, false, false, false, false],
  dim: false, locked: false, confirm: false, caption3: false,
  mounted: false,
};

const finalFlags = {
  scene: 3,
  runs: ["passed", "passed", "passed"],
  total0: true,
  caption0: true,
  b1p: true, b1g: false, b1gStruck: false, b1gDissolve: false, b1r: true, caption1: true,
  dnc: true, waveFlat: true, statusEnded: true, caption2: true,
  scanning: [false, false, false, false, false, false, false, false],
  dim: true, locked: true, confirm: true, caption3: true,
  mounted: true,
};

const RUN_LABEL = {
  idle: "Queued",
  running: "Running",
  failed: "Failed",
  fixing: "Fixing",
  retesting: "Retesting",
  passed: "Passed",
};

export default function VoiceTestDemo() {
  const rootRef = React.useRef(null);
  const startedRef = React.useRef(false);
  const timers = React.useRef([]);
  const [f, setF] = React.useState(initialFlags);
  const patch = (p) => setF((prev) => ({ ...prev, ...p }));
  const schedule = (fn, delay) => timers.current.push(setTimeout(fn, delay));

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setF(finalFlags);
      return;
    }

    const setRun = (i, state) =>
      setF((prev) => ({ ...prev, runs: prev.runs.map((v, idx) => (idx === i ? state : v)) }));

    const playScene0 = () => {
      // Rows resolve one at a time, then row 1 fails, gets corrected and is
      // re-run before it passes — the whole point of the scene.
      schedule(() => setRun(0, "running"), 500);
      schedule(() => setRun(0, "passed"), 1100);
      schedule(() => setRun(1, "running"), 1300);
      schedule(() => setRun(1, "failed"), 2200);
      schedule(() => setRun(2, "running"), 2400);
      schedule(() => setRun(2, "passed"), 3000);
      schedule(() => setRun(1, "fixing"), 3300);
      schedule(() => setRun(1, "retesting"), 4300);
      schedule(() => setRun(1, "passed"), 5300);
      schedule(() => patch({ total0: true }), 5800);
      schedule(() => patch({ caption0: true }), 6300);
    };

    const playScene1 = () => {
      schedule(() => patch({ b1p: true }), 280);
      schedule(() => patch({ b1g: true }), 1000);
      schedule(() => patch({ b1gStruck: true }), 2000);
      schedule(() => patch({ b1gDissolve: true }), 2700);
      schedule(() => patch({ b1r: true }), 2900);
      schedule(() => patch({ caption1: true }), 3600);
    };

    const playScene2 = () => {
      schedule(() => patch({ dnc: true }), 1400);
      schedule(() => patch({ waveFlat: true, statusEnded: true }), 1900);
      schedule(() => patch({ caption2: true }), 2600);
    };

    const playScene3 = () => {
      for (let i = 0; i < PILL_COUNT; i++) {
        schedule(() => {
          setF((prev) => ({ ...prev, scanning: prev.scanning.map((v, idx) => (idx === i ? true : v)) }));
          schedule(() => setF((prev) => ({ ...prev, scanning: prev.scanning.map((v, idx) => (idx === i ? false : v)) })), 220);
        }, 400 + i * 180);
      }
      const afterPills = 400 + PILL_COUNT * 180;
      schedule(() => patch({ dim: true, locked: true }), afterPills + 280);
      schedule(() => patch({ confirm: true }), afterPills + 700);
      schedule(() => patch({ caption3: true }), afterPills + 1200);
    };

    const playSequence = () => {
      patch({ mounted: true });
      let t = 0;
      patch({ scene: 0 });
      playScene0();
      t += DWELL[0];
      schedule(() => { patch({ scene: 1 }); playScene1(); }, t);
      t += DWELL[1];
      schedule(() => { patch({ scene: 2 }); playScene2(); }, t);
      t += DWELL[2];
      schedule(() => { patch({ scene: 3 }); playScene3(); }, t);
    };

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      playSequence();
    };

    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      start();
    } else {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.35) start(); }),
        { threshold: [0, 0.35, 0.7] }
      );
      io.observe(el);
      timers.current.push({ disconnect: () => io.disconnect() });
    }

    return () => {
      timers.current.forEach((t) => (typeof t === "number" ? clearTimeout(t) : t.disconnect && t.disconnect()));
      timers.current = [];
    };
  }, []);

  const cx = (...parts) => parts.filter(Boolean).join(" ");

  const days = [
    { label: "MON", slots: [{ t: "9:00", booked: true }, { t: "2:00", booked: true }] },
    { label: "TUE", slots: [{ t: "9:40", booked: true }, { t: "10:20", real: true }] },
    { label: "WED", slots: [{ t: "11:00", booked: true }, { t: "3:30", booked: true }] },
    { label: "THU", slots: [{ t: "9:15", booked: true }, { t: "1:00", booked: true }] },
  ];

  return (
    <div className="vd" ref={rootRef} aria-hidden="true">
      <div className={cx("vd-panel", f.mounted && "is-mounted")}>
        <div className="vd-dots">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={cx(f.scene === i && "is-active", f.scene > i && "is-done")} />
          ))}
        </div>

        <div className="vd-scenes">
          {/* Scene 1 — scored scenarios */}
          <div className={cx("vd-scene", f.scene === 0 && "is-active")}>
            <div className="vd-scene-head">
              <div className="vd-scene-icon"><Search /></div>
              <h3 className="vd-scene-title">Judged before it ever dials</h3>
            </div>
            <div className="vd-scene-body">
              <div className="vd-runs">
                {RUNS.map((run, i) => {
                  const state = f.runs[i];
                  return (
                    <div key={run.name} className={cx("vd-run", `is-${state}`)}>
                      <div className="vd-run-copy">
                        <div className="vd-run-name">{run.name}</div>
                        <div className="vd-run-reason">{run.reason}</div>
                      </div>
                      <div className="vd-run-pill">
                        {state === "running" || state === "retesting" || state === "fixing"
                          ? <span className="vd-run-spin" />
                          : <span className="vd-run-dot" />}
                        <span>{RUN_LABEL[state]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={cx("vd-run-total", f.total0 && "is-show")}>10 scenarios tested</div>
              <div className={cx("vd-caption", f.caption0 && "is-show")}>Every scenario scored before a campaign goes live</div>
            </div>
          </div>

          {/* Scene 2 — refuses to invent an answer */}
          <div className={cx("vd-scene", f.scene === 1 && "is-active")}>
            <div className="vd-scene-head">
              <div className="vd-scene-icon"><Lines /></div>
              <h3 className="vd-scene-title">Refuses to invent an answer</h3>
            </div>
            <div className="vd-scene-body">
              <div className="vd-thread">
                <div className={cx("vd-bubble vd-prospect", f.b1p && "is-show")}>&quot;Which customers have seen results?&quot;</div>
                <div className="vd-reply-stack">
                  <div className={cx("vd-bubble vd-invented", f.b1g && "is-show", f.b1gStruck && "is-struck", f.b1gDissolve && "is-dissolve")}>
                    <span className="vd-invented-copy">
                      &quot;We&apos;ve helped companies like Acme boost revenue 40%...&quot;
                    </span>
                  </div>
                  <div className={cx("vd-bubble vd-real", f.b1r && "is-show")}>
                    &quot;I don&apos;t have specific case data to share, but I can send you our documented results.&quot;
                  </div>
                </div>
              </div>
              <div className={cx("vd-caption", f.caption1 && "is-show")}>Never fabricates customers, pricing, or ROI it wasn&apos;t given</div>
            </div>
          </div>

          {/* Scene 3 — ends on a real DNC request */}
          <div className={cx("vd-scene", f.scene === 2 && "is-active")}>
            <div className="vd-scene-head">
              <div className="vd-scene-icon"><PhoneOff /></div>
              <h3 className="vd-scene-title">Ends the call on a real request</h3>
            </div>
            <div className="vd-scene-body">
              <div className="vd-call-card">
                <div className="vd-call-status">
                  <div className={cx("vd-status-dot", f.statusEnded && "is-ended")} />
                  <div className={cx("vd-status-text", f.statusEnded && "is-ended")}>
                    {f.statusEnded ? "CALL ENDED" : "LIVE CALL"}
                  </div>
                </div>
                <div className={cx("vd-wave", f.waveFlat && "is-flat")}>
                  {Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
                <div className={cx("vd-dnc-line", f.dnc && "is-show")}>&quot;Please don&apos;t call me again.&quot;</div>
              </div>
              <div className={cx("vd-caption", f.caption2 && "is-show")}>Ends the call immediately on a do-not-call request</div>
            </div>
          </div>

          {/* Scene 4 — books only what's actually open */}
          <div className={cx("vd-scene", f.scene === 3 && "is-active")}>
            <div className="vd-scene-head">
              <div className="vd-scene-icon"><Calendar /></div>
              <h3 className="vd-scene-title">Books what&apos;s actually open</h3>
            </div>
            <div className="vd-scene-body">
              <div className="vd-cal-row">
                {days.map((day, di) => (
                  <div key={day.label} className="vd-cal-day">
                    <div className="vd-day-label">{day.label}</div>
                    {day.slots.map((slot, si) => {
                      const idx = di * 2 + si;
                      const isReal = idx === REAL_SLOT_INDEX;
                      return (
                        <div
                          key={slot.t}
                          className={cx(
                            "vd-slot-pill",
                            slot.booked && "is-booked",
                            isReal && "is-open",
                            f.scanning[idx] && "is-scanning",
                            f.dim && !isReal && "is-dim",
                            isReal && f.locked && "is-locked"
                          )}
                        >
                          {slot.t}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className={cx("vd-confirm-line", f.confirm && "is-show")}>
                <CheckIcon />
                <div>
                  <div className="vd-confirm-time">Tue, 10:20 AM</div>
                  <div className="vd-confirm-tag">CONFIRMED — REAL OPEN SLOT</div>
                </div>
              </div>
              <div className={cx("vd-caption", f.caption3 && "is-show")}>Books only real calendar slots, never an invented time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline icons matching the original file's exact SVG paths (kept local
// rather than routed through the site's Icon.jsx, since these use a slightly
// different stroke set than that component's library).
const Search = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a5d3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);
const Lines = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a5d3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16" /><path d="M4 12h10" /><path d="M4 19h13" />
  </svg>
);
const PhoneOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a5d3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z" />
  </svg>
);
const Calendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a5d3f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" /><line x1="3.5" y1="10" x2="20.5" y2="10" />
    <line x1="8" y1="3" x2="8" y2="6.5" /><line x1="16" y1="3" x2="16" y2="6.5" />
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a5d3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 12.5 9.5 18 20 6.5" />
  </svg>
);
