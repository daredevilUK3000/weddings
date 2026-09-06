import { describe, it, expect } from "vitest";
import { computeNowNextLater } from "../timeline";

const moment = (
  id: string,
  moment_name: string,
  order_index: number,
  event_status: "upcoming" | "ready" | "active" | "delayed" | "completed" | "skipped",
  time: string | null = null,
) => ({ id, moment_name, order_index, event_status, time });

describe("computeNowNextLater", () => {
  it("puts the active moment in now and the first upcoming moment in next", () => {
    const timeline = [
      moment("1", "Processional", 0, "completed"),
      moment("2", "Opening words", 1, "active"),
      moment("3", "Self-vows", 2, "upcoming", "15:11"),
      moment("4", "Ring exchange", 3, "upcoming", "15:16"),
    ];

    const result = computeNowNextLater(timeline, []);

    expect(result.activeMoment).toEqual({ id: "2", label: "Opening words", time: null });
    expect(result.next).toEqual({ id: "3", label: "Self-vows", time: "15:11" });
    expect(result.later).toEqual([{ id: "4", label: "Ring exchange", time: "15:16" }]);
  });

  it("has no active moment before the ceremony has started — everything upcoming buckets into next/later", () => {
    const timeline = [
      moment("1", "Processional", 0, "upcoming"),
      moment("2", "Opening words", 1, "upcoming"),
    ];

    const result = computeNowNextLater(timeline, []);

    expect(result.activeMoment).toBeNull();
    expect(result.next).toEqual({ id: "1", label: "Processional", time: null });
    expect(result.later).toEqual([{ id: "2", label: "Opening words", time: null }]);
  });

  it("sorts by order_index regardless of input order", () => {
    const timeline = [
      moment("2", "Second", 1, "upcoming"),
      moment("1", "First", 0, "upcoming"),
    ];

    const result = computeNowNextLater(timeline, []);
    expect(result.next?.label).toBe("First");
  });

  it("ignores completed and skipped moments entirely", () => {
    const timeline = [
      moment("1", "Done", 0, "completed"),
      moment("2", "Skipped", 1, "skipped"),
      moment("3", "Up next", 2, "upcoming"),
    ];

    const result = computeNowNextLater(timeline, []);
    expect(result.next).toEqual({ id: "3", label: "Up next", time: null });
    expect(result.later).toEqual([]);
  });

  it("surfaces arrived vendors as informational now items, independent of the ceremony sequence", () => {
    const timeline = [moment("1", "Processional", 0, "upcoming")];
    const vendors = [
      { id: "v1", name: "Photographer", booking_status: "arrived" as const },
      { id: "v2", name: "Caterer", booking_status: "confirmed" as const },
    ];

    const result = computeNowNextLater(timeline, vendors);

    expect(result.arrivedVendors).toEqual([{ id: "v1", label: "Photographer", time: null }]);
  });
});
