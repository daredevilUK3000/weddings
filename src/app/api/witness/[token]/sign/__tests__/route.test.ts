import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    insert: vi.fn(() => proxy),
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
  return new Request("http://localhost:3000/api/witness/tok_abc/sign", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/witness/[token]/sign", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("rejects an invalid signature type", async () => {
    const res = await POST(req({ signatureType: "uploaded", signatureData: "x", consent: true }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects a missing consent flag", async () => {
    const res = await POST(req({ signatureType: "typed", signatureData: "Maya Chen", consent: false }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 403 when the witness isn't permitted to sign", async () => {
    queue(chainResolving({ data: { id: "witness-1", can_sign_certificate: false }, error: null }));

    const res = await POST(req({ signatureType: "typed", signatureData: "Maya Chen", consent: true }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });
    expect(res.status).toBe(403);
  });

  it("inserts a signature row for a permitted witness", async () => {
    queue(chainResolving({ data: { id: "witness-1", can_sign_certificate: true }, error: null }));
    const insertChain = chainResolving({ data: null, error: null });
    queue(insertChain);

    const res = await POST(req({ signatureType: "typed", signatureData: "Maya Chen", consent: true }), {
      params: Promise.resolve({ token: "tok_abc" }),
    });

    expect(res.status).toBe(200);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        witness_id: "witness-1",
        signature_type: "typed",
        signature_data: "Maya Chen",
        consent: true,
      }),
    );
  });
});
