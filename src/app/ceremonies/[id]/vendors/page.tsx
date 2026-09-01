import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage({
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
    .select("id, location")
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
    .single();

  if (!ceremony) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("vendor_categories")
    .select("id, slug, name")
    .order("name");

  const { data: shortlist } = await supabase
    .from("vendor_shortlist")
    .select("id, category_id, name, address, rating, price_level, ai_rationale, selected")
    .eq("ceremony_id", id)
    .order("created_at");

  const shortlistIds = (shortlist ?? []).map((v) => v.id);
  const { data: outreachDrafts } =
    shortlistIds.length > 0
      ? await supabase
          .from("outreach_drafts")
          .select("id, vendor_shortlist_id, draft_text, status")
          .in("vendor_shortlist_id", shortlistIds)
      : { data: [] };

  const initialShortlist = (shortlist ?? []).map((v) => ({
    ...v,
    outreach_draft: outreachDrafts?.find((d) => d.vendor_shortlist_id === v.id) ?? null,
  }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold">Vendor concierge</h1>
      <VendorsClient
        ceremonyId={id}
        defaultLocation={ceremony.location ?? ""}
        categories={categories ?? []}
        initialShortlist={initialShortlist}
      />
    </main>
  );
}
