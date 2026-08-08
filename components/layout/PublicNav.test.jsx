import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const authState = { value: null };

vi.mock("../../hooks/useAuth", () => ({ useAuth: () => authState.value }));

import PublicNav from "./PublicNav";

afterEach(cleanup);

describe("PublicNav session actions", () => {
  it("shows only Back to dashboard for an authenticated user", () => {
    authState.value = { user: { id: "user-1" }, loading: false };

    render(<PublicNav />);

    expect(screen.getByRole("link", { name: /Back to dashboard/i }).getAttribute("href")).toBe("/dashboard");
    expect(screen.queryByText("Sign in")).toBeNull();
    expect(screen.queryByText("Choose a plan")).toBeNull();
  });

  it("keeps the sign-in and plan actions for a signed-out visitor", () => {
    authState.value = { user: null, loading: false };

    render(<PublicNav />);

    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/login");
    expect(screen.getByRole("link", { name: /Choose a plan/i }).getAttribute("href")).toBe("/signup");
    expect(screen.queryByText(/Back to dashboard/i)).toBeNull();
  });

  it("does not flash signed-out actions while the session is loading", () => {
    authState.value = { user: null, loading: true };

    render(<PublicNav />);

    expect(screen.queryByText("Sign in")).toBeNull();
    expect(screen.queryByText("Choose a plan")).toBeNull();
    expect(screen.queryByText(/Back to dashboard/i)).toBeNull();
  });
});
