import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    order: vi.fn(() => proxy),
    is: vi.fn(() => proxy),
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

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({ from })),
}));

import { getWitnessByToken, markWitnessOpened } from "../witness";

function queueChain(table: string, result: unknown) {
  const chain = chainResolving(result);
  queue(table, chain);
  return chain;
}

describe("getWitnessByToken", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("returns null when the token doesn't match a witness", async () => {
    queueChain("witnesses", { data: null, error: null });

    expect(await getWitnessByToken("bad-token")).toBeNull();
  });

  it("returns null when the witness's ceremony is missing", async () => {
    queueChain("witnesses", {
      data: {
        id: "witness-1",
        ceremony_id: "ceremony-1",
        name: "Maya Chen",
        relationship: null,
        attendance_type: "in_person",
        can_sign_certificate: true,
        rsvp_status: null,
        checked_in_at: null,
      },
      error: null,
    });
    queueChain("ceremonies", { data: null, error: null });

    expect(await getWitnessByToken("tok_abc")).toBeNull();
  });

  it("derives sharing from attendance type: an in-person witness gets no livestream/vows/story, but sees the certificate because they can sign it", async () => {
    queueChain("witnesses", {
      data: {
        id: "witness-1",
        ceremony_id: "ceremony-1",
        name: "Maya Chen",
        relationship: "Sister",
        attendance_type: "in_person",
        can_sign_certificate: true,
        share_vows: false,
        rsvp_status: "accepted",
        checked_in_at: null,
      },
      error: null,
    });
    queueChain("ceremonies", {
      data: {
        status: "wedding_day",
        vibe: "glam",
        date: "2027-06-01",
        start_time: "15:00",
        location: "Paris",
        livestream_url: "https://example.com/live",
        vows: "I promise...",
        reason: "A meaningful step",
      },
      error: null,
    });
    queueChain("witness_contributions", {
      data: { body: "So proud of you", include_in_ceremony: true },
      error: null,
    });
    queueChain("witness_signatures", {
      data: { signature_type: "typed", signed_at: "2027-06-01T15:30:00.000Z" },
      error: null,
    });

    const result = await getWitnessByToken("tok_abc");

    expect(result).not.toBeNull();
    expect(result!.ceremony.vows).toBeNull();
    expect(result!.ceremony.ceremonyStory).toBeNull();
    expect(result!.ceremony.livestreamUrl).toBeNull();
    expect(result!.ceremony.shareCertificate).toBe(true);
    expect(result!.witness.contribution).toEqual({
      body: "So proud of you",
      includeInCeremony: true,
    });
    expect(result!.witness.signature).toEqual({
      signatureType: "typed",
      signedAt: "2027-06-01T15:30:00.000Z",
    });
  });

  it("surfaces the livestream link for an online witness, and vows only when the one manual override is set", async () => {
    queueChain("witnesses", {
      data: {
        id: "witness-2",
        ceremony_id: "ceremony-1",
        name: "Daniel Price",
        relationship: null,
        attendance_type: "online",
        can_sign_certificate: false,
        share_vows: true,
        rsvp_status: null,
        checked_in_at: null,
      },
      error: null,
    });
    queueChain("ceremonies", {
      data: {
        status: "planning",
        vibe: "glam",
        date: "2027-06-01",
        start_time: "15:00",
        location: "Paris",
        livestream_url: "https://example.com/live",
        vows: "I promise...",
        reason: "A meaningful step",
      },
      error: null,
    });
    queueChain("witness_contributions", { data: null, error: null });
    queueChain("witness_signatures", { data: null, error: null });

    const result = await getWitnessByToken("tok_def");

    expect(result!.ceremony.livestreamUrl).toBe("https://example.com/live");
    expect(result!.ceremony.vows).toBe("I promise...");
    expect(result!.ceremony.ceremonyStory).toBeNull();
    expect(result!.ceremony.shareCertificate).toBe(false);
  });
});

describe("markWitnessOpened", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("only sets opened_at when it isn't already set", async () => {
    const chain = queueChain("witnesses", { data: null, error: null });

    await markWitnessOpened("witness-1");

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ opened_at: expect.any(String) }),
    );
    expect(chain.is).toHaveBeenCalledWith("opened_at", null);
  });
});
