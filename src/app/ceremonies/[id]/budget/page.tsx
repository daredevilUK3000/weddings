import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seedBudgetItems, updateBudgetItem } from "./actions";

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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">Budget tracker</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left">
            <th className="py-2">Category</th>
            <th className="py-2">Estimated</th>
            <th className="py-2">Actual</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(budgetItems ?? []).map((b) => (
            <tr key={b.id} className="border-b border-black/5">
              <td className="py-2">{categoryName.get(b.category_id)}</td>
              <td colSpan={3} className="py-2">
                <form
                  action={updateBudgetItem.bind(null, id, b.id)}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    name="estimated_cost"
                    defaultValue={b.estimated_cost ?? ""}
                    placeholder="Estimated"
                    className="w-28 rounded-md border border-black/10 px-2 py-1"
                  />
                  <input
                    type="number"
                    name="actual_cost"
                    defaultValue={b.actual_cost ?? ""}
                    placeholder="Actual"
                    className="w-28 rounded-md border border-black/10 px-2 py-1"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-black/10 px-3 py-1"
                  >
                    Save
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="py-2">Total</td>
            <td className="py-2">${totalEstimated.toLocaleString()}</td>
            <td className="py-2">${totalActual.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}
