import { describe, expect, it } from "vitest";
import {
  audienceDefaultsFromOnboarding,
  normalizeApolloLocations,
  onboardingKeywordSuggestions,
} from "./apollo-targeting";

describe("Apollo audience defaults", () => {
  it("converts onboarding labels to Apollo-compatible visible defaults", () => {
    expect(audienceDefaultsFromOnboarding({
      icp_titles: ["CEO / Founder"],
      icp_geos: ["United States", "USA"],
      icp_company_sizes: ["Startup (1-20)", "Enterprise (1k+)"],
      icp_target_industries: ["B2B SaaS", "IT Services"],
    })).toMatchObject({
      titles: ["CEO", "Founder"],
      locations: ["United States"],
      companySizes: ["1,20", "1001,"],
      industries: ["B2B SaaS", "IT Services"],
      keywords: "B2B SaaS, IT Services",
    });
  });

  it("derives transparent product suggestions without inventing buyer pain", () => {
    expect(onboardingKeywordSuggestions({
      icp_target_industries: ["Healthcare"],
      product_description: "We build websites, apps and AI automations",
      pain_points: "anything unverified",
    })).toEqual(["Healthcare", "web development", "mobile app development", "AI automation"]);
  });

  it("deduplicates location aliases", () => {
    expect(normalizeApolloLocations(["USA", "United States", "US"])).toEqual(["United States"]);
  });
});
