import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * DEV_BILLING_BYPASS is read from process.env at module load time, so each
 * test that needs a specific value re-imports the module fresh after setting
 * the env var and resetting the module registry.
 */
async function loadWithBypassEnv(value) {
  vi.resetModules();
  if (value === undefined) delete process.env.NEXT_PUBLIC_DEV_BILLING_BYPASS;
  else process.env.NEXT_PUBLIC_DEV_BILLING_BYPASS = value;
  return import("./billingAccess");
}

const activeOrg = { subscription_status: "active" };
const unpaidOrg = { subscription_status: "payment_required" };
const member = { role: "member" };
const admin = { role: "admin" };

afterEach(() => {
  delete process.env.NEXT_PUBLIC_DEV_BILLING_BYPASS;
  vi.resetModules();
});

describe("the bypass must default to off", () => {
  it("denies an unpaid org when the env var is entirely unset", async () => {
    // This is the exact production condition that let every account reach
    // the dashboard without paying: NEXT_PUBLIC_DEV_BILLING_BYPASS was never
    // configured in Vercel, so it arrives here as undefined.
    const { hasWorkspaceAccess } = await loadWithBypassEnv(undefined);
    expect(hasWorkspaceAccess(member, unpaidOrg)).toBe(false);
  });

  it("denies an unpaid org for any value other than the exact opt-in", async () => {
    for (const value of ["", "0", "false", "no", "true"]) {
      const { hasWorkspaceAccess } = await loadWithBypassEnv(value);
      expect(hasWorkspaceAccess(member, unpaidOrg), `value=${JSON.stringify(value)}`).toBe(false);
    }
  });

  it("only bypasses when explicitly set to the string '1'", async () => {
    const { hasWorkspaceAccess } = await loadWithBypassEnv("1");
    expect(hasWorkspaceAccess(member, unpaidOrg)).toBe(true);
  });
});

describe("access decisions independent of the bypass", () => {
  it("grants access to a paid org regardless of the bypass setting", async () => {
    const { hasWorkspaceAccess } = await loadWithBypassEnv(undefined);
    expect(hasWorkspaceAccess(member, activeOrg)).toBe(true);
  });

  it("grants an admin access even to an unpaid org", async () => {
    const { hasWorkspaceAccess } = await loadWithBypassEnv(undefined);
    expect(hasWorkspaceAccess(admin, unpaidOrg)).toBe(true);
  });

  it("denies access when user or organization is missing", async () => {
    const { hasWorkspaceAccess } = await loadWithBypassEnv(undefined);
    expect(hasWorkspaceAccess(null, activeOrg)).toBe(false);
    expect(hasWorkspaceAccess(member, null)).toBe(false);
  });

  it("treats past_due the same as active", async () => {
    const { hasWorkspaceAccess } = await loadWithBypassEnv(undefined);
    expect(hasWorkspaceAccess(member, { subscription_status: "past_due" })).toBe(true);
  });
});
