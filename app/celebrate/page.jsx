"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Aurora from "../../components/ui/Aurora";
import Icon from "../../components/ui/Icon";

export default function CelebratePage() {
  const router = useRouter();

  return (
    <div className="screen celebrate-screen">
      <Aurora />
      <div className="celebrate-shell">
        <section className="celebrate-copy" aria-labelledby="celebrate-title">
          <div className="celebrate-mark" aria-hidden="true">
            <Icon name="bolt" size={42} color="#06231a" stroke={2.25} />
          </div>
          <h1 id="celebrate-title" className="display">Your sales workspace is ready.</h1>
          <p>
            Your onboarding details are saved and your first campaign draft is created. GNX will prepare the first 50 Apollo leads in the background while you explore the workspace.
          </p>

          <div className="celebrate-actions">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => router.push("/dashboard")}>
              Open dashboard <Icon name="arrow" size={18} color="#06231a" />
            </button>
            <span className="celebrate-auto">
              You can review and launch the campaign when the audience is ready.
            </span>
          </div>
        </section>

        <aside className="celebrate-card" aria-label="Onboarding completion">
          <div className="celebrate-card-top">
            <div>
              <span>Setup complete</span>
              <strong>2/2 complete</strong>
            </div>
            <span className="celebrate-status"><span /> Ready</span>
          </div>
          <div className="celebrate-progress" aria-label="100% complete">
            <span style={{ width: "100%" }} />
          </div>
          <div className="celebrate-list">
            {[
              "Onboarding context saved",
              "First campaign draft created",
            ].map(label => (
              <div key={label} className="celebrate-item is-done">
                <span className="celebrate-check">
                  <Icon name="check" size={14} color="#06231a" stroke={3} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="celebrate-metrics">
            <div><strong>1</strong><span>Draft campaign</span></div>
            <div><strong>50</strong><span>Leads preparing</span></div>
            <div><strong>Now</strong><span>Workspace ready</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
