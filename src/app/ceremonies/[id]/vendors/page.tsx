import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorsClient } from "./vendors-client";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

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
    .select("id, category_id, name, address, ai_rationale, selected")
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
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <div>
          <p className="text-sm font-medium text-wine">Real vendors, already briefed</p>
          <h1 className="font-serif text-3xl font-medium">Vendor concierge</h1>
        </div>
        <VendorsClient
          ceremonyId={id}
          defaultLocation={ceremony.location ?? ""}
          categories={categories ?? []}
          initialShortlist={initialShortlist}
        />
        <p className="text-xs text-ink-soft/70">
          Vendor data{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            © OpenStreetMap contributors
          </a>
          , via{" "}
          <a
            href="https://www.geoapify.com/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            Geoapify
          </a>
          .
        </p>
      </main>
    </div>
  );
}
