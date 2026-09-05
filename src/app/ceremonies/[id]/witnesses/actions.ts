"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/base-url";
import { sendWitnessEmail } from "@/lib/notifications/send";
import { witnessInvitationEmail } from "@/lib/email-templates/witness-invitation";
import { witnessSigningRequestEmail } from "@/lib/email-templates/witness-signing-request";
import { formatCeremonyDate } from "@/lib/format-ceremony-date";
import type { WitnessAttendanceType } from "@/lib/types/database";

const MAX_WITNESSES = 12;
const ATTENDANCE_TYPES: WitnessAttendanceType[] = [
  "in_person",
  "online",
  "remote_contribution",
  "witnessing_afterward",
];

export async function inviteWitness(ceremonyId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("id, vibe, date, start_time, location")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();
  if (!ceremony) throw new Error("Ceremony not found");

  const { count } = await supabase
    .from("witnesses")
    .select("id", { count: "exact", head: true })
    .eq("ceremony_id", ceremonyId);
  if ((count ?? 0) >= MAX_WITNESSES) {
    throw new Error("Your Witness Circle is full — up to 12 witnesses per ceremony.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim() || null;
  const attendanceType = formData.get("attendance_type") as WitnessAttendanceType;
  const canSignCertificate = formData.get("can_sign_certificate") === "on";
  const shareVows = formData.get("share_vows") === "on";

  if (!name || !email || !ATTENDANCE_TYPES.includes(attendanceType)) {
    throw new Error("Name, email, and attendance type are required.");
  }

  const { data: witness, error } = await supabase
    .from("witnesses")
    .insert({
      ceremony_id: ceremonyId,
      name,
      email,
      relationship,
      attendance_type: attendanceType,
      can_sign_certificate: canSignCertificate,
      share_vows: shareVows,
    })
    .select("id, invite_token")
    .single();
  if (error || !witness) {
    throw new Error(error?.message ?? "Could not add witness");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();
  const hostName = profile?.name ?? profile?.email ?? "Your friend";

  const baseUrl = await getBaseUrl();
  const dateLine = [ceremony.date ? formatCeremonyDate(ceremony.date) : null, ceremony.start_time, ceremony.location]
    .filter(Boolean)
    .join(" · ");

  const { subject, html } = witnessInvitationEmail({
    witnessName: name,
    hostName,
    vibe: ceremony.vibe,
    dateLine,
    portalUrl: `${baseUrl}/witness/${witness.invite_token}`,
  });

  const result = await sendWitnessEmail({
    ceremonyId,
    witnessId: witness.id,
    to: email,
    type: "witness_invitation",
    subject,
    html,
  });

  if (result.sent) {
    await supabase
      .from("witnesses")
      .update({ invited_at: new Date().toISOString() })
      .eq("id", witness.id);
  }

  revalidatePath(`/ceremonies/${ceremonyId}/witnesses`);
}

export async function removeWitness(ceremonyId: string, witnessId: string) {
  const supabase = await createClient();
  await supabase.from("witnesses").delete().eq("id", witnessId).eq("ceremony_id", ceremonyId);
  revalidatePath(`/ceremonies/${ceremonyId}/witnesses`);
}

export async function requestSignature(ceremonyId: string, witnessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: witness } = await supabase
    .from("witnesses")
    .select("id, name, email, can_sign_certificate, invite_token")
    .eq("id", witnessId)
    .eq("ceremony_id", ceremonyId)
    .single();
  if (!witness || !witness.can_sign_certificate) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();
  const hostName = profile?.name ?? profile?.email ?? "Your friend";
  const baseUrl = await getBaseUrl();

  const { subject, html } = witnessSigningRequestEmail({
    witnessName: witness.name,
    hostName,
    portalUrl: `${baseUrl}/witness/${witness.invite_token}`,
  });

  await sendWitnessEmail({
    ceremonyId,
    witnessId: witness.id,
    to: witness.email,
    type: "witness_signing_request",
    subject,
    html,
  });

  revalidatePath(`/ceremonies/${ceremonyId}/witnesses`);
}

// The one manual override the sharing correction allows — everything else
// a witness sees is derived from attendance_type (src/lib/witness-sharing.ts).
export async function updateVowsSharing(ceremonyId: string, witnessId: string, share: boolean) {
  const supabase = await createClient();
  await supabase
    .from("witnesses")
    .update({ share_vows: share })
    .eq("id", witnessId)
    .eq("ceremony_id", ceremonyId);

  revalidatePath(`/ceremonies/${ceremonyId}/witnesses`);
}
