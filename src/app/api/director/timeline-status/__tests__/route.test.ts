import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    update: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    select: vi.fn(() => proxy),
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

import { PATCH } from "../route";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/director/timeline-status", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/director/timeline-status", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockClear();
    resetQueues();
  });

  it("requires a momentId", async () => {
    const res = await PATCH(req({ eventStatus: "active" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an invalid event status", async () => {
    const res = await PATCH(req({ momentId: "m1", eventStatus: "on_fire" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an update with no recognized fields", async () => {
    const res = await PATCH(req({ momentId: "m1" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await PATCH(req({ momentId: "m1", eventStatus: "active" }));
    expect(res.status).toBe(401);
  });

  it("only writes event_status/actual_start_at/actual_end_at, never moment_name or order_index", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const chain = chainResolving({ data: { id: "m1", event_status: "active" }, error: null });
    queue(chain);

    const res = await PATCH(
      req({ momentId: "m1", eventStatus: "active", actualStartAt: "2027-06-01T15:00:00.000Z" }),
    );

    expect(res.status).toBe(200);
    expect(chain.update).toHaveBeenCalledWith({
      event_status: "active",
      actual_start_at: "2027-06-01T15:00:00.000Z",
    });
    expect(chain.eq).toHaveBeenCalledWith("id", "m1");
  });

  it("returns 404 when the moment doesn't exist (or isn't owned by this user)", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queue(chainResolving({ data: null, error: null }));

    const res = await PATCH(req({ momentId: "m1", eventStatus: "completed" }));
    expect(res.status).toBe(404);
  });
});
