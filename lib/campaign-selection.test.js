import { describe, expect, it, vi } from "vitest";
import { deleteCampaignsInBatches, toggleVisibleCampaignSelection } from "./campaign-selection";

describe("campaign bulk selection", () => {
  it("selects and clears only the currently visible campaigns", () => {
    expect(toggleVisibleCampaignSelection(["hidden"], ["a", "b"], true)).toEqual(["hidden", "a", "b"]);
    expect(toggleVisibleCampaignSelection(["hidden", "a", "b"], ["a", "b"], false)).toEqual(["hidden"]);
  });

  it("keeps deleting after one campaign fails and reports the partial result", async () => {
    const remove = vi.fn(async campaign => {
      if (campaign.id === "b") throw new Error("blocked");
    });
    const result = await deleteCampaignsInBatches([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ], remove, 2);

    expect(result.deletedIds).toEqual(["a", "c"]);
    expect(result.failed.map(item => item.name)).toEqual(["B"]);
  });
});
