import { describe, it, expect } from "vitest";
import { computeDueNotifications } from "../schedule";

const HOUR = 60 * 60 * 1000;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Round-trips through local time components (not toISOString/UTC), because
// computeDueNotifications parses "date"+"start_time" as local wall-clock
// time (no ceremony timezone is stored) — the same rule format-ceremony's
// tests follow. Using a fixed `now` keeps every test deterministic.
function ceremonyAt(hoursFromNow: number, status = "ready") {
  const now = new Date("2027-06-01T15:00:00");
  const start = new Date(now.getTime() + hoursFromNow * HOUR);
  const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const start_time = `${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;
  return {
    ceremony: { id: "c1", date, start_time, status: status as never },
    now,
  };
}

describe("computeDueNotifications", () => {
  it("returns nothing for a ceremony with no date set", () => {
    const result = computeDueNotifications(
      { id: "c1", date: null, start_time: null, status: "planning" },
      [],
      new Date(),
    );
    expect(result).toEqual([]);
  });

  it("returns nothing once the ceremony is active or completed", () => {
    const { ceremony, now } = ceremonyAt(0.4); // 24 minutes out — would otherwise fire director_30min
    expect(computeDueNotifications({ ...ceremony, status: "ceremony_active" }, [], now)).toEqual(
      [],
    );
    expect(computeDueNotifications({ ...ceremony, status: "completed" }, [], now)).toEqual([]);
  });

  it("returns nothing outside the 8-day sweep window", () => {
    const { ceremony, now } = ceremonyAt(9 * 24); // 9 days out
    expect(computeDueNotifications(ceremony, [], now)).toEqual([]);
  });

  it("fires director_7day once within 7 days, not before", () => {
    const justOutside = ceremonyAt(7 * 24 + 1);
    expect(
      computeDueNotifications(justOutside.ceremony, [], justOutside.now).some(
        (d) => d.notificationType === "director_7day",
      ),
    ).toBe(false);

    const justInside = ceremonyAt(7 * 24 - 1);
    expect(
      computeDueNotifications(justInside.ceremony, [], justInside.now).some(
        (d) => d.notificationType === "director_7day",
      ),
    ).toBe(true);
  });

  it("fires director_24hr and director_30min at their respective boundaries", () => {
    const at23h = ceremonyAt(23);
    const due23h = computeDueNotifications(at23h.ceremony, [], at23h.now);
    expect(due23h.some((d) => d.notificationType === "director_24hr")).toBe(true);
    expect(due23h.some((d) => d.notificationType === "director_30min")).toBe(false);

    const at20min = ceremonyAt(20 / 60);
    const due20min = computeDueNotifications(at20min.ceremony, [], at20min.now);
    expect(due20min.some((d) => d.notificationType === "director_30min")).toBe(true);
  });

  it("all director notification windows are cumulative — closer to the ceremony means more are due, not fewer", () => {
    const { ceremony, now } = ceremonyAt(10 / 60); // 10 minutes out
    const due = computeDueNotifications(ceremony, [], now);
    const types = due.map((d) => d.notificationType);
    expect(types).toContain("director_7day");
    expect(types).toContain("director_24hr");
    expect(types).toContain("director_30min");
  });

  it("fires witness_reminder only for witnesses who haven't responded, from 48 hours out", () => {
    const { ceremony, now } = ceremonyAt(47);
    const due = computeDueNotifications(
      ceremony,
      [
        { id: "w1", rsvp_status: null },
        { id: "w2", rsvp_status: "accepted" },
      ],
      now,
    );
    const reminderRecipients = due
      .filter((d) => d.notificationType === "witness_reminder")
      .map((d) => d.witnessId);
    expect(reminderRecipients).toEqual(["w1"]);
  });

  it("fires witness_day_of for every witness regardless of RSVP, from 3 hours out", () => {
    const { ceremony, now } = ceremonyAt(2);
    const due = computeDueNotifications(
      ceremony,
      [
        { id: "w1", rsvp_status: null },
        { id: "w2", rsvp_status: "declined" },
      ],
      now,
    );
    const dayOfRecipients = due
      .filter((d) => d.notificationType === "witness_day_of")
      .map((d) => d.witnessId)
      .sort();
    expect(dayOfRecipients).toEqual(["w1", "w2"]);
  });

  it("does not fire witness_day_of before the 3-hour window opens", () => {
    const { ceremony, now } = ceremonyAt(4);
    const due = computeDueNotifications(ceremony, [{ id: "w1", rsvp_status: null }], now);
    expect(due.some((d) => d.notificationType === "witness_day_of")).toBe(false);
  });

  it("still reports due notifications after the ceremony start time has passed but status hasn't advanced (late sweep)", () => {
    const { ceremony, now } = ceremonyAt(-2); // started 2 hours ago, still 'ready'
    const due = computeDueNotifications(ceremony, [{ id: "w1", rsvp_status: null }], now);
    expect(due.some((d) => d.notificationType === "director_30min")).toBe(true);
    expect(due.some((d) => d.notificationType === "witness_day_of")).toBe(true);
  });

  it("is pure — calling it twice with the same inputs returns the same result (duplicate sweeps are safe)", () => {
    const { ceremony, now } = ceremonyAt(1);
    const witnesses = [{ id: "w1", rsvp_status: null }];
    expect(computeDueNotifications(ceremony, witnesses, now)).toEqual(
      computeDueNotifications(ceremony, witnesses, now),
    );
  });

  it("defaults a missing start_time to noon rather than midnight", () => {
    // If start_time defaulted to midnight, "now" (11:00 the same day)
    // would already be 11 hours past a midnight start, incorrectly
    // firing director_30min (any negative — already-past — remaining
    // time satisfies every window). A noon default instead puts the
    // ceremony 1 hour in the future, which shouldn't trigger it yet.
    const now = new Date("2027-06-01T11:00:00");
    const ceremony = { id: "c1", date: "2027-06-01", start_time: null, status: "ready" as never };
    const due = computeDueNotifications(ceremony, [], now);
    expect(due.some((d) => d.notificationType === "director_24hr")).toBe(true);
    expect(due.some((d) => d.notificationType === "director_30min")).toBe(false);
  });
});
