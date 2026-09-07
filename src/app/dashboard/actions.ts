"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Deletes the ceremony row only — every other table (timeline, vendor
// shortlist + outreach drafts, budget items, witnesses + their
// contributions/signatures, notifications) references ceremony_id with
// on delete cascade, so this single delete removes all of it. RLS's
// "ceremonies: owner read/write" policy already restricts this to rows the
// caller owns; the .eq("user_id", ...) below is a second, explicit guard.
export async function deleteCeremony(ceremonyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("ceremonies")
    .delete()
    .eq("id", ceremonyId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard");
}

// "Start over, keep the ceremony": wipes everything the officiant/builder/
// vendor/budget/witness flows generated, but keeps the ceremony row itself —
// its onboarding-quiz answers (vibe, reason, date, location, guest_count,
// budget_band, priority_ranking) and id survive, so links to it keep working
// and the user isn't re-asked the quiz. Child tables have no "core" data of
// their own worth keeping, so they're deleted outright rather than reset.
export async function startOverCeremony(ceremonyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("id")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();
  if (!ceremony) {
    throw new Error("Ceremony not found");
  }

  // notifications has RLS enabled with zero policies (it's an internal
  // send-cap ledger, service-role-only by design — see 0003's comment on the
  // table) so a normal authenticated delete against it silently matches zero
  // rows. Ownership of ceremonyId was already confirmed above via the
  // authenticated client, so it's safe to clear it with the service client.
  const deletes = await Promise.all([
    supabase.from("ceremony_timeline").delete().eq("ceremony_id", ceremonyId),
    supabase.from("vendor_shortlist").delete().eq("ceremony_id", ceremonyId),
    supabase.from("budget_items").delete().eq("ceremony_id", ceremonyId),
    supabase.from("witnesses").delete().eq("ceremony_id", ceremonyId),
    createServiceClient().from("notifications").delete().eq("ceremony_id", ceremonyId),
  ]);
  const deleteError = deletes.find((d) => d.error)?.error;
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error } = await supabase
    .from("ceremonies")
    .update({
      ceremony_script: null,
      vows: null,
      witness_reading: null,
      status: "planning",
      start_time: null,
      wedding_day_started_at: null,
      ceremony_started_at: null,
      livestream_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ceremonyId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/ceremonies/${ceremonyId}/officiant`);
}
