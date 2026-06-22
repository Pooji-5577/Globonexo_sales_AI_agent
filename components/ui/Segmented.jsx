"use client";
import React from "react";

export default function Segmented({ options, value, onChange }) {
  return (
    <div className="row" style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-pill)', padding: 4, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          height: 34, padding: '0 16px', borderRadius: 'var(--r-pill)',
          fontSize: 13.5, fontWeight: 700,
          color: value === o.value ? '#06231a' : 'var(--muted)',
          background: value === o.value ? '#fff' : 'transparent',
          boxShadow: value === o.value ? 'var(--sh-xs)' : 'none',
          transition: 'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}
