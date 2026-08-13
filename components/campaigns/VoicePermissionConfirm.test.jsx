import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import VoicePermissionConfirm from "./VoicePermissionConfirm";

afterEach(cleanup);

describe("VoicePermissionConfirm", () => {
  it("renders an actionable confirmation instead of only an error message", () => {
    const onChange = vi.fn();
    render(<VoicePermissionConfirm checked={false} onChange={onChange} compact />);

    const checkbox = screen.getByRole("checkbox", { name: /I confirm that my organization is permitted/i });
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
