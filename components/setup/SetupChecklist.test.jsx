import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const setupState = { value: null };

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../../providers/SetupProvider", () => ({ useSetup: () => setupState.value }));

import SetupChecklist from "./SetupChecklist";

const step = (id, overrides = {}) => ({
  id,
  status: "incomplete",
  detail: "",
  skipped: false,
  manual: false,
  dependsOn: [],
  ...overrides,
});

function mockSetup(overrides = {}) {
  setupState.value = {
    loading: false,
    error: "",
    steps: [],
    refresh: vi.fn(),
    skipStep: vi.fn(),
    resetStep: vi.fn(),
    openCopilot: vi.fn(),
    startTour: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

describe("checklist states", () => {
  it("shows a loading state while the real status is being fetched", () => {
    mockSetup({ loading: true });
    render(<SetupChecklist />);
    expect(screen.getByText(/Checking your setup/i)).toBeTruthy();
  });

  it("shows an error with a retry instead of a misleading empty checklist", () => {
    const refresh = vi.fn();
    mockSetup({ error: "Setup status could not be loaded.", refresh });
    render(<SetupChecklist />);

    expect(screen.getByText(/Setup status unavailable/i)).toBeTruthy();
    screen.getByRole("button", { name: /Retry/i }).click();
    expect(refresh).toHaveBeenCalled();
  });
});

describe("integration state rendering", () => {
  it("shows a connected integration as Done with the backend's detail", () => {
    mockSetup({
      steps: [step("gmail", { status: "complete", detail: "Sending from sales@globonexo.com." })],
    });
    render(<SetupChecklist />);

    expect(screen.getByText("Done")).toBeTruthy();
    expect(screen.getByText("Sending from sales@globonexo.com.")).toBeTruthy();
  });

  it("never renders Done for an unconnected integration", () => {
    mockSetup({
      steps: [step("gmail", { status: "incomplete", detail: "Gmail is not connected yet." })],
    });
    render(<SetupChecklist />);

    expect(screen.queryByText("Done")).toBeNull();
    expect(screen.getByText("To do")).toBeTruthy();
    expect(screen.getByText("Gmail is not connected yet.")).toBeTruthy();
  });

  it("renders an unavailable provider without offering an action", () => {
    mockSetup({
      steps: [step("apollo", { status: "unavailable", detail: "Apollo is not enabled on this workspace." })],
    });
    render(<SetupChecklist />);

    expect(screen.getByText("Not available")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Open Apollo search/i })).toBeNull();
  });

  it("marks a provider that needs reconnecting as needing attention", () => {
    mockSetup({
      steps: [step("retell", { status: "blocked", detail: "The voice number needs to be reconnected." })],
    });
    render(<SetupChecklist />);

    expect(screen.getByText("Needs attention")).toBeTruthy();
  });
});

describe("compact dashboard card", () => {
  it("points at the next unfinished step behind a Continue setup button", () => {
    mockSetup({
      steps: [
        step("profile", { status: "complete" }),
        step("gmail", { status: "complete" }),
        step("leads"),
      ],
    });
    render(<SetupChecklist variant="compact" />);

    expect(screen.getByText(/Finish your setup/i)).toBeTruthy();
    expect(screen.getByText(/2 of 3 steps done/i)).toBeTruthy();
    expect(screen.getByText(/Import or select leads/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continue setup/i })).toBeTruthy();
  });

  it("switches to a completed state once everything is resolved", () => {
    mockSetup({
      steps: [step("profile", { status: "complete" }), step("calendar", { skipped: true })],
    });
    render(<SetupChecklist variant="compact" />);

    expect(screen.getByText(/Setup complete/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Review setup/i })).toBeTruthy();
  });

  it("offers a tour replay from the dashboard", () => {
    const startTour = vi.fn();
    mockSetup({ steps: [step("leads")], startTour });
    render(<SetupChecklist variant="compact" />);

    screen.getByRole("button", { name: /Replay tour/i }).click();
    expect(startTour).toHaveBeenCalledWith({ restart: true });
  });
});

describe("skipping optional steps", () => {
  it("offers a skip on optional integrations only", () => {
    mockSetup({ steps: [step("calendar"), step("gmail")] });
    render(<SetupChecklist />);

    // Calendar is skippable, Gmail is not — so exactly one skip control.
    expect(screen.getAllByRole("button", { name: /Skip for now/i })).toHaveLength(1);
  });

  it("lets a skip be undone", () => {
    const resetStep = vi.fn().mockResolvedValue({});
    mockSetup({ steps: [step("calendar", { skipped: true })], resetStep });
    render(<SetupChecklist />);

    screen.getByRole("button", { name: /Undo skip/i }).click();
    expect(resetStep).toHaveBeenCalledWith("calendar");
  });
});
