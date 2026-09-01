"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function seedBudgetItems(ceremonyId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("budget_items")
    .select("category_id")
    .eq("ceremony_id", ceremonyId);

  const existingCategoryIds = new Set((existing ?? []).map((b) => b.category_id));

  const { data: categories } = await supabase.from("vendor_categories").select("id");
  const missing = (categories ?? []).filter((c) => !existingCategoryIds.has(c.id));

  if (missing.length > 0) {
    await supabase
      .from("budget_items")
      .insert(missing.map((c) => ({ ceremony_id: ceremonyId, category_id: c.id })));
  }
}

export async function updateBudgetItem(
  ceremonyId: string,
  budgetItemId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const estimated = formData.get("estimated_cost");
  const actual = formData.get("actual_cost");

  await supabase
    .from("budget_items")
    .update({
      estimated_cost: estimated ? Number(estimated) : null,
      actual_cost: actual ? Number(actual) : null,
    })
    .eq("id", budgetItemId);

  revalidatePath(`/ceremonies/${ceremonyId}/budget`);
}
