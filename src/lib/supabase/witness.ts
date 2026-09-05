import { createServiceClient } from "@/lib/supabase/service";
import { computeSharedContent } from "@/lib/witness-sharing";
import type {
  CeremonyStatus,
  SignatureType,
  Vibe,
  WitnessAttendanceType,
  WitnessRsvpStatus,
} from "@/lib/types/database";

// The Witness Portal (/witness/[token]) has no authenticated Supabase user —
// this is the ONLY code path that reads witness/ceremony data on a witness's
// behalf, and it is deliberately the single place that decides which
// ceremony fields a witness is allowed to see. Sharing is derived per
// witness from attendance_type (src/lib/witness-sharing.ts), not a
// ceremony-wide manual checklist. Every portal route should go through
// this rather than querying Supabase directly, so that rule has one
// enforcement point.

export interface WitnessPortalData {
  witness: {
    id: string;
    ceremonyId: string;
    name: string;
    relationship: string | null;
    attendanceType: WitnessAttendanceType;
    canSignCertificate: boolean;
    rsvpStatus: WitnessRsvpStatus | null;
    checkedInAt: string | null;
    contribution: { body: string; includeInCeremony: boolean } | null;
    signature: { signatureType: SignatureType; signedAt: string } | null;
  };
  ceremony: {
    status: CeremonyStatus;
    vibe: Vibe;
    date: string | null;
    startTime: string | null;
    location: string | null;
    livestreamUrl: string | null;
    vows: string | null;
    ceremonyStory: string | null;
    programme: { momentName: string; time: string | null }[] | null;
    shareCertificate: boolean;
  };
}

export async function getWitnessByToken(token: string): Promise<WitnessPortalData | null> {
  const supabase = createServiceClient();

  const { data: witness } = await supabase
    .from("witnesses")
    .select(
      "id, ceremony_id, name, relationship, attendance_type, can_sign_certificate, share_vows, rsvp_status, checked_in_at",
    )
    .eq("invite_token", token)
    .single();

  if (!witness) return null;

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("status, vibe, date, start_time, location, livestream_url, vows, reason")
    .eq("id", witness.ceremony_id)
    .single();

  if (!ceremony) return null;

  const shared = computeSharedContent(
    witness.attendance_type,
    witness.can_sign_certificate,
    witness.share_vows,
  );

  let programme: { momentName: string; time: string | null }[] | null = null;
  if (shared.programme) {
    const { data: timeline } = await supabase
      .from("ceremony_timeline")
      .select("moment_name, time")
      .eq("ceremony_id", witness.ceremony_id)
      .order("order_index");
    programme = (timeline ?? []).map((m) => ({ momentName: m.moment_name, time: m.time }));
  }

  const { data: contribution } = await supabase
    .from("witness_contributions")
    .select("body, include_in_ceremony")
    .eq("witness_id", witness.id)
    .single();

  const { data: signature } = await supabase
    .from("witness_signatures")
    .select("signature_type, signed_at")
    .eq("witness_id", witness.id)
    .single();

  return {
    witness: {
      id: witness.id,
      ceremonyId: witness.ceremony_id,
      name: witness.name,
      relationship: witness.relationship,
      attendanceType: witness.attendance_type,
      canSignCertificate: witness.can_sign_certificate,
      rsvpStatus: witness.rsvp_status,
      checkedInAt: witness.checked_in_at,
      contribution: contribution
        ? { body: contribution.body, includeInCeremony: contribution.include_in_ceremony }
        : null,
      signature: signature
        ? { signatureType: signature.signature_type, signedAt: signature.signed_at }
        : null,
    },
    ceremony: {
      status: ceremony.status,
      vibe: ceremony.vibe,
      date: ceremony.date,
      startTime: ceremony.start_time,
      location: ceremony.location,
      livestreamUrl: shared.livestreamLink ? ceremony.livestream_url : null,
      vows: shared.vows ? ceremony.vows : null,
      ceremonyStory: shared.ceremonyStory ? ceremony.reason : null,
      programme,
      shareCertificate: shared.certificate,
    },
  };
}

export async function markWitnessOpened(witnessId: string) {
  const supabase = createServiceClient();
  await supabase
    .from("witnesses")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", witnessId)
    .is("opened_at", null);
}
