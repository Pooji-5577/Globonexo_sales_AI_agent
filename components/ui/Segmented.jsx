"use client";
import React from "react";

export default function Segmented({ options, value, onChange, className = "" }) {
  return (
    <div className={`row segmented-control ${className}`.trim()} role="tablist">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? "is-active" : ""}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}
