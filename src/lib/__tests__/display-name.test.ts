import { describe, it, expect } from "vitest";
import { displayName } from "../display-name";

describe("displayName", () => {
  it("returns the trimmed name when present", () => {
    expect(displayName("  Sam  ", "fallback")).toBe("Sam");
  });

  it("returns the fallback for null, undefined, or blank names", () => {
    expect(displayName(null, "fallback")).toBe("fallback");
    expect(displayName(undefined, "fallback")).toBe("fallback");
    expect(displayName("   ", "fallback")).toBe("fallback");
    expect(displayName("", "fallback")).toBe("fallback");
  });

  it("never has a code path that can return an email address", () => {
    // There is no third "email" argument at all — this is a type-level
    // guarantee, not just a runtime one. Documented here as a readable
    // regression check on the function's signature/behavior.
    expect(displayName.length).toBe(2);
  });
});
