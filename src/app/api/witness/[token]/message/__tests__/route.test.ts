import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    insert: vi.fn(() => proxy),
    update: vi.fn(() => proxy),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return proxy;
}

const { from, queue, resetQueues } = vi.hoisted(() => {
  const queues: unknown[] = [];
  function resetQueues() {
    queues.length = 0;
  }
  function queue(result: unknown) {
    queues.push(result);
  }
  const from = vi.fn(() => {
    const next = queues.shift();
    if (!next) throw new Error("No mock queued");
    return next;
  });
  return { from, queue, resetQueues };
});

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({ from })),
}));

import { POST } from "../route";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/witness/tok_abc/message", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/witness/[token]/message", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("rejects an empty message", async () => {
    const res = await POST(req({ body: "   " }), { params: Promise.resolve({ token: "tok_abc" }) });
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown token", async () => {
    queue(chainResolving({ data: null, error: null }));

    const res = await POST(req({ body: "Congratulations!" }), {
      params: Promise.resolve({ token: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("inserts a new contribution when none exists yet", async () => {
    queue(chainResolving({ data: { id: "witness-1" }, error: null })); // witness lookup
    queue(chainResolving({ data: null, error: null })); // existing contribution lookup
    const insertChain = chainResolving({ data: null, error: null });
    queue(insertChain);

    const res = await POST(req({ body: "Congratulations!", includeInCeremony: true }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });

    expect(res.status).toBe(200);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        witness_id: "witness-1",
        body: "Congratulations!",
        include_in_ceremony: true,
      }),
    );
  });

  it("updates the existing contribution instead of inserting a second one", async () => {
    queue(chainResolving({ data: { id: "witness-1" }, error: null }));
    queue(chainResolving({ data: { id: "contribution-1" }, error: null }));
    const updateChain = chainResolving({ data: null, error: null });
    queue(updateChain);

    await POST(req({ body: "Updated message" }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });

    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ body: "Updated message" }),
    );
  });
});
