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
      <div className="screen public-route-skeleton">
        <div className="module-skeleton public-route-skeleton-inner">
          <span className="skeleton-line public-route-skeleton-title" />
          <span className="skeleton-block public-route-skeleton-block" />
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
