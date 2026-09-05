import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return proxy;
}

const { getUser, from, queue, resetQueues } = vi.hoisted(() => {
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
  return { getUser: vi.fn(), from, queue, resetQueues };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser }, from })),
}));

const { advanceStatus } = vi.hoisted(() => ({ advanceStatus: vi.fn() }));
vi.mock("@/lib/ceremony-status", () => ({ advanceStatus }));

import { POST } from "../route";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/director/status", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/director/status", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockClear();
    resetQueues();
    advanceStatus.mockReset();
  });

  it("rejects an invalid action", async () => {
    const res = await POST(req({ ceremonyId: "c1", action: "do_something_else" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(req({ ceremonyId: "c1", action: "begin_ceremony" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the ceremony isn't owned by this user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queue(chainResolving({ data: null, error: null }));

    const res = await POST(req({ ceremonyId: "c1", action: "begin_ceremony" }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when advanceStatus rejects the transition", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queue(chainResolving({ data: { id: "c1" }, error: null }));
    advanceStatus.mockResolvedValue({ ok: false, reason: "Cannot begin_ceremony from status \"planning\"" });

    const res = await POST(req({ ceremonyId: "c1", action: "begin_ceremony" }));
    expect(res.status).toBe(409);
  });

  it("returns 200 and calls advanceStatus on success", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queue(chainResolving({ data: { id: "c1" }, error: null }));
    advanceStatus.mockResolvedValue({ ok: true });

    const res = await POST(req({ ceremonyId: "c1", action: "begin_ceremony" }));
    expect(res.status).toBe(200);
    expect(advanceStatus).toHaveBeenCalledWith("c1", "begin_ceremony");
  });
});
