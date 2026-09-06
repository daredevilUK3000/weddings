import { describe, it, expect } from "vitest";
import { getDirectorMessage } from "../messages";

describe("getDirectorMessage", () => {
  it("returns fixed copy for each milestone", () => {
    expect(getDirectorMessage("wedding_day_started")).toMatch(/experience it/);
    expect(getDirectorMessage("ceremony_started")).toMatch(/It's time/);
    expect(getDirectorMessage("ceremony_completed")).toMatch(/You did it/);
  });

  it("is deterministic — not AI-generated, same input always gives the same output", () => {
    expect(getDirectorMessage("wedding_day_started")).toBe(
      getDirectorMessage("wedding_day_started"),
    );
  });
});
