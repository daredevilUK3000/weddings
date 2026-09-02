import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistryGenerator } from "./extras-client";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

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

  const comingSoon = [
    {
      title: "Playlist generator",
      body: "A soundtrack for your day, matched to your ceremony's tone.",
    },
    {
      title: "Social announcement kit",
      body: "Shareable graphics and captions for announcing your ceremony.",
    },
    {
      title: "Anniversary check-ins",
      body: "A yearly nudge to revisit your vows and mark the day.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-12">
        <h1 className="font-serif text-3xl font-medium">Extras</h1>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Registry of Self</h2>
          <RegistryGenerator ceremonyId={id} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-ink-soft">More on the way</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {comingSoon.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2 rounded-sm border border-dashed border-ink/15 bg-parchment/50 p-5"
              >
                <span className="w-fit rounded-full border border-champagne/50 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-wine">
                  Coming soon
                </span>
                <h3 className="font-serif text-base font-medium">{item.title}</h3>
                <p className="text-sm text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
