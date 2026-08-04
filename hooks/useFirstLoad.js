"use client";

import { useRef } from "react";

export function useFirstLoad(loading) {
  const loadedOnce = useRef(false);
  if (!loading) loadedOnce.current = true;
  return loading && !loadedOnce.current;
}
