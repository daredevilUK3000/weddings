import { describe, it, expect } from "vitest";
import { computeSharedContent, describeWitnessSharing } from "../witness-sharing";

describe("computeSharedContent", () => {
  it("shares only the livestream link for an online witness", () => {
    const flags = computeSharedContent("online", false, false);
    expect(flags).toEqual({
      livestreamLink: true,
      ceremonyStory: false,
      programme: false,
      certificate: false,
      vows: false,
    });
  });

  it("shares only the ceremony story for a remote contributor", () => {
    const flags = computeSharedContent("remote_contribution", false, false);
    expect(flags.ceremonyStory).toBe(true);
    expect(flags.livestreamLink).toBe(false);
    expect(flags.programme).toBe(false);
    expect(flags.certificate).toBe(false);
  });

  it("shares programme and certificate for a witness attending afterward", () => {
    const flags = computeSharedContent("witnessing_afterward", false, false);
    expect(flags.programme).toBe(true);
    expect(flags.certificate).toBe(true);
    expect(flags.livestreamLink).toBe(false);
    expect(flags.ceremonyStory).toBe(false);
  });

  it("shares nothing beyond the baseline for an in-person witness", () => {
    const flags = computeSharedContent("in_person", false, false);
    expect(flags).toEqual({
      livestreamLink: false,
      ceremonyStory: false,
      programme: false,
      certificate: false,
      vows: false,
    });
  });

  it("shares the certificate whenever the witness can sign it, regardless of attendance type", () => {
    const flags = computeSharedContent("in_person", true, false);
    expect(flags.certificate).toBe(true);
  });

  it("shares vows only via the one manual override, independent of attendance type", () => {
    expect(computeSharedContent("in_person", false, true).vows).toBe(true);
    expect(computeSharedContent("witnessing_afterward", false, false).vows).toBe(false);
  });
});

describe("describeWitnessSharing", () => {
  it("describes the baseline with no extras", () => {
    const flags = computeSharedContent("in_person", false, false);
    expect(describeWitnessSharing("Maya", "in_person", flags)).toBe(
      "Maya is attending in person — they'll see your date, time, and location.",
    );
  });

  it("lists derived and overridden extras together", () => {
    const flags = computeSharedContent("online", false, true);
    expect(describeWitnessSharing("Daniel", "online", flags)).toBe(
      "Daniel is joining you live online — they'll see your date, time, and location, plus the livestream link, your vows.",
    );
  });
});
