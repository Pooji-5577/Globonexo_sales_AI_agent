export default function RouteSkeleton({ variant = "dashboard" }) {
  if (variant === "admin") {
    return (
      <div className="admin-screen">
        <div className="module-skeleton">
          <span className="skeleton-line" style={{ width: 280, height: 28 }} />
          <div className="metric-grid">
            {[0, 1, 2, 3].map(item => <span key={item} className="skeleton-block" style={{ height: 76 }} />)}
          </div>
          <span className="skeleton-block" style={{ height: 360 }} />
        </div>
      </div>
    );
  }

  if (variant === "public") {
    return (
      <div className="screen" style={{ padding: 28 }}>
        <div className="module-skeleton" style={{ maxWidth: 1120, width: "100%", margin: "0 auto" }}>
          <span className="skeleton-line" style={{ width: 220, height: 34 }} />
          <span className="skeleton-block" style={{ height: 420 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="scroll grow app-page">
      <div className="module-skeleton">
        <div className="row spread page-head">
          <div className="col" style={{ gap: 10 }}>
            <span className="skeleton-line" style={{ width: 240, height: 28 }} />
            <span className="skeleton-line" style={{ width: 360, height: 14 }} />
          </div>
          <span className="skeleton-line" style={{ width: 140, height: 40 }} />
        </div>
        <div className="metric-grid">
          {[0, 1, 2, 3].map(item => <span key={item} className="skeleton-block" style={{ height: 76 }} />)}
        </div>
        <span className="skeleton-block" style={{ height: 460 }} />
      </div>
    </div>
  );
}
