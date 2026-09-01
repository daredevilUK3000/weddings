import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistryGenerator } from "./extras-client";

export default async function ExtrasPage({
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
      <h1 className="text-2xl font-semibold">Extras</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Registry of Self</h2>
        <RegistryGenerator ceremonyId={id} />
      </section>

      <section className="flex flex-col gap-2 opacity-50">
        <h2 className="text-lg font-medium">Playlist generator</h2>
        <p className="text-sm">Coming soon.</p>
      </section>

      <section className="flex flex-col gap-2 opacity-50">
        <h2 className="text-lg font-medium">Social announcement kit</h2>
        <p className="text-sm">Coming soon.</p>
      </section>

      <section className="flex flex-col gap-2 opacity-50">
        <h2 className="text-lg font-medium">Anniversary check-ins</h2>
        <p className="text-sm">Coming soon.</p>
      </section>
    </main>
  );
}
