"use client";
import React from "react";
import Icon from "../ui/Icon";

// Ported from the Claude Design export (Qualify Panel.dc.html). A single
// continuous clock `t` drives everything — a sweeping glow line reveals each
// row (skeleton -> blurred text -> sharp text) as it passes, rather than the
// old discrete-beat timeline. The left-hand check list stays in sync with
// the same clock so both halves never drift apart.

export const CHECKS = [
  "Which companies fit what you sell",
  "Which person there is worth reaching",
  "Where we can actually reach them",
  "Why they should care today",
];

const ROW_H = 62;
const ROW_TOP = 31;

// Company names are deliberately fictional: lead A is shown being rejected,
// and that must never look like a real business failing our checks.
const A_ROWS = [
  { text: "Freight and logistics, 120 staff", kind: "pass", at: 1.3 },
  { text: "Operations Manager · matches your target titles", kind: "pass", at: 2.05 },
  { text: "info@ shared inbox · no direct number", kind: "fail", at: 2.85 },
  { text: "Why they should care today", kind: "none", at: 99, note: "not reached" },
];
const B_ROWS = [
  { text: "B2B software, 340 staff", kind: "pass", at: 7.2 },
  { text: "Head of Revenue Operations", kind: "pass", at: 7.9 },
  { text: "Verified work email · direct dial", kind: "pass", at: 8.6 },
  { text: "Headcount up 38% in 12 months", kind: "pass", at: 9.3 },
];
const SWEEP_A = [[0.6, -26], [1.3, ROW_TOP], [2.05, ROW_TOP + ROW_H], [2.85, ROW_TOP + 2 * ROW_H]];
const SWEEP_B = [
  [6.5, -26],
  [7.2, ROW_TOP],
  [7.9, ROW_TOP + ROW_H],
  [8.6, ROW_TOP + 2 * ROW_H],
  [9.3, ROW_TOP + 3 * ROW_H],
  [9.75, ROW_TOP + 3 * ROW_H + 46],
];
const END = 12.4;
const B_SWITCH = 5.85; // when the left-hand list flips from lead A's states to lead B's

const cl = (x, a, b) => Math.min(b, Math.max(a, x));
const ramp = (t, a, b) => cl((t - a) / (b - a), 0, 1);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const backOut = (p) => {
  const c = 1.9, q = p - 1;
  return 1 + (c + 1) * q * q * q + c * q * q;
};
const kf = (t, pts) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const p = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * easeOut(p);
    }
  }
  return pts[pts.length - 1][1];
};

const CARD_BASE = {
  position: "absolute", left: 0, right: 0, top: 0,
  background: "#fff", border: "1px solid #e6efea", borderRadius: 20,
  boxShadow: "0 18px 44px rgba(10,23,18,.08), 0 2px 6px rgba(10,23,18,.04)",
  overflow: "hidden", display: "flex", flexDirection: "column",
};

// Row reveal progress: 0 before the sweep line reaches it, ramps to 1 over a
// 40px band as the line passes, forced to 0 for the "not reached" row.
function rowReveal(rows, sweepY, row, idx) {
  if (row.kind === "none") return 0;
  return cl((sweepY - (ROW_TOP + idx * ROW_H) + 26) / 40, 0, 1);
}

function buildRows(rows, sweepY, cardVisible) {
  return rows.map((r, idx) => {
    const rev = rowReveal(rows, sweepY, r, idx);
    const near = cardVisible ? Math.max(0, 1 - Math.abs(sweepY - (ROW_TOP + idx * ROW_H)) / 46) : 0;
    const fail = r.kind === "fail";
    const scale = r.kind === "none" ? 0 : backOut(cl(rev, 0, 1));
    return {
      key: r.text + idx,
      text: r.text,
      note: r.note || "",
      isFail: fail,
      isPass: r.kind === "pass",
      rowStyle: {
        position: "relative", height: ROW_H, display: "flex", alignItems: "center", gap: 13,
        padding: "0 10px", margin: "0 -10px", borderRadius: 12,
        background: `rgba(0,168,106,${(0.07 * near).toFixed(3)})`,
      },
      iconStyle: {
        width: 24, height: 24, borderRadius: "50%", flex: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: fail ? "#b42318" : "#00a86a",
        boxShadow: fail ? "0 6px 16px rgba(180,35,24,.28)" : "0 6px 16px rgba(0,168,106,.3)",
        transform: `scale(${Math.max(0, scale).toFixed(3)})`,
        opacity: r.kind === "none" ? 0 : cl(rev * 3, 0, 1),
      },
      skelStyle: {
        height: 11, borderRadius: 6, background: "#dfe8e3",
        width: r.kind === "none" ? "58%" : "72%",
        opacity: (0.95 * (1 - rev)).toFixed(3),
      },
      textStyle: {
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        fontSize: 13.5, fontWeight: 700, color: "#0a1712", letterSpacing: "-.005em",
        filter: `blur(${(4.5 * (1 - rev)).toFixed(2)}px)`,
        opacity: rev.toFixed(3), transform: `translateX(${(6 * (1 - rev)).toFixed(2)}px)`,
      },
      // opacity is 0 here; the one row that carries a note (lead A's
      // "not reached" label) gets its real fade-in value patched in by the
      // caller, which has the current clock value `t` in scope.
      noteStyle: {
        fontSize: 11.5, fontWeight: 700, color: "#9aaba3", flex: "none",
        opacity: 0,
      },
    };
  });
}

function sweepStyles(t, pts, fadeIn, fadeOutA, fadeOutB) {
  const y = kf(t, pts);
  const op = cl(ramp(t, fadeIn, fadeIn + 0.25), 0, 1) * (1 - ramp(t, fadeOutA, fadeOutB));
  return [
    {
      position: "absolute", left: -14, right: -14, top: y, height: 2, borderRadius: 2,
      opacity: op.toFixed(3),
      background: "linear-gradient(90deg,rgba(0,168,106,0) 0%,#00a86a 22%,#7ee6b4 50%,#00a86a 78%,rgba(0,168,106,0) 100%)",
      boxShadow: "0 0 14px rgba(0,168,106,.55)", pointerEvents: "none",
    },
    {
      position: "absolute", left: -14, right: -14, top: y - 13, height: 28,
      opacity: (op * 0.75).toFixed(3),
      background: "linear-gradient(180deg,rgba(0,168,106,0),rgba(0,168,106,.16),rgba(0,168,106,0))",
      pointerEvents: "none",
    },
  ];
}

const banner = (p, tint, border, color) => ({
  display: "flex", alignItems: "center", gap: 10, margin: "0 16px 16px",
  padding: "13px 16px", borderRadius: 14, background: tint, border: `1px solid ${border}`,
  fontSize: 13, fontWeight: 800, color, letterSpacing: "-.005em",
  opacity: p.toFixed(3), transform: `translateY(${(16 * (1 - p)).toFixed(2)}px)`,
});
const actionRow = (p) => ({
  display: "flex", alignItems: "center", gap: 11, padding: "9px 12px",
  borderRadius: 12, background: "#f6faf8", border: "1px solid #eaf2ed",
  fontSize: 12.5, fontWeight: 700, color: "#0a1712",
  opacity: p.toFixed(3), transform: `translateY(${(10 * (1 - p)).toFixed(2)}px)`,
});

// Which state the left-hand list line should show, driven by the same clock.
// Uses each row's own `at` timestamp rather than the sweep's pixel position:
// the last row in a sequence doesn't always get swept past by a full reveal
// band (lead A's sweep stops exactly at its final row with no overshoot), so
// a position-derived "resolved" threshold can never fire for that row. The
// timestamp is unambiguous regardless of how far the line travels.
function leftLineState(t, row) {
  if (row.kind === "none") return "idle";
  if (t >= row.at) return row.kind === "fail" ? "fail" : "pass";
  if (t >= row.at - 0.5) return "active";
  return "idle";
}

export default function QualifyDemo() {
  const rootRef = React.useRef(null);
  const startedRef = React.useRef(false);
  const rafRef = React.useRef(null);
  const t0Ref = React.useRef(0);
  const [t, setT] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setReduced(true);
      setT(END);
      return;
    }
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      t0Ref.current = performance.now();
      loop();
    };
    const loop = () => {
      const elapsed = (performance.now() - t0Ref.current) / 1000;
      if (elapsed >= END) {
        setT(END);
        return;
      }
      setT(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.35) start();
        });
      },
      { threshold: [0, 0.35, 0.7] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const aIn = easeOut(ramp(t, 0.05, 0.5));
  const aOut = ramp(t, 5.3, 5.85);
  const bIn = easeOut(ramp(t, 5.85, 6.35));
  const sweepAY = kf(t, SWEEP_A);
  const sweepBY = kf(t, SWEEP_B);
  const sA = sweepStyles(t, SWEEP_A, 0.6, 3.1, 3.5);
  const sB = sweepStyles(t, SWEEP_B, 6.5, 9.7, 10.0);
  const rowsA = buildRows(A_ROWS, sweepAY, t < 3.4);
  const rowsB = buildRows(B_ROWS, sweepBY, t > 6.3);
  // noteStyle opacity above is a placeholder; the only row that carries a
  // note is A[3] ("not reached"), timed to fade in once lead A has resolved.
  if (rowsA[3]) rowsA[3].noteStyle.opacity = cl(ramp(t, 3.0, 3.6), 0, 1).toFixed(3);

  const cardAStyle = {
    ...CARD_BASE,
    opacity: (aIn * (1 - aOut)).toFixed(3),
    transform: `translateY(${(10 * (1 - aIn) + 8 * aOut).toFixed(2)}px)`,
    pointerEvents: "none",
  };
  const cardBStyle = {
    ...CARD_BASE,
    opacity: bIn.toFixed(3),
    transform: `translateY(${(12 * (1 - bIn)).toFixed(2)}px)`,
    pointerEvents: "none",
  };
  const bannerAStyle = banner(easeOut(ramp(t, 3.35, 3.85)), "linear-gradient(160deg,#fef4f3,#fdecea)", "#f6d5d1", "#b42318");
  const bannerBStyle = banner(easeOut(ramp(t, 9.8, 10.25)), "linear-gradient(160deg,#fff,#f0fbf5)", "#c9ecd9", "#0a5d3f");
  const action1Style = actionRow(easeOut(ramp(t, 10.45, 10.95)));
  const action2Style = actionRow(easeOut(ramp(t, 10.85, 11.35)));

  const showB = t >= B_SWITCH;
  const activeRows = showB ? B_ROWS : A_ROWS;
  const lineState = CHECKS.map((_, i) => leftLineState(t, activeRows[i]));

  return (
    <div className="landing-problem-grid" ref={rootRef}>
      <ol className="landing-problem-list" aria-label="What GNX works out before contacting anyone">
        {CHECKS.map((text, i) => (
          <li key={text} className={`landing-problem-row is-${lineState[i]}`}>
            <span className="landing-problem-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="landing-problem-mark" aria-hidden="true">
              {lineState[i] === "pass" && <Icon name="check" size={15} color="#fff" stroke={3} />}
              {lineState[i] === "fail" && <Icon name="close" size={14} color="#fff" stroke={3} />}
            </span>
            <p>{text}</p>
          </li>
        ))}
      </ol>

      <div className="qdemo" aria-hidden="true">
        <div style={cardAStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", borderBottom: "1px solid #e6efea" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(140deg,#06311f,#0a5d3f)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: ".02em", flex: "none" }}>NO</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontFamily: "'Space Grotesk',Manrope,sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-.01em", color: "#0a1712" }}>Northwind Logistics</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7f76" }}>Freight · 120 staff · Operations Manager</div>
            </div>
          </div>
          <div style={{ position: "relative", padding: "8px 22px 18px" }}>
            <div style={{ position: "relative" }}>
              {rowsA.map((r) => (
                <div key={r.key} style={r.rowStyle}>
                  <div style={r.iconStyle}>
                    {r.isFail && <Icon name="close" size={13} color="#fff" stroke={3} />}
                    {r.isPass && <Icon name="check" size={14} color="#fff" stroke={3} />}
                  </div>
                  <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                    <div style={r.skelStyle} />
                    <div style={r.textStyle}>{r.text}</div>
                  </div>
                  <div style={r.noteStyle}>{r.note}</div>
                </div>
              ))}
              <div style={sA[0]} />
              <div style={sA[1]} />
            </div>
          </div>
          <div style={bannerAStyle}>
            <Icon name="alertCircle" size={17} color="#b42318" stroke={1.9} />
            <span>Dropped before spending a credit.</span>
          </div>
        </div>

        <div style={cardBStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", borderBottom: "1px solid #e6efea" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(140deg,#06311f,#0a5d3f)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: ".02em", flex: "none" }}>BL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontFamily: "'Space Grotesk',Manrope,sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-.01em", color: "#0a1712" }}>Bluepeak Systems</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7f76" }}>Software · 340 staff · Head of Revenue Operations</div>
            </div>
          </div>
          <div style={{ position: "relative", padding: "8px 22px 18px" }}>
            <div style={{ position: "relative" }}>
              {rowsB.map((r) => (
                <div key={r.key} style={r.rowStyle}>
                  <div style={r.iconStyle}>
                    <Icon name="check" size={14} color="#fff" stroke={3} />
                  </div>
                  <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                    <div style={r.skelStyle} />
                    <div style={r.textStyle}>{r.text}</div>
                  </div>
                </div>
              ))}
              <div style={sB[0]} />
              <div style={sB[1]} />
            </div>
          </div>
          <div style={bannerBStyle}>
            <Icon name="check" size={17} color="#0a5d3f" stroke={2.4} />
            <span>Cleared for outreach.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px 18px" }}>
            <div style={action1Style}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: "#e8f7ef", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="mail" size={15} color="#0a5d3f" stroke={1.8} />
              </div>
              <span>Drafting email sequence · 3 steps</span>
            </div>
            <div style={action2Style}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: "#e8f7ef", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="phone" size={15} color="#0a5d3f" stroke={1.8} />
              </div>
              <span>Voice call queued · Tue, 10:20 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
