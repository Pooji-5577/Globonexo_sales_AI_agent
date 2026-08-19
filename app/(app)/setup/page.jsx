"use client";

import React from "react";
import SetupChecklist from "../../../components/setup/SetupChecklist";

export default function SetupPage() {
  return (
    <div className="scroll grow app-page">
      <div className="row spread page-head">
        <div>
          <h1 className="display page-title">Get set up</h1>
          <p className="muted page-subtitle">
            Everything your agent needs before it can run outreach. Each step reflects your real account.
            a tool only shows as connected once it genuinely is.
          </p>
        </div>
      </div>

      <SetupChecklist variant="full" />
    </div>
  );
}
