"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

let initialized = false;
let posthogClient = null;

async function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;
  if (initialized) return true;

  const posthogModule = await import("posthog-js");
  posthogClient = posthogModule.default;

  posthogClient.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    loaded: ph => {
      if (process.env.NODE_ENV === "development") ph.opt_out_capturing();
    },
  });
  initialized = true;
  return true;
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    initPostHog().then(active => {
      if (!active || cancelled || !posthogClient) return;
      const query = searchParams.toString();
      posthogClient.capture("$pageview", {
        $current_url: `${window.location.origin}${pathname}${query ? `?${query}` : ""}`,
        path: pathname,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}

export async function captureEvent(name, properties = {}) {
  const active = await initPostHog();
  if (!active || !posthogClient) return;
  posthogClient.capture(name, properties);
}
