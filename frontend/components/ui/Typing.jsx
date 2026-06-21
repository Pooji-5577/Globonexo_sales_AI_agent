"use client";
import React from "react";

export default function Typing() {
  return (
    <div className="row" style={{ gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--g-500)',
          animation: 'pulse-dot 1.1s infinite', animationDelay: `${i * .18}s`,
        }} />
      ))}
    </div>
  );
}
