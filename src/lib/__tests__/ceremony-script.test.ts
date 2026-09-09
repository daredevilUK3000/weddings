import { describe, it, expect } from "vitest";
import { serializeCeremonyScript, parseCeremonyScript } from "../ceremony-script";

describe("serializeCeremonyScript", () => {
  it("formats each segment type distinctly", () => {
    const text = serializeCeremonyScript([
      { type: "heading", text: "Processional" },
      { type: "direction", text: "soft instrumental music plays" },
      { type: "officiant", text: "Let her walk not to meet another, but to meet herself." },
      { type: "self", text: "I promise myself." },
    ]);

    expect(text).toBe(
      "PROCESSIONAL\n\n" +
        "(soft instrumental music plays)\n\n" +
        "OFFICIANT:\nLet her walk not to meet another, but to meet herself.\n\n" +
        "YOU:\nI promise myself.",
    );
  });

  it("doesn't double-wrap direction text that's already parenthesized", () => {
    const text = serializeCeremonyScript([{ type: "direction", text: "(already wrapped)" }]);
    expect(text).toBe("(already wrapped)");
  });
});

describe("parseCeremonyScript", () => {
  it("round-trips every segment type back to its original text", () => {
    const serialized = serializeCeremonyScript([
      { type: "heading", text: "Vows" },
      { type: "direction", text: "The client turns to face themselves in the mirror." },
      { type: "officiant", text: "Speak your promise." },
      { type: "self", text: "I choose myself, fully, today." },
    ]);

    const blocks = parseCeremonyScript(serialized);

    expect(blocks).toEqual([
      { type: "heading", text: "VOWS" },
      { type: "direction", text: "The client turns to face themselves in the mirror." },
      { type: "officiant", text: "Speak your promise." },
      { type: "self", text: "I choose myself, fully, today." },
    ]);
  });

  it("is case-insensitive on the OFFICIANT/YOU label", () => {
    expect(parseCeremonyScript("officiant:\nWelcome.")).toEqual([
      { type: "officiant", text: "Welcome." },
    ]);
    expect(parseCeremonyScript("you:\nI do this for myself.")).toEqual([
      { type: "self", text: "I do this for myself." },
    ]);
  });

  it("falls back to a plain block for unlabeled prose (older/pre-format scripts)", () => {
    const blocks = parseCeremonyScript("Just some unlabeled paragraph of ceremony text.");
    expect(blocks).toEqual([
      { type: "plain", text: "Just some unlabeled paragraph of ceremony text." },
    ]);
  });

  it("does not mistake a short spoken line for a heading", () => {
    // Not all-caps and ends in punctuation, so it must not be classified
    // as a heading even though it's short.
    const blocks = parseCeremonyScript("I do.");
    expect(blocks).toEqual([{ type: "plain", text: "I do." }]);
  });

  it("splits multiple blocks separated by blank lines", () => {
    const blocks = parseCeremonyScript(
      "OPENING\n\n(the room falls quiet)\n\nOFFICIANT:\nWe gather here today.",
    );
    expect(blocks).toEqual([
      { type: "heading", text: "OPENING" },
      { type: "direction", text: "the room falls quiet" },
      { type: "officiant", text: "We gather here today." },
    ]);
  });
});
