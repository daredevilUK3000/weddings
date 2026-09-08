import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getUser, single } = vi.hoisted(() => ({
  getUser: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single })),
      })),
    })),
  })),
}));

import { updateSession } from "../middleware";

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

// Default: not locked (trial far in the future). Individual tests override
// via single.mockResolvedValueOnce for lock-specific scenarios.
const NOT_LOCKED_PROFILE = {
  data: { trial_ends_at: "2099-01-01T00:00:00Z", unlocked_at: null },
};

describe("updateSession (auth proxy)", () => {
  beforeEach(() => {
    getUser.mockReset();
    single.mockReset();
    single.mockResolvedValue(NOT_LOCKED_PROFILE);
  });

  it("redirects an unauthenticated user away from a protected page to /login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("does not redirect an authenticated user on a protected page", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects a user whose trial has expired and who hasn't paid to /locked", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({
      data: { trial_ends_at: "2020-01-01T00:00:00Z", unlocked_at: null },
    });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/locked");
  });

  it("returns 403 JSON instead of a redirect when a locked user hits a ceremony API route", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({
      data: { trial_ends_at: "2020-01-01T00:00:00Z", unlocked_at: null },
    });

    const res = await updateSession(makeRequest("/api/vendors/search"));

    expect(res.status).toBe(403);
  });

  it("does not lock an expired-trial user who has paid (unlocked_at set)", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({
      data: { trial_ends_at: "2020-01-01T00:00:00Z", unlocked_at: "2020-06-01T00:00:00Z" },
    });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not lock a user whose trial hasn't expired yet", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not gate non-ceremony routes even when the trial has expired", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({
      data: { trial_ends_at: "2020-01-01T00:00:00Z", unlocked_at: null },
    });

    const res = await updateSession(makeRequest("/dashboard"));

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it("fails open (does not lock) if the profile lookup errors, e.g. before the migration lands", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: null, error: { message: "column does not exist" } });

    const res = await updateSession(makeRequest("/ceremonies/abc/builder"));

    expect(res.status).not.toBe(307);
    expect(res.headers.get("location")).toBeNull();
  });

  it.each([
    "/login",
    "/sign-up",
    "/auth/callback",
    "/onboarding",
    "/witness/tok_abc",
    "/api/witness/tok_abc/rsvp",
    "/api/certificate/pdf",
    "/api/cron/notifications",
  ])(
    "allows an unauthenticated user to reach the public path %s",
    async (path) => {
      getUser.mockResolvedValue({ data: { user: null } });

      const res = await updateSession(makeRequest(path));

      expect(res.headers.get("location")).toBeNull();
    },
  );

  it("allows an unauthenticated user to reach the home page", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await updateSession(makeRequest("/"));

    expect(res.headers.get("location")).toBeNull();
  });
});
