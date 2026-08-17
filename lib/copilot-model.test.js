import { describe, expect, it } from "vitest";
import {
  DEFAULT_COPILOT_DRAFT,
  blockersForStep,
  buildLaunchPayload,
  canConfirm,
  confirmationSummary,
  hydrateDraft,
  visibleSteps,
  warningsForDraft,
} from "./copilot-model";

const connected = {
  gmail: { connected: true, status: "connected" },
  apollo: { connected: true, status: "connected" },
  retell: { connected: true, status: "connected", detail: "", phoneNumber: "+15550001111", agentReady: true },
};

const draftWith = overrides => ({ ...DEFAULT_COPILOT_DRAFT, ...overrides });

describe("wizard shape", () => {
  it("defaults new campaigns to 25 maximum leads", () => {
    expect(DEFAULT_COPILOT_DRAFT.maxLeads).toBe(25);
    expect(buildLaunchPayload({ ...DEFAULT_COPILOT_DRAFT, maxLeads: "" }).maxLeads).toBe(25);
  });

  it("hides the calling step on an email-only campaign", () => {
    const ids = visibleSteps(draftWith({ channel: "email" })).map(step => step.id);
    expect(ids).not.toContain("voice");
    expect(ids).toContain("confirm");
  });

  it("shows the calling step for voice", () => {
    expect(visibleSteps(draftWith({ channel: "voice" })).map(s => s.id)).toContain("voice");
  });
});

describe("step blockers", () => {
  it("blocks on the connections step when Gmail is missing for an email campaign", () => {
    const blockers = blockersForStep("connections", {
      draft: draftWith({ channel: "email" }),
      integrations: { ...connected, gmail: { connected: false, status: "disconnected" } },
      leadCount: 5,
    });
    expect(blockers.join(" ")).toMatch(/Connect an email account/i);
  });

  it("does not require Gmail for a voice-only campaign", () => {
    const blockers = blockersForStep("connections", {
      draft: draftWith({ channel: "voice" }),
      integrations: { ...connected, gmail: { connected: false, status: "disconnected" } },
      leadCount: 5,
    });
    expect(blockers).toHaveLength(0);
  });

  it("surfaces the backend's own explanation when calling is not ready", () => {
    const blockers = blockersForStep("connections", {
      draft: draftWith({ channel: "voice" }),
      integrations: {
        ...connected,
        retell: { connected: false, status: "pending", detail: "Your included number is being provisioned." },
      },
      leadCount: 5,
    });
    expect(blockers[0]).toBe("Your included number is being provisioned.");
  });

  it("distinguishes having no leads from having selected none", () => {
    const none = blockersForStep("leads", { draft: draftWith({}), integrations: connected, leadCount: 0 });
    expect(none[0]).toMatch(/no leads yet/i);

    const unselected = blockersForStep("leads", { draft: draftWith({}), integrations: connected, leadCount: 12 });
    expect(unselected[0]).toMatch(/Select at least one lead/i);
  });

  it("requires a usable campaign name and a valid sending window", () => {
    const short = blockersForStep("campaign", {
      draft: draftWith({ campaignName: "ab" }),
      integrations: connected,
      leadCount: 5,
    });
    expect(short.join(" ")).toMatch(/at least 3 characters/i);

    const inverted = blockersForStep("campaign", {
      draft: draftWith({ campaignName: "Valid name", businessHoursStart: "18:00", businessHoursEnd: "09:00" }),
      integrations: connected,
      leadCount: 5,
    });
    expect(inverted.join(" ")).toMatch(/must be after the start/i);
  });
});

describe("warnings", () => {
  it("warns when no sequence content was written", () => {
    const warnings = warningsForDraft({ draft: draftWith({ channel: "email" }), integrations: connected });
    expect(warnings.join(" ")).toMatch(/No sequence steps are filled in/i);
  });

  it("warns when Apollo is unavailable", () => {
    const warnings = warningsForDraft({
      draft: draftWith({}),
      integrations: { ...connected, apollo: { connected: false, status: "not_configured" } },
    });
    expect(warnings.join(" ")).toMatch(/Apollo enrichment is not enabled/i);
  });
});

describe("confirmation gate", () => {
  const ready = draftWith({ campaignName: "Q3 VP Sales", selectedLeadIds: ["a", "b"] });

  it("requires the confirmation checkbox", () => {
    expect(canConfirm({ draft: ready, integrations: connected, leadCount: 2, confirmed: false })).toBe(false);
    expect(canConfirm({ draft: ready, integrations: connected, leadCount: 2, confirmed: true })).toBe(true);
  });

  it("refuses to confirm when an earlier step is still blocked", () => {
    expect(canConfirm({
      draft: ready,
      integrations: { ...connected, gmail: { connected: false, status: "disconnected" } },
      leadCount: 2,
      confirmed: true,
    })).toBe(false);

    expect(canConfirm({
      draft: draftWith({ campaignName: "Q3", selectedLeadIds: ["a"] }),
      integrations: connected,
      leadCount: 1,
      confirmed: true,
    })).toBe(false);

    expect(canConfirm({
      draft: draftWith({ campaignName: "Q3 VP Sales", selectedLeadIds: [] }),
      integrations: connected,
      leadCount: 4,
      confirmed: true,
    })).toBe(false);
  });
});

describe("launch payload", () => {
  it("always sets confirm and defaults to not launching", () => {
    const payload = buildLaunchPayload(draftWith({ campaignName: "Q3" }));
    expect(payload.confirm).toBe(true);
    expect(payload.launch).toBe(false);
  });

  it("only launches when explicitly asked to", () => {
    expect(buildLaunchPayload(draftWith({}), { launch: true }).launch).toBe(true);
  });

  it("drops empty sequence steps and trims the rest", () => {
    const payload = buildLaunchPayload(draftWith({
      channel: "email",
      campaignName: "  Q3 VP Sales  ",
      followUps: [
        { delayDays: 0, subjectTemplate: " Hello ", bodyPromptContext: "" },
        { delayDays: 3, subjectTemplate: "", bodyPromptContext: "  " },
        { delayDays: 5, subjectTemplate: "", bodyPromptContext: "Follow up" },
      ],
    }));

    expect(payload.name).toBe("Q3 VP Sales");
    expect(payload.steps).toEqual([
      { delayDays: 0, subjectTemplate: "Hello", bodyPromptContext: "" },
      { delayDays: 5, subjectTemplate: "", bodyPromptContext: "Follow up" },
    ]);
  });

  it("sends no email sequence on a voice-only campaign", () => {
    const payload = buildLaunchPayload(draftWith({
      channel: "voice",
      followUps: [{ delayDays: 0, subjectTemplate: "Hello", bodyPromptContext: "x" }],
    }));
    expect(payload.steps).toEqual([]);
  });

  it("coerces numeric fields and caps the lead list", () => {
    const payload = buildLaunchPayload(draftWith({
      maxLeads: "250",
      dailySendCap: "",
      selectedLeadIds: Array.from({ length: 600 }, (_, i) => `lead-${i}`),
    }));

    expect(payload.maxLeads).toBe(250);
    expect(payload.dailySendCap).toBe(75);
    expect(payload.leadIds).toHaveLength(500);
  });
});

describe("draft hydration", () => {
  it("returns defaults for missing or malformed saved drafts", () => {
    expect(hydrateDraft(null)).toEqual(DEFAULT_COPILOT_DRAFT);
    expect(hydrateDraft("nonsense")).toEqual(DEFAULT_COPILOT_DRAFT);
  });

  it("restores a saved draft so the wizard resumes where it stopped", () => {
    const draft = hydrateDraft({ channel: "both", campaignName: "Q3", selectedLeadIds: ["a"] });
    expect(draft.channel).toBe("email");
    expect(draft.campaignName).toBe("Q3");
    expect(draft.selectedLeadIds).toEqual(["a"]);
    expect(draft.timezone).toBe(DEFAULT_COPILOT_DRAFT.timezone);
  });

  it("rejects an invalid channel and mistyped array fields", () => {
    const draft = hydrateDraft({ channel: "carrier-pigeon", selectedLeadIds: "not-an-array" });
    expect(draft.channel).toBe("email");
    expect(draft.selectedLeadIds).toEqual([]);
  });
});

describe("confirmation summary", () => {
  it("says nothing sends when creating a draft", () => {
    const summary = confirmationSummary(
      draftWith({ campaignName: "Q3", selectedLeadIds: ["a", "b"] }),
      { launch: false },
    );
    expect(summary).toMatch(/Nothing will send until you launch it/i);
    expect(summary).toMatch(/2 leads/);
  });

  it("names the channels when launching immediately", () => {
    const summary = confirmationSummary(
      draftWith({ campaignName: "Q3", channel: "voice", selectedLeadIds: ["a"] }),
      { launch: true },
    );
    expect(summary).toMatch(/AI calls/i);
    expect(summary).toMatch(/1 lead\b/);
  });
});
