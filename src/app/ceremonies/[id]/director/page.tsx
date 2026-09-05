import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";
import { ensureStatusProgression } from "@/lib/ceremony-status";
import { computeReadiness } from "@/lib/director/readiness";
import { DirectorActionButton } from "./director-client";

export default async function DirectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ownershipCheck } = await supabase
    .from("ceremonies")
    .select("id")
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
    .single();
  if (!ownershipCheck) {
    notFound();
  }

  await ensureStatusProgression(id);

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("status, ceremony_script, vows, date, location, start_time")
    .eq("id", id)
    .single();
  if (!ceremony) {
    notFound();
  }

  const { data: vendors } = await supabase
    .from("vendor_shortlist")
    .select("booking_status")
    .eq("ceremony_id", id);

  const readiness = computeReadiness(ceremony, vendors ?? []);

  const { data: witnesses } = await supabase
    .from("witnesses")
    .select("rsvp_status")
    .eq("ceremony_id", id);
  const witnessCount = witnesses?.length ?? 0;
  const respondedCount = (witnesses ?? []).filter((w) => w.rsvp_status).length;

  const isCeremonyDay = ceremony.date === new Date().toISOString().slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
        <div>
          <p className="text-sm font-medium text-wine">Your Wedding Day</p>
          <h1 className="mt-1 font-serif text-3xl font-medium">Wedding Director</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Everything you&apos;ve planned, brought together into one beautifully organised
            wedding-day experience.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium">Readiness</h2>
            <span className="font-serif text-2xl text-champagne">{readiness.score}%</span>
          </div>
          <div className="rounded-sm border border-ink/10 bg-white/60 px-2 py-2">
            <ul>
              {readiness.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-4 border-t border-ink/8 px-4 py-3 first:border-t-0"
                >
                  <span className="text-sm">{item.label}</span>
                  <span
                    className={
                      item.done ? "text-wine" : item.essential ? "text-wine/60" : "text-ink-soft"
                    }
                  >
                    {item.done ? "✓" : item.essential ? "⚠" : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-sm border border-champagne/40 bg-parchment/60 px-5 py-4">
          <h2 className="text-sm font-medium">Your Witness Circle</h2>
          {witnessCount > 0 ? (
            <p className="text-sm text-ink-soft">
              {respondedCount} of {witnessCount} invited have responded.
            </p>
          ) : (
            <p className="text-sm text-ink-soft">No witnesses invited yet.</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          {ceremony.status === "ready" ? (
            <DirectorActionButton
              ceremonyId={id}
              action="start_wedding_day"
              label="Start My Wedding Day"
              disabled={!isCeremonyDay}
              disabledReason={isCeremonyDay ? undefined : "This opens on your ceremony date."}
            />
          ) : ceremony.status === "wedding_day" ? (
            <DirectorActionButton ceremonyId={id} action="begin_ceremony" label="Begin Ceremony" />
          ) : ceremony.status === "ceremony_active" ? (
            <DirectorActionButton
              ceremonyId={id}
              action="finish_ceremony"
              label="Finish Ceremony"
            />
          ) : ceremony.status === "completed" ? (
            <p className="text-sm text-champagne">Your ceremony is complete.</p>
          ) : (
            <p className="text-sm text-ink-soft">
              Keep preparing — once the essentials above are complete, Wedding Director will be
              ready for your big day.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
