"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import api from "../lib/api";
import { TOUR_STEPS } from "../lib/tour-steps";
import { resumeIndex } from "../lib/tour-machine";

const SetupContext = createContext(null);

const INITIAL = {
  loading: true,
  error: "",
  steps: [],
  summary: { completed: 0, resolved: 0, total: 0, percent: 0, nextStepId: null, allRequiredComplete: false },
  tour: { status: "not_started", lastStepId: null, lastStepIndex: 0, seenStepIds: [] },
  integrations: null,
  counts: { leads: 0, campaigns: 0, activeCampaigns: 0 },
  copilotDraft: {},
};

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) throw new Error("useSetup must be used inside SetupProvider");
  return context;
}

export function SetupProvider({ children }) {
  const pathname = usePathname();
  const [state, setState] = useState(INITIAL);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const autoStarted = useRef(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState(current => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get("/setup");
      setState({
        loading: false,
        error: "",
        steps: Array.isArray(data?.steps) ? data.steps : [],
        summary: data?.summary ?? INITIAL.summary,
        tour: data?.tour ?? INITIAL.tour,
        integrations: data?.integrations ?? null,
        counts: data?.counts ?? INITIAL.counts,
        copilotDraft: data?.copilotDraft ?? {},
      });
      return data;
    } catch (err) {
      // A 401 is handled globally by the api interceptor; anything else leaves
      // the checklist in an explicit error state with a retry rather than
      // silently showing a misleading "nothing connected" checklist.
      setState(current => ({
        ...current,
        loading: false,
        error: err?.response?.data?.error || "Setup status could not be loaded.",
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Persisting tour position is best-effort: a failed write must never break
  // the tour the customer is currently walking through.
  const patchTour = useCallback(async patch => {
    setState(current => ({ ...current, tour: { ...current.tour, ...patch } }));
    try {
      const { data } = await api.patch("/setup/tour", patch);
      setState(current => ({ ...current, tour: data ?? current.tour }));
    } catch {
      /* keep the optimistic local state */
    }
  }, []);

  const startTour = useCallback(
    (options = {}) => {
      const index = options.restart ? 0 : resumeIndex(TOUR_STEPS, state.tour);
      setTourIndex(index);
      setTourOpen(true);
      patchTour({
        status: "in_progress",
        lastStepId: TOUR_STEPS[index]?.id ?? null,
        lastStepIndex: index,
      });
    },
    [patchTour, state.tour],
  );

  const goToTourStep = useCallback(
    index => {
      setTourIndex(index);
      patchTour({
        lastStepId: TOUR_STEPS[index]?.id ?? null,
        lastStepIndex: index,
        seenStepId: TOUR_STEPS[index]?.id,
      });
    },
    [patchTour],
  );

  const finishTour = useCallback(
    (status = "completed") => {
      setTourOpen(false);
      patchTour({ status });
    },
    [patchTour],
  );

  // First-run auto-start: only for a customer who has never seen the tour, only
  // once the real state has loaded (so it can't flash during a refresh), and
  // only on the dashboard. That is where the opening steps are anchored, and
  // it avoids ambushing someone who deep-linked into billing or a campaign.
  useEffect(() => {
    if (autoStarted.current || state.loading || state.error) return undefined;
    if (state.tour?.status !== "not_started") return undefined;
    if (pathname !== "/dashboard") return undefined;

    autoStarted.current = true;
    const timer = window.setTimeout(() => startTour(), 700);
    return () => window.clearTimeout(timer);
  }, [state.loading, state.error, state.tour?.status, startTour, pathname]);

  const skipStep = useCallback(
    async stepId => {
      const { data } = await api.post("/setup/steps", { stepId, action: "skip" });
      setState(current => ({ ...current, ...data }));
      return data;
    },
    [],
  );

  const resetStep = useCallback(
    async stepId => {
      const { data } = await api.post("/setup/steps", { stepId, action: "reset" });
      setState(current => ({ ...current, ...data }));
      return data;
    },
    [],
  );

  const saveCopilotDraft = useCallback(async draft => {
    try {
      await api.put("/setup/copilot/draft", { draft });
      setState(current => ({ ...current, copilotDraft: draft }));
    } catch {
      /* draft persistence is a convenience, not a requirement */
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refresh: load,
      tourOpen,
      tourIndex,
      startTour,
      goToTourStep,
      finishTour,
      copilotOpen,
      openCopilot: () => setCopilotOpen(true),
      closeCopilot: () => setCopilotOpen(false),
      skipStep,
      resetStep,
      saveCopilotDraft,
    }),
    [state, load, tourOpen, tourIndex, startTour, goToTourStep, finishTour, copilotOpen, skipStep, resetStep, saveCopilotDraft],
  );

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}
