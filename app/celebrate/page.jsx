"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "../../components/ui/Aurora";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";

const DEFAULT_TARGET = 50;

function readPreparation() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem("gnx_onboarding_preparation") || "{}");
  } catch {
    return {};
  }
}

function displayStatus(value) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function CelebratePage() {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState(null);
  const [queryRead, setQueryRead] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [preparation, setPreparation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCampaignId(params.get("campaignId"));
    setPreparation(readPreparation());
    setQueryRead(true);
  }, []);

  useEffect(() => {
    if (!queryRead) return;

    if (!campaignId) {
      setLoading(false);
      setError("The first campaign reference was not returned. Open Campaigns to continue.");
      return undefined;
    }

    let cancelled = false;
    let timer;

    const load = async () => {
      try {
        const [campaignResponse, preparationResponse] = await Promise.all([
          api.get(`/campaigns/${encodeURIComponent(campaignId)}`),
          api.get("/onboarding/preparation", { params: { campaignId } }),
        ]);
        if (cancelled) return;

        const nextCampaign = campaignResponse.data || null;
        const nextPreparation = preparationResponse.data || {};
        setCampaign(nextCampaign);
        setPreparation(nextPreparation);
        setError("");
        setLoading(false);

        const target = Number(nextPreparation.targetEnriched || DEFAULT_TARGET);
        const enriched = Number(nextPreparation.enriched || 0);
        const stillPreparing = nextPreparation.status === "queued"
          || nextPreparation.status === "preparing"
          || enriched < target && nextPreparation.status !== "attention";

        if (stillPreparing) {
          timer = window.setTimeout(load, 3000);
        }
      } catch (requestError) {
        if (cancelled) return;
        setLoading(false);
        setError(requestError?.response?.data?.message || requestError?.response?.data?.error || "We could not load the first campaign preparation. Please retry from Prospects.");
      }
    };

    load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [campaignId, queryRead]);

  const target = Number(preparation.targetEnriched || DEFAULT_TARGET);
  const enriched = Number(preparation.enriched || 0);
  const attached = Number(preparation.attached ?? preparation.candidatesFound ?? 0);
  const candidatesAttempted = Number(preparation.candidatesAttempted || 0);
  const status = loading ? "preparing" : preparation.status || (enriched >= target ? "ready" : "attention");
  const isReady = Boolean(campaign) && status === "ready" && enriched >= target;
  const needsAttention = Boolean(error) || status === "attention";

  const checklist = useMemo(() => [
    { label: "Onboarding context saved", done: !loading && !error },
    { label: "First campaign draft created", done: Boolean(campaign) },
    {
      label: preparation.searchPages > 0 ? "Apollo audience searched" : "Apollo audience search queued",
      done: preparation.searchPages > 0 || status === "ready" || status === "attention",
    },
    { label: `${enriched}/${target} prospects enriched`, done: enriched >= target },
    { label: "Ready for launch review", done: isReady },
  ], [campaign, enriched, error, isReady, loading, preparation.searchPages, status, target]);

  const completeCount = checklist.filter(item => item.done).length;
  const progress = enriched >= target ? 100 : Math.min(99, Math.round((enriched / Math.max(target, 1)) * 100));
  const apolloMessage = preparation.error || (needsAttention && !error
    ? `Apollo prepared ${enriched} enriched prospects. Refine the ICP and retry to reach ${target}.`
    : "");

  const title = loading
    ? "Preparing your first campaign."
    : isReady
      ? "Your first campaign is ready to review."
      : needsAttention
        ? "Your audience needs one more pass."
        : `Preparing your first ${target} enriched leads.`;

  const description = isReady
    ? "We created one draft campaign from your onboarding answers and prepared an enriched Apollo audience. Review the audience, sequence, and lead facts before you launch."
    : needsAttention
      ? "The campaign draft is saved, but Apollo did not reach the enriched-lead target. Refine the ICP in Prospects and retry before launching."
      : `GNX is searching Apollo, removing duplicates, and enriching each prospect. We will keep going until ${target} enriched leads are ready or Apollo has no more usable matches.`;

  return (
    <div className="screen celebrate-screen">
      <Aurora />
      <div className="celebrate-shell">
        <section className="celebrate-copy" aria-labelledby="celebrate-title">
          <div className="celebrate-mark" aria-hidden="true">
            <Icon name="bolt" size={42} color="#06231a" stroke={2.25} />
          </div>
          <h1 id="celebrate-title" className="display">{title}</h1>
          <p>{description}</p>

          {apolloMessage && (
            <div className="notice-warn" style={{ marginTop: 18, maxWidth: 580 }}>
              {apolloMessage}
            </div>
          )}

          {error && (
            <div className="notice-warn" style={{ marginTop: 12, maxWidth: 580 }}>
              {error}
            </div>
          )}

          <div className="celebrate-actions">
            <button
              className="btn btn-primary btn-lg"
              disabled={!campaign || loading || (!isReady && !needsAttention)}
              onClick={() => router.push(campaign?.id ? `/campaigns/${campaign.id}` : "/campaigns")}
            >
              {isReady ? "Review first campaign" : needsAttention ? "Open campaign" : "Preparing leads…"} <Icon name="arrow" size={18} color="#06231a" />
            </button>
            <span className="celebrate-auto">
              After launch, turn on Auto-Copilot to keep daily lead generation and outreach within your plan limits.
            </span>
          </div>
        </section>

        <aside className="celebrate-card" aria-label="First campaign preparation">
          <div className="celebrate-card-top">
            <div>
              <span>First campaign preparation</span>
              <strong>{completeCount}/{checklist.length} complete</strong>
            </div>
            <span className="celebrate-status"><span /> {loading ? "Preparing" : displayStatus(status)}</span>
          </div>
          <div className="celebrate-progress" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="celebrate-list">
            {checklist.map(item => (
              <div key={item.label} className={'celebrate-item ' + (item.done ? 'is-done' : '')}>
                <span className="celebrate-check">
                  {item.done ? <Icon name="check" size={14} color="#06231a" stroke={3} /> : <span />}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="celebrate-metrics">
            <div><strong>{loading ? "—" : `${enriched}/${target}`}</strong><span>Enriched prospects</span></div>
            <div><strong>{attached}</strong><span>Attached candidates</span></div>
            <div><strong>{candidatesAttempted}</strong><span>Enrichment attempts</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
