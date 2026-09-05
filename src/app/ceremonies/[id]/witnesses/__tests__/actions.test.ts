import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    order: vi.fn(() => proxy),
    in: vi.fn(() => proxy),
    insert: vi.fn(() => proxy),
    update: vi.fn(() => proxy),
    delete: vi.fn(() => proxy),
    is: vi.fn(() => proxy),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return proxy;
}

const { getUser, from, queue, resetQueues } = vi.hoisted(() => {
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
    if (!q || q.length === 0) {
      throw new Error(`No mock queued for table "${table}"`);
    }
    return q.shift();
  });
  return { getUser: vi.fn(), from, queue, resetQueues };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}));

const { RedirectSignal } = vi.hoisted(() => {
  class RedirectSignal extends Error {
    url: string;
    constructor(url: string) {
      super("NEXT_REDIRECT");
      this.url = url;
    }
  }
  return { RedirectSignal };
});

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { sendWitnessEmail } = vi.hoisted(() => ({ sendWitnessEmail: vi.fn() }));
vi.mock("@/lib/notifications/send", () => ({ sendWitnessEmail }));

vi.mock("@/lib/base-url", () => ({
  getBaseUrl: vi.fn(async () => "https://weddingsforone.example"),
}));

import { inviteWitness, removeWitness } from "../actions";
import { redirect } from "next/navigation";

function queueChain(table: string, result: unknown) {
  queue(table, chainResolving(result));
}

describe("inviteWitness", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockClear();
    resetQueues();
    sendWitnessEmail.mockReset();
    vi.mocked(redirect).mockClear();
  });

  it("redirects to /login when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    await expect(inviteWitness("ceremony-1", new FormData())).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("throws when the ceremony can't be found for this user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queueChain("ceremonies", { data: null, error: null });

    await expect(inviteWitness("ceremony-1", new FormData())).rejects.toThrow(
      "Ceremony not found",
    );
  });

  it("refuses to add a 13th witness", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queueChain("ceremonies", {
      data: { id: "ceremony-1", vibe: "minimalist", date: null, start_time: null, location: null },
      error: null,
    });
    queueChain("witnesses", { count: 12, data: null, error: null });

    await expect(inviteWitness("ceremony-1", new FormData())).rejects.toThrow(
      "Witness Circle is full",
    );
    expect(sendWitnessEmail).not.toHaveBeenCalled();
  });

  it("inserts the witness, sends the invitation, and marks invited_at once sent", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queueChain("ceremonies", {
      data: {
        id: "ceremony-1",
        vibe: "glam",
        date: "2027-06-01",
        start_time: "15:00",
        location: "Paris",
      },
      error: null,
    });
    queueChain("witnesses", { count: 2, data: null, error: null }); // cap check
    const insertedWitness = chainResolving({
      data: { id: "witness-1", invite_token: "tok_abc" },
      error: null,
    });
    queue("witnesses", insertedWitness); // insert().select().single()
    queueChain("profiles", { data: { name: "Amelia", email: "amelia@example.com" }, error: null });
    sendWitnessEmail.mockResolvedValue({ sent: true });
    const updateWitness = chainResolving({ data: null, error: null });
    queue("witnesses", updateWitness); // invited_at update

    const fd = new FormData();
    fd.set("name", "Maya Chen");
    fd.set("email", "maya@example.com");
    fd.set("attendance_type", "in_person");
    fd.set("can_sign_certificate", "on");

    await inviteWitness("ceremony-1", fd);

    expect(sendWitnessEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        ceremonyId: "ceremony-1",
        witnessId: "witness-1",
        to: "maya@example.com",
        type: "witness_invitation",
      }),
    );
    expect(updateWitness.update).toHaveBeenCalledWith(
      expect.objectContaining({ invited_at: expect.any(String) }),
    );
  });

  it("does not mark invited_at when the send is budget-capped", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    queueChain("ceremonies", {
      data: { id: "ceremony-1", vibe: "glam", date: null, start_time: null, location: null },
      error: null,
    });
    queueChain("witnesses", { count: 0, data: null, error: null });
    queueChain("witnesses", { data: { id: "witness-1", invite_token: "tok_abc" }, error: null });
    queueChain("profiles", { data: { name: "Amelia", email: "amelia@example.com" }, error: null });
    sendWitnessEmail.mockResolvedValue({ sent: false, reason: "budget_exceeded" });

    const fd = new FormData();
    fd.set("name", "Maya Chen");
    fd.set("email", "maya@example.com");
    fd.set("attendance_type", "in_person");

    await inviteWitness("ceremony-1", fd);

    // No further "witnesses" table call should have happened for the invited_at update.
    expect(from).not.toHaveBeenCalledWith("notifications");
  });
});

describe("removeWitness", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
  });

  it("deletes the witness scoped to both witness id and ceremony id", async () => {
    const deleteChain = chainResolving({ data: null, error: null });
    queue("witnesses", deleteChain);

    await removeWitness("ceremony-1", "witness-1");

    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith("id", "witness-1");
    expect(deleteChain.eq).toHaveBeenCalledWith("ceremony_id", "ceremony-1");
  });
});
