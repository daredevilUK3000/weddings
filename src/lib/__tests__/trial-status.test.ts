import { describe, it, expect, vi, afterEach } from "vitest";
import { daysLeftInTrial } from "../trial-status";

describe("daysLeftInTrial", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when unlocked, regardless of trial_ends_at", () => {
    expect(daysLeftInTrial("2099-01-01T00:00:00Z", "2026-01-01T00:00:00Z")).toBeNull();
  });

  it("returns null when trial_ends_at is missing", () => {
    expect(daysLeftInTrial(null, null)).toBeNull();
    expect(daysLeftInTrial(undefined, null)).toBeNull();
  });

  it("returns null once the trial has already expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00Z"));
    expect(daysLeftInTrial("2026-01-10T11:59:59Z", null)).toBeNull();
    expect(daysLeftInTrial("2026-01-01T00:00:00Z", null)).toBeNull();
  });

  it("rounds up to whole days remaining", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    // Exactly 14 days away.
    expect(daysLeftInTrial("2026-01-15T00:00:00Z", null)).toBe(14);
    // Just over 1 day away rounds up to 2.
    expect(daysLeftInTrial("2026-01-02T00:00:01Z", null)).toBe(2);
    // Just under 1 day away rounds up to 1.
    expect(daysLeftInTrial("2026-01-01T23:59:59Z", null)).toBe(1);
    // A few minutes away still rounds up to 1, never 0.
    expect(daysLeftInTrial("2026-01-01T00:05:00Z", null)).toBe(1);
  });
});
