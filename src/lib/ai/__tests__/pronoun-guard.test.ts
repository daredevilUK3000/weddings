import { describe, it, expect } from "vitest";
import { containsGenderedPronoun, findGenderedPronouns } from "../pronoun-guard";

describe("containsGenderedPronoun", () => {
  it("flags each gendered pronoun", () => {
    for (const word of ["he", "him", "his", "she", "her", "hers", "himself", "herself"]) {
      expect(containsGenderedPronoun(`Let ${word} walk forward.`)).toBe(true);
    }
  });

  it("is case-insensitive and catches contractions", () => {
    expect(containsGenderedPronoun("She's ready.")).toBe(true);
    expect(containsGenderedPronoun("HE was ready.")).toBe(true);
  });

  it("does not flag singular they/them/their", () => {
    expect(containsGenderedPronoun("Let them walk forward, as they chose for themself.")).toBe(
      false,
    );
    expect(containsGenderedPronoun("Their promise, spoken aloud.")).toBe(false);
  });

  it("does not false-positive on words that merely contain a pronoun as a substring", () => {
    expect(containsGenderedPronoun("This marks a moment in history, here and now.")).toBe(false);
    expect(containsGenderedPronoun("Cherish this. The shell on the shelf.")).toBe(false);
  });

  it("does not flag plain second-person or name-based address", () => {
    expect(containsGenderedPronoun("You promise yourself this: Sam will keep going.")).toBe(
      false,
    );
  });
});

describe("findGenderedPronouns", () => {
  it("returns the distinct offending words, lowercased", () => {
    expect(findGenderedPronouns("She told her own story. He listened.")).toEqual([
      "she",
      "her",
      "he",
    ]);
  });

  it("returns an empty array when nothing is flagged", () => {
    expect(findGenderedPronouns("They kept their promise to themself.")).toEqual([]);
  });
});
