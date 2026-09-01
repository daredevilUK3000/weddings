import { createClient } from "@/lib/supabase/server";
import { generateOutreachDraft } from "@/lib/ai/outreach";

export async function POST(req: Request) {
  const {
    vendorShortlistId,
    categorySpecificAsk,
  }: { vendorShortlistId: string; categorySpecificAsk: string } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vendor } = await supabase
    .from("vendor_shortlist")
    .select("id, name, ceremony_id, category_id")
    .eq("id", vendorShortlistId)
    .single();

  if (!vendor) {
    return Response.json({ error: "Vendor not found" }, { status: 404 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, date, location, budget_band, guest_count, user_id")
    .eq("id", vendor.ceremony_id)
    .single();

  const { data: category } = await supabase
    .from("vendor_categories")
    .select("name")
    .eq("id", vendor.category_id)
    .single();

  if (!ceremony || ceremony.user_id !== user.id) {
    return Response.json({ error: "Vendor not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();

  const draftText = await generateOutreachDraft({
    category: category?.name ?? "vendor",
    vendorName: vendor.name,
    vibe: ceremony.vibe,
    date: ceremony.date,
    location: ceremony.location,
    budgetBand: ceremony.budget_band,
    guestCount: ceremony.guest_count,
    clientName: profile?.name ?? profile?.email ?? "the client",
    categorySpecificAsk,
  });

  const { data, error } = await supabase
    .from("outreach_drafts")
    .upsert(
      { vendor_shortlist_id: vendorShortlistId, draft_text: draftText, updated_at: new Date().toISOString() },
      { onConflict: "vendor_shortlist_id" },
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

const VALID_STATUSES = ["not_sent", "sent", "replied", "booked"] as const;
type OutreachStatusValue = (typeof VALID_STATUSES)[number];

export async function PATCH(req: Request) {
  const { outreachDraftId, status }: { outreachDraftId: string; status: string } = await req.json();

  if (!VALID_STATUSES.includes(status as OutreachStatusValue)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  const validatedStatus = status as OutreachStatusValue;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("outreach_drafts")
    .update({ status: validatedStatus, updated_at: new Date().toISOString() })
    .eq("id", outreachDraftId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
