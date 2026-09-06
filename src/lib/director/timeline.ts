import type { TimelineEventStatus, VendorBookingStatus } from "@/lib/types/database";

// Wedding Director never owns the ceremony sequence — it only reads and
// buckets it (Ceremony Builder is still the only place order/content is
// edited). Bucketing is driven by event_status, not clock time: "now" is
// whatever moment is explicitly marked active, "next" is the first
// upcoming moment in sequence, everything else upcoming is "later".
// Arrived vendors surface in "now" as informational, not because they're
// part of the ceremony sequence.

export interface TimelineMomentInput {
  id: string;
  moment_name: string;
  order_index: number;
  event_status: TimelineEventStatus;
  time: string | null;
}

export interface VendorLogisticsInput {
  id: string;
  name: string;
  booking_status: VendorBookingStatus;
}

export interface DayEvent {
  id: string;
  label: string;
  time: string | null;
}

export interface NowNextLater {
  activeMoment: DayEvent | null;
  arrivedVendors: DayEvent[];
  next: DayEvent | null;
  later: DayEvent[];
}

function toDayEvent(m: TimelineMomentInput): DayEvent {
  return { id: m.id, label: m.moment_name, time: m.time };
}

export function computeNowNextLater(
  timeline: TimelineMomentInput[],
  vendors: VendorLogisticsInput[],
): NowNextLater {
  const sorted = [...timeline].sort((a, b) => a.order_index - b.order_index);
  const activeMoment = sorted.find((m) => m.event_status === "active") ?? null;
  const upcoming = sorted.filter((m) => m.event_status === "upcoming");
  const [next, ...later] = upcoming;

  const arrivedVendors = vendors
    .filter((v) => v.booking_status === "arrived")
    .map((v) => ({ id: v.id, label: v.name, time: null }));

  return {
    activeMoment: activeMoment ? toDayEvent(activeMoment) : null,
    arrivedVendors,
    next: next ? toDayEvent(next) : null,
    later: later.map(toDayEvent),
  };
}
