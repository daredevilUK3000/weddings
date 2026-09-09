import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));
vi.mock("ai", () => ({ generateText }));

import { generateOfficiantAcknowledgment } from "../officiant-acknowledge";

describe("generateOfficiantAcknowledgment", () => {
  beforeEach(() => {
    generateText.mockReset();
  });

  it("returns the first attempt as-is when it has no gendered pronoun", async () => {
    generateText.mockResolvedValueOnce({ text: "That sounds like real relief." });

    const result = await generateOfficiantAcknowledgment({
      vibe: "minimalist",
      question: "q",
      answer: "a",
    });

    expect(result).toBe("That sounds like real relief.");
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("retries once with a corrective prompt when the first attempt uses a gendered pronoun", async () => {
    generateText
      .mockResolvedValueOnce({ text: "That took a lot for her to say." })
      .mockResolvedValueOnce({ text: "That took a lot for you to say." });

    const result = await generateOfficiantAcknowledgment({
      vibe: "minimalist",
      question: "q",
      answer: "a",
    });

    expect(result).toBe("That took a lot for you to say.");
    expect(generateText).toHaveBeenCalledTimes(2);
    const retryPrompt = generateText.mock.calls[1][0].prompt as string;
    expect(retryPrompt).toContain("gendered pronoun");
    expect(retryPrompt).toContain("her to say");
  });
});
