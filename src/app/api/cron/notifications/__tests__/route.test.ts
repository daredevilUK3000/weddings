import { describe, it, expect, vi, beforeEach } from "vitest";

function chainResolving(result: unknown) {
  const proxy: Record<string, unknown> = {
    select: vi.fn(() => proxy),
    eq: vi.fn(() => proxy),
    in: vi.fn(() => proxy),
    not: vi.fn(() => proxy),
    lte: vi.fn(() => proxy),
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

const { sendDirectorEmail, sendWitnessEmail } = vi.hoisted(() => ({
  sendDirectorEmail: vi.fn(),
  sendWitnessEmail: vi.fn(),
}));
vi.mock("@/lib/notifications/send", () => ({ sendDirectorEmail, sendWitnessEmail }));

import { GET } from "../route";

function req() {
  return new Request("https://weddingsforone.example/api/cron/notifications", {
    headers: { authorization: "Bearer test-secret" },
  });
}

describe("GET /api/cron/notifications", () => {
  beforeEach(() => {
    from.mockClear();
    resetQueues();
    sendDirectorEmail.mockReset();
    sendWitnessEmail.mockReset();
    process.env.CRON_SECRET = "test-secret";
  });

  it("rejects a request with the wrong secret", async () => {
    const res = await GET(
      new Request("https://weddingsforone.example/api/cron/notifications", {
        headers: { authorization: "Bearer wrong" },
      }),
    );
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects when CRON_SECRET isn't configured", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req());
    expect(res.status).toBe(401);
  });

  it("scans candidate ceremonies and reports zero sent when nothing is due", async () => {
    queue(chainResolving({ data: [], error: null }));

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ceremoniesScanned: 0, attempted: 0, sent: 0 });
  });

  it("sends a director email for a ceremony 20 minutes out and logs it as sent", async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 20 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;

    queue(
      chainResolving({
        data: [{ id: "c1", date, start_time: startTime, status: "ready", user_id: "user-1" }],
        error: null,
      }),
    );
    queue(chainResolving({ data: [], error: null })); // witnesses for c1
    queue(
      chainResolving({ data: { name: "Amelia", email: "amelia@example.com" }, error: null }),
    ); // profile

    sendDirectorEmail.mockResolvedValue({ sent: true });

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ceremoniesScanned).toBe(1);
    // director_7day, director_24hr, and director_30min are all due 20 minutes out.
    expect(sendDirectorEmail).toHaveBeenCalledTimes(3);
    expect(sendDirectorEmail).toHaveBeenCalledWith(
      expect.objectContaining({ ceremonyId: "c1", to: "amelia@example.com" }),
    );
    expect(body.sent).toBe(3);
  });

  it("sends a witness email using the witness's invite token for the portal link", async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours out
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;

    queue(
      chainResolving({
        data: [{ id: "c1", date, start_time: startTime, status: "ready", user_id: "user-1" }],
        error: null,
      }),
    );
    queue(
      chainResolving({
        data: [
          {
            id: "w1",
            name: "Maya",
            email: "maya@example.com",
            invite_token: "tok_abc",
            rsvp_status: "accepted",
          },
        ],
        error: null,
      }),
    ); // witnesses for c1
    queue(chainResolving({ data: { name: "Amelia", email: "amelia@example.com" }, error: null }));

    sendDirectorEmail.mockResolvedValue({ sent: true });
    sendWitnessEmail.mockResolvedValue({ sent: true });

    const res = await GET(req());
    await res.json();

    expect(sendWitnessEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        ceremonyId: "c1",
        witnessId: "w1",
        to: "maya@example.com",
        type: "witness_day_of",
      }),
    );
  });
});
