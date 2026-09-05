import { describe, it, expect } from "vitest";
import { computeReadiness } from "../readiness";

const completeCeremony = {
  ceremony_script: "Script",
  vows: "Vows",
  date: "2027-06-01",
  location: "Paris",
  start_time: "15:00",
};

describe("computeReadiness", () => {
  it("marks essentials incomplete when any essential field is missing", () => {
    const result = computeReadiness(
      { ...completeCeremony, vows: null },
      [],
    );
    expect(result.essentialComplete).toBe(false);
    expect(result.items.find((i) => i.key === "vows")?.done).toBe(false);
  });

  it("is essentialComplete once script, vows, date+time, and location are all set, regardless of vendors", () => {
    const result = computeReadiness(completeCeremony, []);
    expect(result.essentialComplete).toBe(true);
    expect(result.score).toBe(100);
  });

  it("treats date without start_time as an incomplete essential", () => {
    const result = computeReadiness({ ...completeCeremony, start_time: null }, []);
    expect(result.essentialComplete).toBe(false);
  });

  it("adds a non-essential vendor item only when vendors exist, and never lets it block essentialComplete", () => {
    const result = computeReadiness(completeCeremony, [
      { booking_status: "not_contacted" },
      { booking_status: "confirmed" },
    ]);
    const vendorItem = result.items.find((i) => i.key === "vendors");
    expect(vendorItem).toBeDefined();
    expect(vendorItem?.essential).toBe(false);
    expect(vendorItem?.done).toBe(false);
    expect(vendorItem?.label).toBe("1 of 2 vendors confirmed");
    expect(result.essentialComplete).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it("never includes any witness-related item", () => {
    const result = computeReadiness(completeCeremony, []);
    expect(result.items.some((i) => i.key.includes("witness"))).toBe(false);
  });
});
