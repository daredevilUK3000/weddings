import type { CeremonyStatus, WitnessRsvpStatus } from "@/lib/types/database";
import type { DirectorNotificationType, WitnessNotificationType } from "./send";

// A dumb, frequent, over-inclusive sweep: for every ceremony within the
// next 8 days, unconditionally report every notification type whose time
// window has opened. send.ts's own budget ledger makes repeat reports
// harmless no-ops after the first successful send — this is what avoids
// the classic "cron ran late and missed the window" failure mode, at the
// cost of a cheap re-check per still-in-window ceremony per sweep.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const SWEEP_WINDOW = 8 * DAY;

const DIRECTOR_WINDOWS: { type: DirectorNotificationType; before: number }[] = [
  { type: "director_7day", before: 7 * DAY },
  { type: "director_24hr", before: 24 * HOUR },
  { type: "director_30min", before: 30 * MINUTE },
];

export interface CeremonyForSchedule {
  id: string;
  date: string | null;
  start_time: string | null;
  status: CeremonyStatus;
}

export interface WitnessForSchedule {
  id: string;
  rsvp_status: WitnessRsvpStatus | null;
}

export interface DueNotification {
  ceremonyId: string;
  recipientType: "user" | "witness";
  witnessId: string | null;
  notificationType: DirectorNotificationType | WitnessNotificationType;
}

// No ceremony timezone is stored; a ceremony without a start_time defaults
// to noon rather than midnight so a same-day cron sweep doesn't treat an
// unset time as "already passed."
function ceremonyStart(ceremony: CeremonyForSchedule): Date | null {
  if (!ceremony.date) return null;
  const time = ceremony.start_time ?? "12:00:00";
  const parsed = new Date(`${ceremony.date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const ACTIVE_ENOUGH_STATUSES: CeremonyStatus[] = ["ceremony_active", "completed"];

export function computeDueNotifications(
  ceremony: CeremonyForSchedule,
  witnesses: WitnessForSchedule[],
  now: Date,
): DueNotification[] {
  // Once the ceremony is actually happening or over, Wedding Director /
  // witness pre-ceremony checks no longer apply.
  if (ACTIVE_ENOUGH_STATUSES.includes(ceremony.status)) return [];

  const startAt = ceremonyStart(ceremony);
  if (!startAt) return [];

  const msUntilStart = startAt.getTime() - now.getTime();
  if (msUntilStart > SWEEP_WINDOW) return [];

  const due: DueNotification[] = [];

  for (const window of DIRECTOR_WINDOWS) {
    if (msUntilStart <= window.before) {
      due.push({
        ceremonyId: ceremony.id,
        recipientType: "user",
        witnessId: null,
        notificationType: window.type,
      });
    }
  }

  for (const witness of witnesses) {
    if (msUntilStart <= 48 * HOUR && witness.rsvp_status === null) {
      due.push({
        ceremonyId: ceremony.id,
        recipientType: "witness",
        witnessId: witness.id,
        notificationType: "witness_reminder",
      });
    }
    if (msUntilStart <= 3 * HOUR) {
      due.push({
        ceremonyId: ceremony.id,
        recipientType: "witness",
        witnessId: witness.id,
        notificationType: "witness_day_of",
      });
    }
  }

  return due;
}
