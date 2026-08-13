"use client";

import React, { forwardRef } from "react";

const VoicePermissionConfirm = forwardRef(function VoicePermissionConfirm({ checked, onChange, compact = false }, ref) {
  return (
    <label
      className="row"
      style={{
        gap: 10,
        alignItems: "flex-start",
        padding: compact ? 10 : 14,
        border: `1px solid ${checked ? "var(--g-500)" : "#fdba74"}`,
        borderRadius: 9,
        cursor: "pointer",
        background: checked ? "var(--g-50)" : "#fff",
      }}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        style={{ marginTop: 3, flex: "none" }}
      />
      <span style={{ fontSize: compact ? 12 : 12.5, lineHeight: 1.5 }}>
        I confirm that my organization is permitted to make automated calls to these contacts and will follow applicable calling laws.
      </span>
    </label>
  );
});

export default VoicePermissionConfirm;
