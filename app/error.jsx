"use client";

import { useEffect } from "react";
import ErrorState from "../components/ui/ErrorState";
import { captureEvent } from "../providers/PostHogProvider";

export default function RootError({ error, reset }) {
  useEffect(() => {
    captureEvent("frontend_error_boundary", {
      scope: "root",
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="screen" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <ErrorState reset={reset} />
    </div>
  );
}
