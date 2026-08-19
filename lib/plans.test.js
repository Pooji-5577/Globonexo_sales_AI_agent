import { describe, expect, it } from 'vitest';
import { PLAN_CONFIG } from './plans';

describe('credit-based plan catalogue', () => {
  it('keeps all tiers on the same real capability set', () => {
    expect(PLAN_CONFIG.map((plan) => plan.monthlyCredits)).toEqual([2645, 5370, 14370]);
    expect(PLAN_CONFIG.map((plan) => [plan.emailCampaigns, plan.voiceCampaigns])).toEqual([
      [3, 1],
      [10, 4],
      [25, 10],
    ]);
    expect(PLAN_CONFIG.map((plan) => plan.dailyEmailCap)).toEqual([100, 200, 500]);
    expect(PLAN_CONFIG.every((plan) => plan.feats.includes('AI email sequences'))).toBe(true);
    expect(PLAN_CONFIG.every((plan) => plan.feats.includes('Apollo lead enrichment'))).toBe(true);
    expect(PLAN_CONFIG.every((plan) => plan.feats.includes('AI voice calling'))).toBe(true);
  });

  it('does not promise removed unsupported features', () => {
    const copy = JSON.stringify(PLAN_CONFIG).toLowerCase();
    expect(copy).not.toContain('unlimited');
    expect(copy).not.toContain('linkedin');
    expect(copy).not.toContain('sms');
    expect(copy).not.toContain('crm sync');
    expect(copy).not.toContain('seat');
  });
});
