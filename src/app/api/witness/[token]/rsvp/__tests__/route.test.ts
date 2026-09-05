import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
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
  return new Request("http://localhost:3000/api/witness/tok_abc/rsvp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/witness/[token]/rsvp", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("rejects an invalid status", async () => {
    const res = await POST(req({ status: "maybe" }), { params: Promise.resolve({ token: "tok_abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the token doesn't resolve to a witness", async () => {
    queue(chainResolving({ data: null, error: null }));

    const res = await POST(req({ status: "accepted" }), {
      params: Promise.resolve({ token: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("writes rsvp_status and rsvp_at for a valid witness", async () => {
    queue(chainResolving({ data: { id: "witness-1" }, error: null }));
    const updateChain = chainResolving({ data: null, error: null });
    queue(updateChain);

    const res = await POST(req({ status: "accepted" }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });

    expect(res.status).toBe(200);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ rsvp_status: "accepted", rsvp_at: expect.any(String) }),
    );
    expect(updateChain.eq).toHaveBeenCalledWith("id", "witness-1");
  });
});
