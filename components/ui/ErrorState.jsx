"use client";

import Icon from "./Icon";

export default function ErrorState({ title = "Something went wrong", message = "Refresh the page or try again in a moment.", reset }) {
  return (
    <div className="error-state">
      <span className="metric-icon" data-tone="warn"><Icon name="bell" size={18} /></span>
      <h1 className="display">{title}</h1>
      <p className="muted">{message}</p>
      <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {reset ? (
          <button className="btn btn-primary btn-sm" type="button" onClick={reset}>
            <Icon name="arrow" size={14} color="#06231a" /> Try again
          </button>
        ) : null}
        <a className="btn btn-ghost btn-sm" href="/dashboard">Go to dashboard</a>
      </div>
    </div>
  );
}
