import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("../../lib/api", () => ({ default: apiMock }));

import DraftReview from "./DraftReview";

const messages = [
  {
    id: "message-step-2",
    stepNumber: 2,
    subject: "A useful follow-up",
    body: "Here is one more relevant angle.",
    status: "draft",
    lead: { name: "Grace Hopper", company: "Compiler Co", email: "grace@example.com" },
  },
  {
    id: "message-step-1",
    stepNumber: 1,
    subject: "A quick introduction",
    body: "I noticed your team is growing.",
    status: "draft",
    lead: { name: "Ada Lovelace", company: "Analytical Engines", email: "ada@example.com" },
  },
];

function mockRequests() {
  apiMock.get.mockImplementation(url => {
    if (url.endsWith("/messages")) {
      return Promise.resolve({ data: {
        items: messages,
        counts: { draft: 2, approved: 0, sent: 0 },
        autopilotEnabled: false,
      } });
    }
    if (url.endsWith("/generation")) {
      return Promise.resolve({ data: { isTerminal: true, failedLeads: 0 } });
    }
    if (url.endsWith("/steps")) {
      return Promise.resolve({ data: { items: [
        { stepNumber: 1, delayDays: 0, bodyPromptContext: "Open with one factual insight." },
        { stepNumber: 2, delayDays: 3, bodyPromptContext: "Add one new angle." },
      ] } });
    }
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
  apiMock.post.mockResolvedValue({ data: {} });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DraftReview sequence organization", () => {
  it("groups emails by sequence step and orders the sections by step number", async () => {
    mockRequests();
    render(<DraftReview campaignId="campaign-1" displayTimezone="UTC" />);

    const first = await screen.findByText("Step 1 · First touch");
    const second = screen.getByText("Step 2 · Follow-up");

    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Send immediately · 1 email ready")).toBeTruthy();
    expect(screen.getByText("Send on Day 3 · 1 email ready")).toBeTruthy();
    expect(screen.getByText("A quick introduction")).toBeTruthy();
    expect(screen.getByText("A useful follow-up")).toBeTruthy();
  });

  it("approves only the drafts in the selected step", async () => {
    mockRequests();
    render(<DraftReview campaignId="campaign-1" displayTimezone="UTC" />);

    const approveButtons = await screen.findAllByRole("button", { name: "Approve 1 draft" });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith(
        "/campaigns/campaign-1/messages/approve-batch",
        { messageIds: ["message-step-1"] },
      );
    });
  });
});
