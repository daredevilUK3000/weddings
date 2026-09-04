import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUser, single, makeSupabaseChain } = vi.hoisted(() => {
  const getUser = vi.fn();
  const single = vi.fn();
  function makeSupabaseChain() {
    const eq2 = vi.fn(() => ({ single }));
    const eq1 = vi.fn(() => ({ eq: eq2 }));
    const select = vi.fn(() => ({ eq: eq1 }));
    const from = vi.fn((_table: string) => ({ select }));
    return { from, select, eq1, eq2 };
  }
  return { getUser, single, makeSupabaseChain };
});

let chain = makeSupabaseChain();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from: (table: string) => chain.from(table),
  })),
}));

const { generateText } = vi.hoisted(() => ({
  generateText: vi.fn(async (_opts: { prompt: string }) => ({
    text: "I hear how much that took.",
  })),
}));

vi.mock("ai", () => ({ generateText }));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/ai/officiant-acknowledge", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/officiant-acknowledge", () => {
  beforeEach(() => {
    chain = makeSupabaseChain();
    getUser.mockReset();
    single.mockReset();
    generateText.mockClear();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ ceremonyId: "c1", question: "q", answer: "a" }));

    expect(res.status).toBe(401);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("returns 404 when the ceremony doesn't exist or isn't owned by the user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: null });

    const res = await POST(makeRequest({ ceremonyId: "missing", question: "q", answer: "a" }));

    expect(res.status).toBe(404);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("returns a short acknowledgment generated from the ceremony's vibe and the answer", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: { vibe: "minimalist" } });

    const res = await POST(
      makeRequest({
        ceremonyId: "c1",
        question: "What brought you here?",
        answer: "A hard year I finally got through.",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.acknowledgment).toBe("I hear how much that took.");

    const prompt = generateText.mock.calls[0][0].prompt as string;
    expect(prompt).toContain("What brought you here?");
    expect(prompt).toContain("A hard year I finally got through.");
    expect(prompt).toContain("spare, sincere, unfussy");
  });
});
