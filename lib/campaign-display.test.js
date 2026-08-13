import { describe, expect, it } from "vitest";
import {
  formatScheduledInTimezone,
  campaignPreparationEvents,
  latestPreparationEvents,
  simulationPresentation,
  shouldPollCampaignPreparation,
  voiceLaunchGate,
} from "./campaign-display";

describe("voiceLaunchGate", () => {
  it("blocks an AI voice launch when preparation completed with zero ready leads", () => {
    expect(voiceLaunchGate({
      campaign: { preparation_status: "ready_partial", retell_simulation_status: "passed" },
      readinessCounts: { ready: 0, blocked: 1 },
    })).toEqual({
      blocked: true,
      message: "No voice leads are ready. Retry campaign preparation before launching.",
    });
  });
});

describe("latestPreparationEvents", () => {
  it("replaces running stage rows with their completed event", () => {
    const events = [
      { id: "created", stage: "campaign_created", status: "complete", title: "Campaign created" },
      { id: "lead-running", stage: "lead_preparation", status: "running", completed_count: 0, total_count: 25 },
      { id: "research-running", stage: "research", status: "running" },
      { id: "lead-complete", stage: "lead_preparation", status: "complete", completed_count: 25, total_count: 25 },
      { id: "research-complete", stage: "research", status: "complete" },
    ];

    expect(latestPreparationEvents(events)).toEqual([
      events[0],
      events[3],
      events[4],
    ]);
  });

  it("shows a completed stage as fully complete even if an old counter represented approval", () => {
    const [event] = latestPreparationEvents([
      { id: "generation", stage: "email_generation", status: "complete", completed_count: 0, total_count: 25 },
    ]);
    expect(event.completed_count).toBe(25);
  });

  it("preserves partial lead-preparation counts", () => {
    const [event] = latestPreparationEvents([
      { id: "leads", stage: "lead_preparation", status: "complete", completed_count: 20, total_count: 25 },
    ]);
    expect(event.completed_count).toBe(20);
  });
});

describe("formatScheduledInTimezone", () => {
  it("formats the same instant in the selected display timezone", () => {
    const instant = "2026-08-13T18:13:00.000Z";
    expect(formatScheduledInTimezone(instant, "America/New_York")).toMatch(/Aug 13.*2:13.*PM.*EDT/i);
    expect(formatScheduledInTimezone(instant, "Asia/Kolkata")).toMatch(/Aug 13.*11:43.*PM.*GMT\+5:30/i);
  });
});

describe("simulationPresentation", () => {
  const data = {
    campaign: { preparation_status: "attention", preparation_progress: 75, retell_simulation_status: "attention" },
    simulation: {
      runs: [{
        id: "run-4", status: "fail", total_count: 10, pass_count: 9, fail_count: 1,
        results: [{ scenarioKey: "booking", status: "fail", explanation: "The agent claimed a booking before the tool succeeded." }],
      }],
    },
  };

  it("shows the authoritative terminal score and failed explanation", () => {
    expect(simulationPresentation(data)).toMatchObject({
      status: "attention", active: false, passed: 9, total: 10,
      failedScenario: "booking",
      explanation: "The agent claimed a booking before the tool succeeded.",
    });
  });

  it("does not keep polling a terminal 75% attention state", () => {
    expect(shouldPollCampaignPreparation(data)).toBe(false);
  });

  it("keeps polling through the brief repair handoff before the next run appears", () => {
    expect(shouldPollCampaignPreparation({
      campaign: {
        preparation_status: "ready_partial",
        retell_simulation_status: "repairing",
        updated_at: "2026-08-13T18:27:37.017Z",
      },
      simulation: {
        runs: [{
          id: "run-2", status: "fail", total_count: 10, pass_count: 8,
          completed_at: "2026-08-13T18:27:36.066Z",
        }],
      },
      serverTime: "2026-08-13T18:27:38.000Z",
    })).toBe(true);
  });

  it("replaces a stale running activity with authoritative attention details", () => {
    const [event] = campaignPreparationEvents({
      ...data,
      events: [{ id: "stale", stage: "retell_simulation", status: "running", title: "Testing and improving the sales agent" }],
    });
    expect(event).toMatchObject({ status: "attention", completed_count: 9, total_count: 10 });
    expect(event.detail).toContain("booking");
    expect(event.detail).toContain("before the tool succeeded");
  });
});
