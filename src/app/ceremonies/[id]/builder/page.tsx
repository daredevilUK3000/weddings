import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seedTimeline, reorderMoment, selectVowDraft } from "./actions";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

export default async function BuilderPage({
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
    .select("id, ceremony_script, vows, witness_reading")
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
    .single();

  if (!ceremony) {
    notFound();
  }

  await seedTimeline(id);

  const { data: timeline } = await supabase
    .from("ceremony_timeline")
    .select("id, moment_name, order_index")
    .eq("ceremony_id", id)
    .order("order_index");

  const vowDrafts = ceremony.vows?.includes("\n\n---\n\n")
    ? ceremony.vows.split("\n\n---\n\n")
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-12">
        <h1 className="font-serif text-3xl font-medium">Ceremony builder</h1>

        {ceremony.ceremony_script ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Ceremony script</h2>
            <pre className="whitespace-pre-wrap rounded-sm border border-ink/10 bg-white/60 p-5 font-serif text-[15px] leading-relaxed">
              {ceremony.ceremony_script}
            </pre>
          </section>
        ) : (
          <p className="text-ink-soft">
            Your ceremony script hasn&apos;t been generated yet —{" "}
            <Link
              href={`/ceremonies/${id}/officiant`}
              className="font-medium text-ink underline underline-offset-2"
            >
              finish your officiant chat
            </Link>
            .
          </p>
        )}

        {vowDrafts ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Choose your vows</h2>
            {vowDrafts.map((draft, i) => (
              <form key={i} action={selectVowDraft.bind(null, id, draft)}>
                <button
                  type="submit"
                  className="w-full rounded-sm border border-ink/10 bg-white/60 p-4 text-left font-serif text-[15px] leading-relaxed transition-colors hover:border-rust"
                >
                  {draft}
                </button>
              </form>
            ))}
          </section>
        ) : ceremony.vows ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Your vows</h2>
            <pre className="whitespace-pre-wrap rounded-sm border border-ink/10 bg-white/60 p-5 font-serif text-[15px] leading-relaxed">
              {ceremony.vows}
            </pre>
          </section>
        ) : null}

        {ceremony.witness_reading ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Witness reading</h2>
            <pre className="whitespace-pre-wrap rounded-sm border border-ink/10 bg-white/60 p-5 font-serif text-[15px] leading-relaxed">
              {ceremony.witness_reading}
            </pre>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Ceremony order</h2>
          <ul className="flex flex-col gap-2">
            {timeline?.map((moment, i) => (
              <li
                key={moment.id}
                className="flex items-center justify-between rounded-sm border border-ink/10 bg-white/60 px-4 py-3"
              >
                <span>{moment.moment_name}</span>
                <div className="flex gap-3 text-ink-soft">
                  <form action={reorderMoment.bind(null, id, moment.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="hover:text-rust disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={reorderMoment.bind(null, id, moment.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === (timeline?.length ?? 0) - 1}
                      className="hover:text-rust disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
