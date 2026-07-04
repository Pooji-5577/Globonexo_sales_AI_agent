"use client";

import { useEffect } from "react";
import ErrorState from "../../components/ui/ErrorState";
import { captureEvent } from "../../providers/PostHogProvider";

export default function AppError({ error, reset }) {
  useEffect(() => {
    captureEvent("frontend_error_boundary", {
      scope: "app",
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="scroll grow app-page">
      <ErrorState title="This app screen crashed" message="The rest of the app is still available. Retry this screen or return to the dashboard." reset={reset} />
    </div>
  );
}
