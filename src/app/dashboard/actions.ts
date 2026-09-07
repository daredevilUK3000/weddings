"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
