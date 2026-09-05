import type { VendorBookingStatus } from "@/lib/types/database";

// Per the Wedding Director brief (§4.2, §9.1): readiness distinguishes
// essential from nice-to-have issues, and NEVER includes Witness Circle
// data — witness RSVP/response status is shown separately, with neutral
// framing, never blended into this score or equated with a vendor issue.

export interface ReadinessItem {
  key: string;
  label: string;
  done: boolean;
  essential: boolean;
}

export interface ReadinessResult {
  score: number;
  items: ReadinessItem[];
  essentialComplete: boolean;
}

interface ReadinessCeremony {
  ceremony_script: string | null;
  vows: string | null;
  date: string | null;
  location: string | null;
  start_time: string | null;
}

interface ReadinessVendor {
  booking_status: VendorBookingStatus;
}

const CONFIRMED_STATUSES: VendorBookingStatus[] = ["booked", "confirmed", "arrived", "completed"];

export function computeReadiness(
  ceremony: ReadinessCeremony,
  vendors: ReadinessVendor[],
): ReadinessResult {
  const items: ReadinessItem[] = [
    {
      key: "script",
      label: "Ceremony script completed",
      done: !!ceremony.ceremony_script,
      essential: true,
    },
    { key: "vows", label: "Vows selected", done: !!ceremony.vows, essential: true },
    {
      key: "date",
      label: "Ceremony date and time set",
      done: !!ceremony.date && !!ceremony.start_time,
      essential: true,
    },
    { key: "location", label: "Location recorded", done: !!ceremony.location, essential: true },
  ];

  if (vendors.length > 0) {
    const confirmedCount = vendors.filter((v) => CONFIRMED_STATUSES.includes(v.booking_status)).length;
    items.push({
      key: "vendors",
      label: `${confirmedCount} of ${vendors.length} vendors confirmed`,
      done: confirmedCount === vendors.length,
      essential: false,
    });
  }

  const doneCount = items.filter((i) => i.done).length;
  const score = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);
  const essentialComplete = items.filter((i) => i.essential).every((i) => i.done);

  return { score, items, essentialComplete };
}
