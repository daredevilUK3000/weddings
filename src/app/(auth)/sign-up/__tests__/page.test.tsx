/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signUp },
  }),
}));

import SignUpPage from "../page";

describe("SignUpPage", () => {
  beforeEach(() => {
    signUp.mockReset();
  });

  it("shows a confirmation screen after a successful sign-up", async () => {
    signUp.mockResolvedValue({ error: null });
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "me@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "hunter22" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(signUp).toHaveBeenCalled());
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText(/me@example.com/)).toBeInTheDocument();
  });

  it("shows an error message and stays on the form on failure", async () => {
    signUp.mockResolvedValue({ error: { message: "User already registered" } });
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "me@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "hunter22" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("User already registered")).toBeInTheDocument();
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });
});
