import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seedBudgetItems, updateBudgetItem } from "./actions";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("id")
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
    .single();

  if (!ceremony) {
    notFound();
  }

  await seedBudgetItems(id);

  const { data: budgetItems } = await supabase
    .from("budget_items")
    .select("id, category_id, estimated_cost, actual_cost")
    .eq("ceremony_id", id);

  const { data: categories } = await supabase
    .from("vendor_categories")
    .select("id, name")
    .order("name");

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const totalEstimated = (budgetItems ?? []).reduce((s, b) => s + (b.estimated_cost ?? 0), 0);
  const totalActual = (budgetItems ?? []).reduce((s, b) => s + (b.actual_cost ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <h1 className="font-serif text-3xl font-medium">Budget tracker</h1>

        <div className="overflow-hidden rounded-sm border border-ink/10 bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-parchment/60 text-left">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Estimated</th>
                <th className="px-4 py-3 font-medium">Actual</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(budgetItems ?? []).map((b) => (
                <tr key={b.id} className="border-b border-ink/5 last:border-b-0">
                  <td className="px-4 py-3">{categoryName.get(b.category_id)}</td>
                  <td colSpan={3} className="px-4 py-2">
                    <form
                      action={updateBudgetItem.bind(null, id, b.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="number"
                        name="estimated_cost"
                        defaultValue={b.estimated_cost ?? ""}
                        placeholder="Estimated"
                        className="w-28 rounded-sm border border-ink/15 bg-white px-2 py-1 outline-none focus:border-champagne"
                      />
                      <input
                        type="number"
                        name="actual_cost"
                        defaultValue={b.actual_cost ?? ""}
                        placeholder="Actual"
                        className="w-28 rounded-sm border border-ink/15 bg-white px-2 py-1 outline-none focus:border-champagne"
                      />
                      <button
                        type="submit"
                        className="rounded-sm border border-ink/15 px-3 py-1 transition-colors hover:border-champagne hover:text-wine"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/10 bg-parchment/60 font-medium">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">${totalEstimated.toLocaleString()}</td>
                <td className="px-4 py-3">${totalActual.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </div>
  );
}
