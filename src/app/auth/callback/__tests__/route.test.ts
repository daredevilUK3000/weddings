import { describe, it, expect, vi, beforeEach } from "vitest";

const { exchangeCodeForSession } = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession },
  })),
}));

import { GET } from "../route";

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
  });

  it("exchanges the code for a session when a code is present, then redirects", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const res = await GET(new Request("http://localhost:3000/auth/callback?code=abc123"));

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to the `next` param when provided", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const res = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc123&next=/onboarding"),
    );

    expect(res.headers.get("location")).toBe("http://localhost:3000/onboarding");
  });

  it("redirects without attempting an exchange when no code is present", async () => {
    const res = await GET(new Request("http://localhost:3000/auth/callback"));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });
});
