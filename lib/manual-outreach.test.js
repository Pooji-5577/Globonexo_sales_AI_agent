import { describe, expect, it } from "vitest";
import { immediateEmailBlockReason } from "./manual-outreach";

const sendable = {
  hasEmail: true,
  campaignId: "campaign-1",
  status: "new",
  campaignBlocked: false,
};

describe("immediate email action", () => {
  it("allows a contacted lead to receive step one in a different campaign", () => {
    expect(immediateEmailBlockReason({ ...sendable, status: "contacted" })).toBeNull();
  });

  it("continues blocking suppression and stopped-sequence statuses", () => {
    expect(immediateEmailBlockReason({ ...sendable, status: "unsubscribed" })).toBe("sequence_stopped");
    expect(immediateEmailBlockReason({ ...sendable, campaignBlocked: true })).toBe("campaign_lead_blocked");
  });
});
