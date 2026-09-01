import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { seedTimeline, reorderMoment, selectVowDraft } from "./actions";

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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ceremony builder</h1>
        <nav className="flex gap-4 text-sm underline">
          <Link href={`/ceremonies/${id}/vendors`}>Vendors</Link>
          <Link href={`/ceremonies/${id}/budget`}>Budget</Link>
          <Link href={`/ceremonies/${id}/certificate`}>Certificate</Link>
          <Link href={`/ceremonies/${id}/extras`}>Extras</Link>
        </nav>
      </div>

      {ceremony.ceremony_script ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Ceremony script</h2>
          <pre className="whitespace-pre-wrap rounded-md border border-black/10 p-4 font-sans text-sm">
            {ceremony.ceremony_script}
          </pre>
        </section>
      ) : (
        <p className="text-black/60">
          Your ceremony script hasn&apos;t been generated yet —{" "}
          <Link href={`/ceremonies/${id}/officiant`} className="underline">
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
                className="w-full rounded-md border border-black/10 p-4 text-left text-sm hover:border-black"
              >
                {draft}
              </button>
            </form>
          ))}
        </section>
      ) : ceremony.vows ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Your vows</h2>
          <pre className="whitespace-pre-wrap rounded-md border border-black/10 p-4 font-sans text-sm">
            {ceremony.vows}
          </pre>
        </section>
      ) : null}

      {ceremony.witness_reading ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Witness reading</h2>
          <pre className="whitespace-pre-wrap rounded-md border border-black/10 p-4 font-sans text-sm">
            {ceremony.witness_reading}
          </pre>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Ceremony order</h2>
        <ul className="flex flex-col gap-2">
          {timeline?.map((moment, i) => (
            <li
              key={moment.id}
              className="flex items-center justify-between rounded-md border border-black/10 px-4 py-2"
            >
              <span>{moment.moment_name}</span>
              <div className="flex gap-2">
                <form action={reorderMoment.bind(null, id, moment.id, "up")}>
                  <button type="submit" disabled={i === 0} className="disabled:opacity-30">
                    ↑
                  </button>
                </form>
                <form action={reorderMoment.bind(null, id, moment.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === (timeline?.length ?? 0) - 1}
                    className="disabled:opacity-30"
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
  );
}
