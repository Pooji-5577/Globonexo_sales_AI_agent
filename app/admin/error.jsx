"use client";

import { useEffect } from "react";
import ErrorState from "../../components/ui/ErrorState";
import { captureEvent } from "../../providers/PostHogProvider";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    captureEvent("frontend_error_boundary", {
      scope: "admin",
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="admin-screen">
      <ErrorState title="Admin console crashed" message="Retry the admin console or return to the main app." reset={reset} />
    </div>
  );
}
