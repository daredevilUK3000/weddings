import { createClient } from "@/lib/supabase/server";
import { generateRegistrySuggestions } from "@/lib/ai/registry";

export async function POST(req: Request) {
  const { ceremonyId }: { ceremonyId: string } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, reason, budget_band")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const suggestions = await generateRegistrySuggestions({
    vibe: ceremony.vibe,
    reason: ceremony.reason,
    budgetBand: ceremony.budget_band,
  });

  return Response.json({ suggestions });
}
