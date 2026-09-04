import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OfficiantExperience } from "./experience-client";
import { OfficiantIntro } from "./officiant-intro";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

export default async function OfficiantPage({
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

  return (
    <div className="flex h-screen flex-col bg-parchment">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="flex flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[35%_65%]">
        <div className="border-b border-ink/8 md:border-r md:border-b-0">
          <OfficiantIntro />
        </div>
        <OfficiantExperience ceremonyId={id} />
      </main>
    </div>
  );
}
