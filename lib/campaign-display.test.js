import { describe, expect, it } from "vitest";
import { formatScheduledInTimezone, latestPreparationEvents } from "./campaign-display";

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
