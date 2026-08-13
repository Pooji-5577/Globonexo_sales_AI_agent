"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../lib/api";
import Icon from "../../../../components/ui/Icon";
import { campaignPreparationEvents, shouldPollCampaignPreparation, simulationPresentation } from "../../../../lib/campaign-display";

const ACTIVE_IMPORT = new Set(["queued", "searching", "candidates_found", "enriching", "waiting_for_enrichment"]);

function preparationLog(event, details = {}) {
  // Browser breadcrumbs are intentionally limited to state/counter data.
  // Do not log prospect identity, generated copy, or research contents.
  console.info(`[campaign] ${event}`, { at: new Date().toISOString(), ...details });
}

function formatCountdown(target, now) {
  if (!target) return null;
  const remaining = Math.max(0, new Date(target).getTime() - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function stageIcon(status) {
  if (status === "complete") return { icon: "check", color: "var(--g-600)", background: "var(--g-50)" };
  if (["attention", "failed", "warning"].includes(status)) return { icon: "alertCircle", color: "var(--warning)", background: "#fff8e8" };
  return { icon: "clock", color: "var(--blue)", background: "var(--blue-50, #eef6ff)" };
}

function SalesAgentTestModal({ campaignId, onClose }) {
  const clientRef = useRef(null);
  const [state, setState] = useState("starting");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [feedback, setFeedback] = useState("");

  const endCall = useCallback(() => {
    clientRef.current?.stopCall();
    clientRef.current = null;
    setState(current => current === "error" ? current : "ended");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const [{ RetellWebClient }, response] = await Promise.all([
          import("retell-client-js-sdk"),
          api.post(`/campaigns/${campaignId}/voice-agent/test-session`),
        ]);
        if (cancelled) return;
        setSessionId(response.data.sessionId);
        preparationLog("customer_test_session_started", { campaignId, sessionId: response.data.sessionId, agentVersion: response.data.agentVersion });
        const client = new RetellWebClient();
        clientRef.current = client;
        client.on("call_started", () => { preparationLog("customer_test_call_connected", { campaignId }); setState("connected"); });
        client.on("call_ended", () => { preparationLog("customer_test_call_ended", { campaignId }); setState("ended"); });
        client.on("error", message => {
          preparationLog("customer_test_call_failed", { campaignId, error: typeof message === "string" ? message : "browser_call_error" });
          setError(typeof message === "string" ? message : "The browser voice test failed.");
          setState("error");
        });
        await client.startCall({ accessToken: response.data.accessToken });
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.error || err?.message || "Could not start the sales-agent test.");
        setState("error");
      }
    };
    start();
    return () => {
      cancelled = true;
      clientRef.current?.stopCall();
      clientRef.current = null;
    };
  }, [campaignId]);

  useEffect(() => {
    if (state !== "connected") return undefined;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const sendFeedback = async rating => {
    if (!sessionId) return;
    await api.post(`/campaigns/${campaignId}/voice-agent/test-session/${sessionId}/feedback`, {
      rating,
      feedback: feedback.trim() || undefined,
    });
    preparationLog("customer_test_feedback_submitted", { campaignId, sessionId, rating });
    onClose();
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");

  return (
    <div role="dialog" aria-modal="true" aria-label="Test Sales Agent" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,.55)", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="card" style={{ width: "min(520px, 100%)", padding: 24, boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
        <div className="row spread" style={{ alignItems: "flex-start" }}>
          <div>
            <span className="badge" style={{ background: "#eef6ff", color: "var(--blue)", marginBottom: 10 }}>Test mode</span>
            <h2 className="display" style={{ fontSize: 23 }}>Speak with your Sales Agent</h2>
            <p className="faint" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>No prospect will be contacted. Calendar and external actions are simulated.</p>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => { endCall(); onClose(); }} aria-label="Close test">×</button>
        </div>

        <div style={{ margin: "28px auto", width: 130, height: 130, borderRadius: "50%", display: "grid", placeItems: "center", background: state === "connected" ? "var(--g-50)" : "var(--bg-2)", border: `1px solid ${state === "connected" ? "var(--g-300)" : "var(--line)"}` }}>
          <div style={{ textAlign: "center" }}>
            <Icon name={state === "error" ? "alertCircle" : "phone"} size={28} />
            <strong style={{ display: "block", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{minutes}:{remainder}</strong>
          </div>
        </div>

        <p style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>
          {state === "starting" ? "Connecting your microphone…" : state === "connected" ? "Test call connected" : state === "ended" ? "Test completed" : "Test could not continue"}
        </p>
        {error ? <div className="notice-warn" style={{ marginTop: 14 }}>{error}</div> : null}

        {state === "connected" ? (
          <button className="btn btn-primary" type="button" onClick={endCall} style={{ width: "100%", marginTop: 22 }}>End test</button>
        ) : null}
        {state === "ended" ? (
          <div className="col" style={{ gap: 10, marginTop: 20 }}>
            <textarea className="input" rows={3} value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="What should the agent improve? (optional)" />
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" type="button" onClick={() => sendFeedback("good")} style={{ flex: 1 }}>Agent was good</button>
              <button className="btn btn-ghost" type="button" onClick={() => sendFeedback("needs_improvement")} style={{ flex: 1 }}>Needs improvement</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CampaignPreparationPanel({ campaignId, channel, campaignStatus, onChanged }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [testing, setTesting] = useState(false);
  const lastStatusLogRef = useRef("");

  const load = useCallback(async () => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/preparation`);
      setData(response.data);
      const statusKey = [
        response.data?.campaign?.preparation_status,
        response.data?.campaign?.retell_simulation_status,
        response.data?.campaign?.acquisition_status,
        response.data?.campaign?.preparation_progress,
        response.data?.readinessCounts?.ready ?? 0,
        response.data?.latestImport?.status,
        response.data?.latestImport?.qualified ?? 0,
        response.data?.latestImport?.pending ?? 0,
      ].join("|");
      if (statusKey !== lastStatusLogRef.current) {
        lastStatusLogRef.current = statusKey;
        preparationLog("preparation_status_changed", {
          campaignId,
          preparationStatus: response.data?.campaign?.preparation_status,
          simulationStatus: response.data?.campaign?.retell_simulation_status,
          acquisitionStatus: response.data?.campaign?.acquisition_status,
          progress: response.data?.campaign?.preparation_progress,
          ready: response.data?.readinessCounts?.ready ?? 0,
          importStatus: response.data?.latestImport?.status,
          importQualified: response.data?.latestImport?.qualified ?? 0,
          importPending: response.data?.latestImport?.pending ?? 0,
        });
      }
      setError("");
      onChanged?.(response.data);
    } catch (err) {
      preparationLog("preparation_status_load_failed", { campaignId, error: err?.response?.data?.error || "request_failed" });
      setError(err?.response?.data?.error || "Could not load campaign preparation.");
    }
  }, [campaignId, onChanged]);

  useEffect(() => { load(); }, [load]);

  const preparationStatus = data?.campaign?.preparation_status ?? "not_started";
  const simulation = simulationPresentation(data);
  const simulationStatus = simulation.status;
  const importStatus = data?.latestImport?.status ?? null;
  useEffect(() => {
    if (!shouldPollCampaignPreparation(data)) return undefined;
    const timer = window.setInterval(load, 8000);
    return () => window.clearInterval(timer);
  }, [data, load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startPreparation = async () => {
    setBusy(true);
    try {
      await api.post(`/campaigns/${campaignId}/prepare`);
      preparationLog("preparation_requested", { campaignId });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not start campaign preparation.");
    } finally {
      setBusy(false);
    }
  };

  const retrySimulations = async () => {
    setBusy(true);
    try {
      await api.post(`/campaigns/${campaignId}/voice-agent/simulations/retry`);
      preparationLog("simulation_retry_requested", { campaignId });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not restart agent simulations.");
    } finally {
      setBusy(false);
    }
  };

  const latestRun = simulation.run;
  const importRun = data?.latestImport;
  const importIsActive = ACTIVE_IMPORT.has(importStatus);
  const preparationProgress = Number(data?.campaign?.preparation_progress ?? 0);
  const progress = preparationStatus === "not_started" && importRun
    ? Number(importRun.stageProgressPercent ?? 0)
    : preparationProgress;
  const ready = Number(data?.readinessCounts?.ready ?? 0);
  const target = Number(data?.campaign?.target_qualified_leads ?? 0);
  const countdown = formatCountdown(data?.campaign?.next_acquisition_at, now);
  const events = useMemo(() => campaignPreparationEvents(data), [data]);
  const hasAgent = Boolean(data?.campaign?.retell_staging_agent_id);
  const importFinishedEmpty = importRun?.isTerminal && Number(importRun.qualified ?? 0) === 0;
  const headline = importIsActive
    ? importStatus === "waiting_for_enrichment" ? "Waiting for Apollo enrichment" : "Finding and enriching campaign leads"
    : importFinishedEmpty
      ? "No contactable leads found"
      : preparationStatus === "not_started"
        ? "Ready to begin preparation"
        : preparationStatus === "attention"
          ? "Preparation needs attention"
          : progress >= 100 ? "Campaign assets are ready" : "Preparing your campaign";

  // Nothing is known until the first fetch resolves, and the "not started at
  // 0%" defaults are indistinguishable from a real unprepared campaign.
  // Rendering them made a live campaign flash a "Prepare campaign" card for a
  // second before collapsing, so wait for the answer instead of guessing it.
  if (!data) return error ? <div className="notice-warn" style={{ marginBottom: 0 }}>{error}</div> : null;

  const exhausted = data?.campaign?.acquisition_status === "audience_exhausted";
  const canTestAgent = channel === "voice" && hasAgent;

  // Once the campaign has been launched and preparation finished, the setup
  // checklist has nothing left to say — but acquisition keeps running, so the
  // countdown, the exhausted warning and the voice test stay reachable in a
  // single line. `attention` keeps the full card so Retry stays on screen.
  const launched = Boolean(campaignStatus) && campaignStatus !== "draft";
  if (launched && progress >= 100 && preparationStatus !== "attention") {
    if (!error && !exhausted && !countdown && !canTestAgent) return null;
    return (
      <>
        {error ? <div className="notice-warn" style={{ marginBottom: 0 }}>{error}</div> : null}
        {exhausted || countdown || canTestAgent ? (
          <section className="row spread campaign-acquisition-strip">
            <div className="row" style={{ gap: 14, flexWrap: "wrap", fontSize: 12.5 }}>
              {exhausted ? <span style={{ color: "var(--warning)", fontWeight: 700 }}>Audience exhausted</span> : null}
              {countdown ? <span style={{ color: "var(--blue)", fontWeight: 700 }}>Next leads in {countdown}</span> : null}
            </div>
            {canTestAgent ? (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTesting(true)}>
                <Icon name="phone" size={14} /> Test Sales Agent
              </button>
            ) : null}
          </section>
        ) : null}
        {testing ? <SalesAgentTestModal campaignId={campaignId} onClose={() => setTesting(false)} /> : null}
      </>
    );
  }

  return (
    <>
      <section className="card" style={{ padding: 20 }}>
        <div className="row spread" style={{ gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px" }}>
            <div className="row spread" style={{ gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Campaign preparation</p>
                <h2 style={{ fontSize: 19, marginTop: 5 }}>{headline}</h2>
              </div>
              <strong style={{ fontSize: 20 }}>{progress}%</strong>
            </div>
            <div style={{ height: 9, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden", marginTop: 14 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "var(--g-600)", transition: "width .3s ease" }} />
            </div>
            <div className="row" style={{ gap: 14, marginTop: 12, flexWrap: "wrap", fontSize: 12.5 }}>
              <span><strong>{ready}</strong> ready</span>
              {target ? <span><strong>{target}</strong> target prospects</span> : null}
              {importRun ? <span><strong>{importRun.candidatesFound}</strong> found</span> : null}
              {importRun ? <span><strong>{importRun.candidatesAttempted}</strong> enrichment attempts</span> : null}
              {Number(importRun?.pending ?? 0) > 0 ? <span><strong>{importRun.pending}</strong> waiting on Apollo</span> : null}
              {progress >= 100 && countdown ? <span style={{ color: "var(--blue)", fontWeight: 700 }}>Next leads in {countdown}</span> : null}
              {exhausted ? <span style={{ color: "var(--warning)", fontWeight: 700 }}>Audience exhausted</span> : null}
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {preparationStatus === "not_started" && !importIsActive && !importFinishedEmpty ? <button className="btn btn-primary btn-sm" type="button" disabled={busy} onClick={startPreparation}>{busy ? "Starting…" : "Prepare campaign"}</button> : null}
            {preparationStatus === "attention" ? <button className="btn btn-primary btn-sm" type="button" disabled={busy} onClick={startPreparation}>{busy ? "Retrying…" : "Retry preparation"}</button> : null}
            {canTestAgent ? <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTesting(true)}><Icon name="phone" size={14} /> Test Sales Agent</button> : null}
            {channel === "voice" && simulationStatus === "attention" ? <button className="btn btn-ghost btn-sm" type="button" disabled={busy} onClick={retrySimulations}>Retry simulations</button> : null}
          </div>
        </div>

        {error ? <div className="notice-warn" style={{ marginTop: 14 }}>{error}</div> : null}

        {importFinishedEmpty ? (
          <div className="notice-warn" style={{ marginTop: 14 }}>
            Apollo searched {importRun.pagesSearched} page{importRun.pagesSearched === 1 ? "" : "s"} and found {importRun.candidatesFound} candidates, but none passed enrichment and campaign contact rules. Review the audience filters and start a new import.
          </div>
        ) : null}

        {importRun ? (
          <div style={{ marginTop: 16, padding: 13, borderRadius: 9, background: "var(--bg-2)" }}>
            <div className="row spread" style={{ gap: 12, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 13 }}>Apollo lead acquisition · {String(importStatus).replace(/_/g, " ")}</strong>
              <span className="faint" style={{ fontSize: 12 }}>{importRun.qualified}/{importRun.requested} qualified</span>
            </div>
            <p className="faint" style={{ fontSize: 12, marginTop: 5 }}>
              {importRun.metadata?.message || `${importRun.duplicates} duplicates skipped · ${importRun.rejected} rejected · ${importRun.failed} provider failures`}
            </p>
          </div>
        ) : null}

        <div className="col" style={{ gap: 9, marginTop: 20 }}>
          {events.length === 0 ? (
            <p className="faint" style={{ fontSize: 13 }}>Preparation activity will appear here. No prospect is contacted before launch.</p>
          ) : events.map(event => {
            const appearance = stageIcon(event.status);
            return (
              <div key={event.id} className="row" style={{ gap: 11, padding: "10px 0", borderTop: "1px solid var(--line)", alignItems: "flex-start" }}>
                <span style={{ width: 28, height: 28, flex: "0 0 28px", borderRadius: "50%", display: "grid", placeItems: "center", color: appearance.color, background: appearance.background }}><Icon name={appearance.icon} size={14} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="row spread" style={{ gap: 10 }}>
                    <strong style={{ fontSize: 13 }}>{event.title}</strong>
                    {event.total_count != null ? <span className="faint" style={{ fontSize: 11.5 }}>{event.completed_count ?? 0}/{event.total_count}</span> : null}
                  </div>
                  {event.detail ? <p className="faint" style={{ fontSize: 12, lineHeight: 1.45, marginTop: 2 }}>{event.detail}</p> : null}
                </div>
              </div>
            );
          })}
        </div>

        {channel === "voice" && latestRun ? (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "var(--bg-2)" }}>
            <div className="row spread" style={{ gap: 12 }}>
              <strong style={{ fontSize: 13 }}>Agent simulations</strong>
              <span className="badge">{latestRun.pass_count}/{latestRun.total_count} passed</span>
            </div>
            <p className="faint" style={{ fontSize: 12, marginTop: 5 }}>
              {data.simulation.repairs?.length ?? 0} targeted improvement{(data.simulation.repairs?.length ?? 0) === 1 ? "" : "s"} applied · Status: {simulationStatus.replace(/_/g, " ")}
            </p>
            {simulation.failedScenario ? (
              <p style={{ fontSize: 12, marginTop: 7, color: "var(--warning)", lineHeight: 1.45 }}>
                <strong>{String(simulation.failedScenario).replace(/_/g, " ")}:</strong> {simulation.explanation || "Retell did not provide a result explanation."}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
      {testing ? <SalesAgentTestModal campaignId={campaignId} onClose={() => setTesting(false)} /> : null}
    </>
  );
}
