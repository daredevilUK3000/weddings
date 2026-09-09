import { createServiceClient } from "@/lib/supabase/service";
import { displayName } from "@/lib/display-name";
import { computeDueNotifications } from "@/lib/notifications/schedule";
import { sendDirectorEmail, sendWitnessEmail } from "@/lib/notifications/send";
import {
  director7DayEmail,
  director24HourEmail,
  director30MinEmail,
} from "@/lib/email-templates/director-checks";
import { witnessReminderEmail } from "@/lib/email-templates/witness-reminder";
import { witnessDayOfEmail } from "@/lib/email-templates/witness-day-of";
import type { CeremonyStatus } from "@/lib/types/database";

// Triggered externally (GitHub Actions on a schedule, per the Hobby-tier
// cron-granularity limitation) rather than a Vercel cron. Deliberately a
// thin DB-fetch + loop wrapper — all due-window logic lives in
// computeDueNotifications, which is what's actually unit-tested.

const SWEEP_WINDOW_DAYS = 8;
const NON_TERMINAL_STATUSES: CeremonyStatus[] = [
  "planning",
  "confirmed",
  "preparing",
  "ready",
  "wedding_day",
];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { origin } = new URL(req.url);
  const supabase = createServiceClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + SWEEP_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: ceremonies } = await supabase
    .from("ceremonies")
    .select("id, date, start_time, status, user_id")
    .in("status", NON_TERMINAL_STATUSES)
    .not("date", "is", null)
    .lte("date", windowEnd);

  let sent = 0;
  let attempted = 0;

  for (const ceremony of ceremonies ?? []) {
    const { data: witnesses } = await supabase
      .from("witnesses")
      .select("id, name, email, invite_token, rsvp_status")
      .eq("ceremony_id", ceremony.id);

    const due = computeDueNotifications(ceremony, witnesses ?? [], now);
    if (due.length === 0) continue;

    // Every notification type references the host's name somewhere
    // (director emails address them directly; witness emails mention
    // them by name), so fetch it once per ceremony with anything due.
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", ceremony.user_id)
      .single();

    for (const notification of due) {
      attempted++;
      if (notification.recipientType === "user") {
        if (!profile?.email) continue;
        const hostName = displayName(profile.name, "Friend");
        const directorUrl = `${origin}/ceremonies/${ceremony.id}/director`;
        const { subject, html } =
          notification.notificationType === "director_7day"
            ? director7DayEmail({ hostName, directorUrl })
            : notification.notificationType === "director_24hr"
              ? director24HourEmail({ hostName, directorUrl })
              : director30MinEmail({ hostName, directorUrl });

        const result = await sendDirectorEmail({
          ceremonyId: ceremony.id,
          to: profile.email,
          type: notification.notificationType as Parameters<typeof sendDirectorEmail>[0]["type"],
          subject,
          html,
        });
        if (result.sent) sent++;
      } else {
        const witness = (witnesses ?? []).find((w) => w.id === notification.witnessId);
        if (!witness) continue;
        const hostName = displayName(profile?.name, "your friend");
        const portalUrl = `${origin}/witness/${witness.invite_token}`;
        const { subject, html } =
          notification.notificationType === "witness_reminder"
            ? witnessReminderEmail({ witnessName: witness.name, hostName, portalUrl })
            : witnessDayOfEmail({ witnessName: witness.name, hostName, portalUrl });

        const result = await sendWitnessEmail({
          ceremonyId: ceremony.id,
          witnessId: witness.id,
          to: witness.email,
          type: notification.notificationType as Parameters<typeof sendWitnessEmail>[0]["type"],
          subject,
          html,
        });
        if (result.sent) sent++;
      }
    }
  }

  return Response.json({ ceremoniesScanned: ceremonies?.length ?? 0, attempted, sent });
}
