"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_MOMENTS = [
  "Processional",
  "Opening words",
  "Self-vows",
  "Ring / token exchange",
  "Unity ritual",
  "First dance",
  "Toast",
];

export async function seedTimeline(ceremonyId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("ceremony_timeline")
    .select("id")
    .eq("ceremony_id", ceremonyId);

  if (existing && existing.length > 0) return;

  await supabase.from("ceremony_timeline").insert(
    DEFAULT_MOMENTS.map((moment_name, order_index) => ({
      ceremony_id: ceremonyId,
      moment_name,
      order_index,
    })),
  );
}

export async function reorderMoment(
  ceremonyId: string,
  momentId: string,
  direction: "up" | "down",
) {
  const supabase = await createClient();
  const { data: moments } = await supabase
    .from("ceremony_timeline")
    .select("id, order_index")
    .eq("ceremony_id", ceremonyId)
    .order("order_index");

  if (!moments) return;

  const index = moments.findIndex((m) => m.id === momentId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= moments.length) return;

  const a = moments[index];
  const b = moments[swapWith];

  const [{ error: errorA }, { error: errorB }] = await Promise.all([
    supabase.from("ceremony_timeline").update({ order_index: b.order_index }).eq("id", a.id),
    supabase.from("ceremony_timeline").update({ order_index: a.order_index }).eq("id", b.id),
  ]);
  if (errorA || errorB) {
    throw new Error(errorA?.message ?? errorB?.message ?? "Failed to reorder moment");
  }

  revalidatePath(`/ceremonies/${ceremonyId}/builder`);
}

export async function selectVowDraft(ceremonyId: string, vowText: string) {
  const supabase = await createClient();
  await supabase
    .from("ceremonies")
    .update({ vows: vowText, updated_at: new Date().toISOString() })
    .eq("id", ceremonyId);

  revalidatePath(`/ceremonies/${ceremonyId}/builder`);
}

// The Witness Contribution moment is an ordinary ceremony_timeline row
// (tagged via moment_kind), not a second structure — Wedding Director's
// Ceremony Mode reads it the same way it reads any other moment.
export async function addWitnessContributionMoment(ceremonyId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("ceremony_timeline")
    .select("id")
    .eq("ceremony_id", ceremonyId)
    .eq("moment_kind", "witness_contribution")
    .single();
  if (existing) return;

  const { data: moments } = await supabase
    .from("ceremony_timeline")
    .select("order_index")
    .eq("ceremony_id", ceremonyId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextOrderIndex = (moments?.[0]?.order_index ?? -1) + 1;

  await supabase.from("ceremony_timeline").insert({
    ceremony_id: ceremonyId,
    moment_name: "Witness messages",
    order_index: nextOrderIndex,
    moment_kind: "witness_contribution",
  });

  revalidatePath(`/ceremonies/${ceremonyId}/builder`);
}

export async function removeWitnessContributionMoment(ceremonyId: string, momentId: string) {
  const supabase = await createClient();
  await supabase
    .from("ceremony_timeline")
    .delete()
    .eq("id", momentId)
    .eq("ceremony_id", ceremonyId)
    .eq("moment_kind", "witness_contribution");

  revalidatePath(`/ceremonies/${ceremonyId}/builder`);
}
