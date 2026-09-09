import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));
vi.mock("ai", () => ({
  generateText,
  Output: { object: (cfg: unknown) => cfg },
}));

import { generateCeremonyContent } from "../ceremony-content";

const CTX = {
  vibe: "minimalist" as const,
  reason: "a fresh start",
  guestCount: 0,
  location: null,
  clientName: null,
};

const CLEAN_OUTPUT = {
  ceremony_script: [
    { type: "heading", text: "Opening" },
    { type: "officiant", text: "Welcome. You are here to promise something to yourself." },
    { type: "self", text: "I promise to keep choosing myself." },
  ],
  vow_drafts: ["vow one", "vow two", "vow three"],
  witness_reading: null,
};

describe("generateCeremonyContent", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("returns the first attempt as-is when nothing is gendered", async () => {
    generateText.mockResolvedValueOnce({ output: CLEAN_OUTPUT });

    const result = await generateCeremonyContent(CTX, "transcript");

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(result.ceremony_script).toContain("Welcome. You are here");
    expect(result.vow_drafts).toEqual(["vow one", "vow two", "vow three"]);
  });

  it("regenerates once when a gendered pronoun slips into any part of the output", async () => {
    const genderedOutput = {
      ...CLEAN_OUTPUT,
      ceremony_script: [
        { type: "officiant", text: "Let her walk forward to meet herself." },
      ],
    };

    generateText
      .mockResolvedValueOnce({ output: genderedOutput })
      .mockResolvedValueOnce({ output: CLEAN_OUTPUT });

    const result = await generateCeremonyContent(CTX, "transcript");

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(result.ceremony_script).not.toMatch(/\b(he|him|his|she|her|hers)\b/i);

    const retryPrompt = generateText.mock.calls[1][0].prompt as string;
    expect(retryPrompt).toContain("gendered pronoun");
    expect(retryPrompt.toLowerCase()).toContain("her");
  });

  it("checks vow_drafts and witness_reading for gendered pronouns too, not just the script", async () => {
    const genderedVows = {
      ...CLEAN_OUTPUT,
      vow_drafts: ["I promise to be true to him.", "vow two", "vow three"],
    };

    generateText
      .mockResolvedValueOnce({ output: genderedVows })
      .mockResolvedValueOnce({ output: CLEAN_OUTPUT });

    await generateCeremonyContent(CTX, "transcript");

    expect(generateText).toHaveBeenCalledTimes(2);
  });
});
