import { createClient } from "@/lib/supabase/server";

// The only write path onto vendor_shortlist. Browsing (POST /api/vendors/search)
// returns candidates only — a row is created here, and only here, once the user
// explicitly clicks "Shortlist this vendor" on a specific candidate.
export async function POST(req: Request) {
  const {
    ceremonyId,
    categoryId,
    placeId,
    name,
    address,
    rationale,
  }: {
    ceremonyId: string;
    categoryId: string;
    placeId: string;
    name: string;
    address: string | null;
    rationale: string | null;
  } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("id")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();
  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("vendor_shortlist")
    .insert({
      ceremony_id: ceremonyId,
      category_id: categoryId,
      place_id: placeId,
      name,
      address,
      ai_rationale: rationale,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Could not shortlist this vendor" }, { status: 500 });
  }

  return Response.json(data);
}
