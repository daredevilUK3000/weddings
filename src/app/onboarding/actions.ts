"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vibe } from "@/lib/types/database";

export async function createCeremony(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Collected once here (skipped in the flow if already set) rather than
  // per-ceremony — it's the display name used anywhere generated content
  // addresses the account owner (witness invites, the certificate, vendor
  // outreach), never their raw email. See src/lib/display-name.ts.
  const name = (formData.get("name") as string | null)?.trim();
  if (name) {
    await supabase.from("profiles").update({ name }).eq("id", user.id);
  }

  const priorityRanking = formData.getAll("priority").map(String);

  const { data, error } = await supabase
    .from("ceremonies")
    .insert({
      user_id: user.id,
      vibe: formData.get("vibe") as Vibe,
      reason: formData.get("reason") as string,
      date: (formData.get("date") as string) || null,
      location: (formData.get("location") as string) || null,
      guest_count: Number(formData.get("guest_count")) || 0,
      budget_band: (formData.get("budget_band") as string) || null,
      priority_ranking: priorityRanking,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create ceremony");
  }

  redirect(`/ceremonies/${data.id}/officiant`);
}
