import { describe, it, expect } from "vitest";
import { ceremonyStartDate, formatRelativeTime } from "../datetime";

describe("ceremonyStartDate", () => {
  it("returns null when there's no date", () => {
    expect(ceremonyStartDate(null, "15:00")).toBeNull();
  });

  it("defaults to midnight when there's no start time", () => {
    // Deliberately local-time, not UTC: the app stores no ceremony timezone,
    // so a bare "YYYY-MM-DDTHH:MM:SS" is parsed as wall-clock time in
    // whatever environment runs this code — the same environment that
    // later compares it against `new Date()`, so the two stay consistent.
    const d = ceremonyStartDate("2027-06-01", null);
    expect(d).not.toBeNull();
    expect(d!.getHours()).toBe(0);
    expect(d!.getMinutes()).toBe(0);
  });

  it("combines date and time", () => {
    const d = ceremonyStartDate("2027-06-01", "15:30:00");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2027);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(1);
    expect(d!.getHours()).toBe(15);
    expect(d!.getMinutes()).toBe(30);
  });

  it("returns null for an unparseable combination", () => {
    expect(ceremonyStartDate("not-a-date", "15:00")).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2027-06-01T15:00:00.000Z");

  it("describes a future time in minutes", () => {
    const target = new Date("2027-06-01T15:12:00.000Z");
    expect(formatRelativeTime(target, now)).toBe("in 12 minutes");
  });

  it("describes a past time in minutes", () => {
    const target = new Date("2027-06-01T14:55:00.000Z");
    expect(formatRelativeTime(target, now)).toBe("5 minutes ago");
  });

  it("describes a future time in hours once past 60 minutes", () => {
    const target = new Date("2027-06-01T18:00:00.000Z");
    expect(formatRelativeTime(target, now)).toBe("in 3 hours");
  });

  it("describes a future time in days once past 24 hours", () => {
    const target = new Date("2027-06-09T15:00:00.000Z");
    expect(formatRelativeTime(target, now)).toBe("in 8 days");
  });

  it("treats sub-30-second differences as starting now / just started", () => {
    // Math.round(30_000 / 60_000) rounds up to 1 minute, so the "under a
    // minute" branch is only reachable below the 30s half-minute mark.
    expect(formatRelativeTime(new Date("2027-06-01T15:00:10.000Z"), now)).toBe("starting now");
    expect(formatRelativeTime(new Date("2027-06-01T14:59:50.000Z"), now)).toBe("just started");
  });

  it("uses singular units for exactly one", () => {
    expect(formatRelativeTime(new Date("2027-06-01T15:01:00.000Z"), now)).toBe("in 1 minute");
    expect(formatRelativeTime(new Date("2027-06-01T16:00:00.000Z"), now)).toBe("in 1 hour");
  });
});
