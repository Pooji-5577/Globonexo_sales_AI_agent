"use client";
import React from "react";
import Logo from "../ui/Logo";
import Aurora from "../ui/Aurora";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

export default function AuthAside({ kicker, headline, sub, bullets }) {
  return (
    <div style={{
      position: 'relative', width: 420, flex: 'none', overflow: 'hidden',
      background: 'linear-gradient(160deg, #06311f, #064d33 55%, #066b4a)',
      color: '#fff', padding: '42px 40px', display: 'flex', flexDirection: 'column',
    }}>
      <Aurora />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Logo size={32} light />
        <div style={{ marginTop: 'auto' }}>
          <div className="eyebrow" style={{ color: 'var(--g-300)' }}>{kicker}</div>
          <h1 className="display" style={{ fontSize: 38, marginTop: 14, color: '#fff', maxWidth: 320, lineHeight: 1.08 }}>{headline}</h1>
          <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.5, color: 'rgba(255,255,255,.78)', maxWidth: 310 }}>{sub}</p>
          <div className="col" style={{ gap: 12, marginTop: 28 }}>
            {bullets.map((b, i) => (
              <div key={i} className="row" style={{ gap: 11 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name="check" size={14} color="#6fe7b0" stroke={2.8} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 36, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,.14)' }}>
          <div className="row">
            {['Mara Ito', 'Devon Cole', 'Priya Raman'].map((n, i) => (
              <div key={n} style={{ marginLeft: i ? -9 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px #064d33' }}>
                <Avatar name={n} size={28} />
              </div>
            ))}
          </div>
          <span className="nw" style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>4,200+ revenue teams</span>
        </div>
      </div>
    </div>
  );
}
