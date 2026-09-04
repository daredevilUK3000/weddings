import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUser, single, makeSupabaseChain } = vi.hoisted(() => {
  const getUser = vi.fn();
  const single = vi.fn();
  function makeSupabaseChain() {
    const eq2 = vi.fn(() => ({ single }));
    // eq1's result is used both as `.eq().eq().single()` (ceremonies lookup)
    // and `.eq().single()` (profiles lookup) — support both shapes.
    const eq1 = vi.fn(() => ({ eq: eq2, single }));
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

const { streamText, convertToModelMessages, toUIMessageStream, createUIMessageStreamResponse } =
  vi.hoisted(() => ({
    streamText: vi.fn((_opts: { system: string; messages: unknown }) => ({
      stream: "fake-stream",
    })),
    convertToModelMessages: vi.fn(async (messages: unknown) => messages),
    toUIMessageStream: vi.fn(({ stream }: { stream: unknown }) => stream),
    createUIMessageStreamResponse: vi.fn(
      ({ stream }: { stream: unknown }) =>
        new Response(JSON.stringify({ stream }), { status: 200 }),
    ),
  }));

vi.mock("ai", () => ({
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
}));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/ai/officiant-chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/officiant-chat", () => {
  beforeEach(() => {
    chain = makeSupabaseChain();
    getUser.mockReset();
    single.mockReset();
    streamText.mockClear();
    convertToModelMessages.mockClear();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ messages: [], ceremonyId: "c1" }));

    expect(res.status).toBe(401);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 404 when the ceremony doesn't exist or isn't owned by the user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: null });

    const res = await POST(makeRequest({ messages: [], ceremonyId: "missing" }));

    expect(res.status).toBe(404);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("streams a reply using the ceremony's vibe/reason/guest_count/location as context", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({
      data: {
        vibe: "gothic_romantic",
        reason: "A career milestone",
        guest_count: 8,
        location: "Edinburgh",
      },
    });

    const userMessage = { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] };
    const res = await POST(makeRequest({ messages: [userMessage], ceremonyId: "c1" }));

    expect(res.status).toBe(200);
    expect(streamText).toHaveBeenCalledTimes(1);

    const call = streamText.mock.calls[0][0];
    expect(call.system).toContain("gothic_romantic");
    expect(call.system).toContain("A career milestone");
    expect(call.system).toContain("8");
    expect(call.system).toContain("Edinburgh");
    expect(convertToModelMessages).toHaveBeenCalledWith([userMessage]);
  });
});
