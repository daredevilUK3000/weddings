import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUser, selectSingle, updateResult, makeSupabaseChain } = vi.hoisted(() => {
  const getUser = vi.fn();
  const selectSingle = vi.fn();
  const updateResult = vi.fn();

  function makeSupabaseChain() {
    const selectEq2 = vi.fn(() => ({ single: selectSingle }));
    const selectEq1 = vi.fn(() => ({ eq: selectEq2 }));
    const select = vi.fn(() => ({ eq: selectEq1 }));

    const updateEq2 = vi.fn(() => updateResult());
    const updateEq1 = vi.fn(() => ({ eq: updateEq2 }));
    const update = vi.fn((_values: Record<string, unknown>) => ({ eq: updateEq1 }));

    const from = vi.fn((_table: string) => ({ select, update }));
    return { from, select, update, selectEq1, selectEq2, updateEq1, updateEq2 };
  }

  return { getUser, selectSingle, updateResult, makeSupabaseChain };
});

let chain = makeSupabaseChain();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from: (table: string) => chain.from(table),
  })),
}));

const { generateCeremonyContent } = vi.hoisted(() => ({
  generateCeremonyContent: vi.fn(),
}));

vi.mock("@/lib/ai/ceremony-content", () => ({
  generateCeremonyContent,
}));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/ai/ceremony-content", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/ceremony-content", () => {
  beforeEach(() => {
    chain = makeSupabaseChain();
    getUser.mockReset();
    selectSingle.mockReset();
    updateResult.mockReset();
    generateCeremonyContent.mockReset();
  });

  it("returns 401 when there is no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ ceremonyId: "c1", interviewTranscript: "" }));

    expect(res.status).toBe(401);
    expect(generateCeremonyContent).not.toHaveBeenCalled();
  });

  it("returns 404 when the ceremony doesn't exist or isn't owned by the user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    selectSingle.mockResolvedValue({ data: null });

    const res = await POST(makeRequest({ ceremonyId: "missing", interviewTranscript: "" }));

    expect(res.status).toBe(404);
    expect(generateCeremonyContent).not.toHaveBeenCalled();
  });

  it("generates content from the mocked AI call and saves it to the ceremony", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    selectSingle.mockResolvedValue({
      data: { vibe: "funny", reason: "just because", guest_count: 5, location: "Bristol" },
    });
    generateCeremonyContent.mockResolvedValue({
      ceremony_script: "SCRIPT",
      vow_drafts: ["vow one", "vow two", "vow three"],
      witness_reading: "READING",
    });
    updateResult.mockResolvedValue({ error: null });

    const res = await POST(
      makeRequest({ ceremonyId: "c1", interviewTranscript: "Client: hi\nOfficiant: hello" }),
    );

    expect(generateCeremonyContent).toHaveBeenCalledWith(
      { vibe: "funny", reason: "just because", guestCount: 5, location: "Bristol" },
      "Client: hi\nOfficiant: hello",
    );
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        ceremony_script: "SCRIPT",
        vows: "vow one\n\n---\n\nvow two\n\n---\n\nvow three",
        witness_reading: "READING",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ceremony_script).toBe("SCRIPT");
  });

  it("returns 500 when saving the generated content fails", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    selectSingle.mockResolvedValue({
      data: { vibe: "funny", reason: null, guest_count: 0, location: null },
    });
    generateCeremonyContent.mockResolvedValue({
      ceremony_script: "SCRIPT",
      vow_drafts: ["a", "b", "c"],
      witness_reading: null,
    });
    updateResult.mockResolvedValue({ error: { message: "db write failed" } });

    const res = await POST(makeRequest({ ceremonyId: "c1", interviewTranscript: "" }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("db write failed");
  });
});
