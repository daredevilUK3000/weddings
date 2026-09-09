import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  seedTimeline,
  reorderMoment,
  selectVowDraft,
  addWitnessContributionMoment,
  removeWitnessContributionMoment,
} from "./actions";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";
import { PrintButton } from "@/components/print-button";
import { CeremonyScriptView } from "@/components/ceremony-script-view";

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
    .select("id, moment_name, order_index, moment_kind")
    .eq("ceremony_id", id)
    .order("order_index");

  const hasWitnessContributionMoment = (timeline ?? []).some(
    (m) => m.moment_kind === "witness_contribution",
  );

  const vowDrafts = ceremony.vows?.includes("\n\n---\n\n")
    ? ceremony.vows.split("\n\n---\n\n")
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-12">
        <div>
          <h1 className="font-serif text-3xl font-medium">Your ceremony</h1>
          <p className="mt-1 text-sm text-ink-soft">Your script, your vows, your day — shaped.</p>
        </div>

        {ceremony.ceremony_script ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Your ceremony script</h2>
              <PrintButton />
            </div>
            <CeremonyScriptView script={ceremony.ceremony_script} />
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
                  className="w-full rounded-sm border border-ink/10 bg-white/60 p-4 text-left font-serif text-[15px] leading-relaxed transition-colors hover:border-champagne"
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
          <h2 className="text-lg font-medium">Your programme</h2>
          <div className="rounded-sm border border-champagne/40 bg-white/60 px-2 py-2">
            <ul>
              {timeline?.map((moment, i) => (
                <li
                  key={`${moment.id}-${moment.order_index}`}
                  className="flex animate-[fadeIn_0.3s_ease] items-center justify-between gap-4 border-t border-ink/8 px-4 py-3.5 first:border-t-0"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="w-6 font-sans text-xs tabular-nums text-champagne">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-lg">{moment.moment_name}</span>
                    {moment.moment_kind === "witness_contribution" ? (
                      <span className="text-xs uppercase tracking-wide text-ink-soft">
                        Witness messages
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-ink-soft print:hidden">
                    <form action={reorderMoment.bind(null, id, moment.id, "up")}>
                      <button
                        type="submit"
                        disabled={i === 0}
                        className="transition-colors hover:text-wine disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={reorderMoment.bind(null, id, moment.id, "down")}>
                      <button
                        type="submit"
                        disabled={i === (timeline?.length ?? 0) - 1}
                        className="transition-colors hover:text-wine disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                    {moment.moment_kind === "witness_contribution" ? (
                      <form action={removeWitnessContributionMoment.bind(null, id, moment.id)}>
                        <button
                          type="submit"
                          className="text-xs underline underline-offset-2 hover:text-wine"
                        >
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {!hasWitnessContributionMoment ? (
            <form action={addWitnessContributionMoment.bind(null, id)} className="print:hidden">
              <button
                type="submit"
                className="text-sm font-medium text-ink underline underline-offset-2"
              >
                Add witness messages to your programme
              </button>
            </form>
          ) : null}
        </section>
      </main>
    </div>
  );
}
