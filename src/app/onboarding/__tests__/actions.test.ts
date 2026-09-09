import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUser, single, select, insert, updateEq, update, from } = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const updateEq = vi.fn(async () => ({ error: null }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn((table: string) => (table === "profiles" ? { update } : { insert }));
  return { getUser: vi.fn(), single, select, insert, updateEq, update, from };
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

import { createCeremony } from "../actions";
import { redirect } from "next/navigation";

function formDataFrom(fields: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

describe("createCeremony", () => {
  beforeEach(() => {
    getUser.mockReset();
    single.mockReset();
    select.mockClear();
    insert.mockClear();
    update.mockClear();
    updateEq.mockClear();
    from.mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("redirects to /login and never touches the database when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    await expect(createCeremony(formDataFrom({ vibe: "spiritual" }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(from).not.toHaveBeenCalled();
  });

  it("inserts the ceremony with the submitted fields and redirects to the officiant chat", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: { id: "ceremony-1" }, error: null });

    await expect(
      createCeremony(
        formDataFrom({
          vibe: "glam",
          reason: "A milestone",
          date: "2027-06-01",
          location: "London",
          guest_count: "12",
          budget_band: "$3,000–$7,000",
          priority: ["venue", "photography"],
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(from).toHaveBeenCalledWith("ceremonies");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        vibe: "glam",
        reason: "A milestone",
        date: "2027-06-01",
        location: "London",
        guest_count: 12,
        budget_band: "$3,000–$7,000",
        priority_ranking: ["venue", "photography"],
      }),
    );
    expect(redirect).toHaveBeenCalledWith("/ceremonies/ceremony-1/officiant");
  });

  it("defaults optional fields to null and guest_count to 0 when omitted", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: { id: "ceremony-2" }, error: null });

    await expect(
      createCeremony(formDataFrom({ vibe: "minimalist" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        date: null,
        location: null,
        budget_band: null,
        guest_count: 0,
        priority_ranking: [],
      }),
    );
  });

  it("persists a submitted name to profiles.name before creating the ceremony", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: { id: "ceremony-1" }, error: null });

    await expect(
      createCeremony(formDataFrom({ vibe: "spiritual", name: "  Sam  " })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({ name: "Sam" });
    expect(updateEq).toHaveBeenCalledWith("id", "user-1");
  });

  it("does not touch profiles when no name is submitted (already set, or skipped)", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: { id: "ceremony-1" }, error: null });

    await expect(createCeremony(formDataFrom({ vibe: "spiritual" }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(update).not.toHaveBeenCalled();
  });

  it("throws instead of redirecting when the insert fails", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    single.mockResolvedValue({ data: null, error: { message: "insert failed" } });

    await expect(createCeremony(formDataFrom({ vibe: "funny" }))).rejects.toThrow(
      "insert failed",
    );

    expect(redirect).not.toHaveBeenCalled();
  });
});
