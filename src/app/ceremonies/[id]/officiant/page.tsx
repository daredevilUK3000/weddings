import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OfficiantChat } from "./chat-client";
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
    <div className="flex h-screen flex-col bg-stone">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-hidden px-6 py-6">
        <div>
          <p className="text-sm font-medium text-rust">A conversation, not a form</p>
          <h1 className="font-serif text-2xl font-medium">Your AI officiant</h1>
        </div>
        <OfficiantChat ceremonyId={id} />
      </main>
    </div>
  );
}
