import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

import { updateSession } from "../middleware";

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

describe("updateSession (auth proxy)", () => {
  beforeEach(() => {
    getUser.mockReset();
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

  it.each(["/login", "/sign-up", "/auth/callback", "/onboarding"])(
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
