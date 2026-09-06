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
  return new Request("http://localhost:3000/api/vendors/booking-status", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/vendors/booking-status", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockClear();
    resetQueues();
  });

  it("requires a vendorShortlistId", async () => {
    const res = await PATCH(req({ bookingStatus: "booked" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an invalid booking status", async () => {
    const res = await PATCH(req({ vendorShortlistId: "v1", bookingStatus: "on_the_moon" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an empty update with no recognized fields", async () => {
    const res = await PATCH(req({ vendorShortlistId: "v1", somethingElse: "x" }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await PATCH(req({ vendorShortlistId: "v1", bookingStatus: "booked" }));
    expect(res.status).toBe(401);
  });

  it("updates only the recognized fields sent, using snake_case columns", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const chain = chainResolving({ data: { id: "v1", booking_status: "booked" }, error: null });
    queue(chain);

    const res = await PATCH(
      req({ vendorShortlistId: "v1", bookingStatus: "booked", contactPerson: "Jamie" }),
    );

    expect(res.status).toBe(200);
    expect(chain.update).toHaveBeenCalledWith({
      booking_status: "booked",
      contact_person: "Jamie",
    });
    expect(chain.eq).toHaveBeenCalledWith("id", "v1");
  });

  it("returns 404 when the vendor row doesn't exist (or isn't owned by this user)", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queue(chainResolving({ data: null, error: null }));

    const res = await PATCH(req({ vendorShortlistId: "v1", bookingStatus: "booked" }));
    expect(res.status).toBe(404);
  });
});
