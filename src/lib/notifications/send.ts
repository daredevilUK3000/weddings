import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

// Enforces the notification caps from the Wedding Director + Witness Circle
// brief (§9.2) as an actual limit, not a convention: 3 pre-ceremony touches
// per witness (invitation, reminder, day-of) + 1 post-ceremony signing
// request, and 3 Wedding Director checks per user. Every send is logged to
// `notifications`; every send first counts prior sends in the same bucket
// and refuses once the cap is hit.

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Weddings for One <hello@weddingsforone.com>";

const WITNESS_PRE_CEREMONY_TYPES = ["witness_invitation", "witness_reminder", "witness_day_of"] as const;
const WITNESS_SIGNING_TYPES = ["witness_signing_request"] as const;
const DIRECTOR_TYPES = ["director_7day", "director_24hr", "director_30min"] as const;

export type WitnessNotificationType =
  | (typeof WITNESS_PRE_CEREMONY_TYPES)[number]
  | (typeof WITNESS_SIGNING_TYPES)[number];

export type DirectorNotificationType = (typeof DIRECTOR_TYPES)[number];

const CAP_BUCKETS: { types: readonly string[]; limit: number }[] = [
  { types: WITNESS_PRE_CEREMONY_TYPES, limit: 3 },
  { types: WITNESS_SIGNING_TYPES, limit: 1 },
  { types: DIRECTOR_TYPES, limit: 3 },
];

type SendResult = { sent: true } | { sent: false; reason: "budget_exceeded" | "send_failed" };

async function withinBudget(
  ceremonyId: string,
  recipientType: "user" | "witness",
  recipientId: string | null,
  notificationType: string,
): Promise<boolean> {
  const bucket = CAP_BUCKETS.find((b) => b.types.includes(notificationType));
  if (!bucket) return true;

  const supabase = createServiceClient();
  let query = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("ceremony_id", ceremonyId)
    .eq("recipient_type", recipientType)
    .in("notification_type", bucket.types as unknown as string[]);
  query = recipientId ? query.eq("recipient_id", recipientId) : query.is("recipient_id", null);

  const { count } = await query;
  return (count ?? 0) < bucket.limit;
}

async function logSend(
  ceremonyId: string,
  recipientType: "user" | "witness",
  recipientId: string | null,
  notificationType: string,
) {
  const supabase = createServiceClient();
  await supabase.from("notifications").insert({
    ceremony_id: ceremonyId,
    recipient_type: recipientType,
    recipient_id: recipientId,
    notification_type: notificationType,
  });
}

export async function sendWitnessEmail(params: {
  ceremonyId: string;
  witnessId: string;
  to: string;
  type: WitnessNotificationType;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const ok = await withinBudget(params.ceremonyId, "witness", params.witnessId, params.type);
  if (!ok) return { sent: false, reason: "budget_exceeded" };

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) return { sent: false, reason: "send_failed" };

  await logSend(params.ceremonyId, "witness", params.witnessId, params.type);
  return { sent: true };
}

export async function sendDirectorEmail(params: {
  ceremonyId: string;
  to: string;
  type: DirectorNotificationType;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const ok = await withinBudget(params.ceremonyId, "user", null, params.type);
  if (!ok) return { sent: false, reason: "budget_exceeded" };

  const { error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) return { sent: false, reason: "send_failed" };

  await logSend(params.ceremonyId, "user", null, params.type);
  return { sent: true };
}
