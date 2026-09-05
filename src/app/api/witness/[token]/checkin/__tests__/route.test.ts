import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    is: vi.fn(() => proxy),
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

function req() {
  return new Request("http://localhost:3000/api/witness/tok_abc/checkin", { method: "POST" });
}

describe("POST /api/witness/[token]/checkin", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("returns 404 for an unknown token", async () => {
    queue(chainResolving({ data: null, error: null }));

    const res = await POST(req(), { params: Promise.resolve({ token: "unknown" }) });
    expect(res.status).toBe(404);
  });

  it("sets checked_in_at only if it isn't already set", async () => {
    queue(chainResolving({ data: { id: "witness-1" }, error: null }));
    const updateChain = chainResolving({ data: null, error: null });
    queue(updateChain);

    const res = await POST(req(), { params: Promise.resolve({ token: "tok_abc" }) });

    expect(res.status).toBe(200);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ checked_in_at: expect.any(String) }),
    );
    expect(updateChain.is).toHaveBeenCalledWith("checked_in_at", null);
  });
});
