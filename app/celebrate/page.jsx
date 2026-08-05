"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "../../components/ui/Aurora";
import Icon from "../../components/ui/Icon";
import api from "../../lib/api";

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
  const [leadCount, setLeadCount] = useState(null);
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
      return;
    }

    let cancelled = false;
    Promise.all([
      api.get(`/campaigns/${encodeURIComponent(campaignId)}`),
      api.get("/leads", { params: { campaignId, page: 1, perPage: 100 } }),
    ])
      .then(([campaignResponse, leadsResponse]) => {
        if (cancelled) return;
        setCampaign(campaignResponse.data || null);
        const items = leadsResponse.data?.items;
        setLeadCount(Array.isArray(items) ? items.length : campaignResponse.data?.stats?.enrolled || 0);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError?.response?.data?.message || requestError?.response?.data?.error || "We could not load the prepared campaign. Open Campaigns to continue.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [campaignId, queryRead]);

  const apollo = preparation?.apollo || {};
  const checklist = useMemo(() => [
    { label: "Onboarding context saved", done: !loading && !error },
    { label: "First campaign draft created", done: Boolean(campaign) },
    {
      label: leadCount > 0 ? `${leadCount} Apollo prospects attached` : "Apollo lead batch attached",
      done: Number(leadCount) > 0,
    },
    { label: "Ready for your review", done: Boolean(campaign) },
  ], [campaign, error, leadCount, loading]);

  const completeCount = checklist.filter(item => item.done).length;
  const progress = Math.round((completeCount / checklist.length) * 100);
  const needsAttention = Boolean(error) || preparation?.status === "attention" || (campaign && Number(leadCount) === 0);
  const statusLabel = loading ? "Preparing" : needsAttention ? "Review needed" : "Ready to review";
  const apolloMessage = apollo.error || (Number(leadCount) === 0 && !loading ? "No leads are attached yet. You can run the Apollo search from Prospects before launching." : "");

  return (
    <div className="screen celebrate-screen">
      <Aurora />
      <div className="celebrate-shell">
        <section className="celebrate-copy" aria-labelledby="celebrate-title">
          <div className="celebrate-mark" aria-hidden="true">
            <Icon name="bolt" size={42} color="#06231a" stroke={2.25} />
          </div>
          <h1 id="celebrate-title" className="display">
            {loading ? "Preparing your first campaign." : campaign ? "Your first campaign is ready to review." : "Your sales workspace is ready."}
          </h1>
          <p>
            {campaign
              ? "We created one draft campaign from your onboarding answers and attached the first Apollo batch when it was available. Review the audience, sequence, and lead facts before you launch."
              : "Your onboarding details are saved. Open Campaigns to finish preparing your first outreach campaign."}
          </p>

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
              onClick={() => router.push(campaign?.id ? `/campaigns/${campaign.id}` : "/campaigns")}
            >
              {campaign ? "Review first campaign" : "Open campaigns"} <Icon name="arrow" size={18} color="#06231a" />
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
            <span className="celebrate-status"><span /> {statusLabel}</span>
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
            <div><strong>{loading ? "—" : Number(leadCount || 0)}</strong><span>Prospects attached</span></div>
            <div><strong>{campaign ? displayStatus(campaign.status) : "—"}</strong><span>Campaign status</span></div>
            <div><strong>{campaign?.status === "active" ? "On" : "Manual"}</strong><span>Launch control</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
