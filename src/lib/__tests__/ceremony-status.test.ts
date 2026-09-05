import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
  const queues: Record<string, unknown[]> = {};
  function resetQueues() {
    for (const key of Object.keys(queues)) delete queues[key];
  }
  function queue(table: string, result: unknown) {
    queues[table] = queues[table] ?? [];
    (queues[table] as unknown[]).push(result);
  }
  const from = vi.fn((table: string) => {
    const q = queues[table] as unknown[] | undefined;
    if (!q || q.length === 0) throw new Error(`No mock queued for table "${table}"`);
    return q.shift();
  });
  return { from, queue, resetQueues };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

function queueChain(table: string, result: unknown) {
  const chain = chainResolving(result);
  queue(table, chain);
  return chain;
}

import { ensureStatusProgression, advanceStatus } from "../ceremony-status";

describe("ensureStatusProgression", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("advances planning to preparing once script, vows, date, and location are all set", async () => {
    queueChain("ceremonies", {
      data: {
        status: "planning",
        ceremony_script: "Script",
        vows: "Vows",
        date: "2027-06-01",
        location: "Paris",
        start_time: "15:00",
      },
      error: null,
    });
    const update = chainResolving({ data: null, error: null });
    queue("ceremonies", update);

    await ensureStatusProgression("ceremony-1");

    expect(update.update).toHaveBeenCalledWith({ status: "preparing" });
  });

  it("does not advance planning when a field is still missing", async () => {
    queueChain("ceremonies", {
      data: {
        status: "planning",
        ceremony_script: "Script",
        vows: null,
        date: "2027-06-01",
        location: "Paris",
        start_time: "15:00",
      },
      error: null,
    });

    await ensureStatusProgression("ceremony-1");

    expect(from).toHaveBeenCalledTimes(1);
  });

  it("advances preparing to ready once essential readiness items are complete", async () => {
    queueChain("ceremonies", {
      data: {
        status: "preparing",
        ceremony_script: "Script",
        vows: "Vows",
        date: "2027-06-01",
        location: "Paris",
        start_time: "15:00",
      },
      error: null,
    });
    queueChain("vendor_shortlist", { data: [], error: null });
    const update = chainResolving({ data: null, error: null });
    queue("ceremonies", update);

    await ensureStatusProgression("ceremony-1");

    expect(update.update).toHaveBeenCalledWith({ status: "ready" });
  });

  it("is a no-op once status is past preparing", async () => {
    queueChain("ceremonies", {
      data: {
        status: "ready",
        ceremony_script: "Script",
        vows: "Vows",
        date: "2027-06-01",
        location: "Paris",
        start_time: "15:00",
      },
      error: null,
    });

    await ensureStatusProgression("ceremony-1");

    expect(from).toHaveBeenCalledTimes(1);
  });
});

describe("advanceStatus", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-06-01T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects an unknown action", async () => {
    const result = await advanceStatus("ceremony-1", "not_a_real_action" as never);
    expect(result).toEqual({ ok: false, reason: "Unknown action" });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects when the ceremony isn't found", async () => {
    queueChain("ceremonies", { data: null, error: null });

    const result = await advanceStatus("ceremony-1", "begin_ceremony");
    expect(result).toEqual({ ok: false, reason: "Ceremony not found" });
  });

  it("rejects a transition whose current status doesn't match", async () => {
    queueChain("ceremonies", { data: { status: "preparing", date: "2027-06-01" }, error: null });

    const result = await advanceStatus("ceremony-1", "begin_ceremony");
    expect(result.ok).toBe(false);
  });

  it("rejects starting the wedding day before the ceremony date", async () => {
    queueChain("ceremonies", { data: { status: "ready", date: "2027-06-02" }, error: null });

    const result = await advanceStatus("ceremony-1", "start_wedding_day");
    expect(result).toEqual({
      ok: false,
      reason: "Wedding Day can only start on the ceremony date",
    });
  });

  it("allows starting the wedding day on the ceremony date", async () => {
    queueChain("ceremonies", { data: { status: "ready", date: "2027-06-01" }, error: null });
    const update = chainResolving({ data: null, error: null });
    queue("ceremonies", update);

    const result = await advanceStatus("ceremony-1", "start_wedding_day");
    expect(result).toEqual({ ok: true });
    expect(update.update).toHaveBeenCalledWith({ status: "wedding_day" });
  });

  it("allows begin_ceremony and finish_ceremony regardless of date", async () => {
    queueChain("ceremonies", { data: { status: "wedding_day", date: "2027-06-01" }, error: null });
    const update = chainResolving({ data: null, error: null });
    queue("ceremonies", update);

    const result = await advanceStatus("ceremony-1", "begin_ceremony");
    expect(result).toEqual({ ok: true });
    expect(update.update).toHaveBeenCalledWith({ status: "ceremony_active" });
  });
});
