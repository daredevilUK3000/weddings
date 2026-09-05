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
        <div>
          <p className="text-sm font-medium text-wine">The little things</p>
          <h1 className="font-serif text-3xl font-medium">Extras</h1>
          <p className="mt-2 text-sm text-ink-soft">
            The touches that make this feel like a full wedding, not just a ceremony.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-medium">Registry of Self</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">
              A normal wedding registry asks guests to buy the couple gifts. This one&apos;s
              just for you — ideas for how to treat yourself now that you&apos;ve made this
              commitment, from a trip to a tattoo to a course you&apos;ve been putting off.
            </p>
            <p className="mt-2 max-w-xl text-xs text-ink-soft">
              Generate a set of five, shaped by your ceremony&apos;s vibe, your reason for
              doing this, and your budget — generate again anytime for fresh ideas.
            </p>
          </div>
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
