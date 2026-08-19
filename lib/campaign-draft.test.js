import { describe, expect, it } from "vitest";
import { normalizeSavedCampaignForm } from "./campaign-draft";

describe("campaign draft restoration", () => {
  it("clamps legacy 100-lead drafts to the current 25-lead campaign maximum", () => {
    expect(normalizeSavedCampaignForm({ maxLeads: 100 }).maxLeads).toBe(25);
  });

  it("removes the old customer-facing Apollo credit control from saved drafts", () => {
    const restored = normalizeSavedCampaignForm({
      channel: "voice",
      apolloCreditLimit: 26,
      maxLeads: 10,
    });

    expect(restored).toEqual({ channel: "voice", maxLeads: 10, weeklyQualifiedLeadTarget: 25 });
    expect(restored).not.toHaveProperty("apolloCreditLimit");
  });

  it("normalizes invalid saved limits to safe defaults", () => {
    expect(normalizeSavedCampaignForm({ maxLeads: "bad", weeklyQualifiedLeadTarget: 999 })).toMatchObject({
      maxLeads: 25,
      weeklyQualifiedLeadTarget: 25,
    });
  });
});
