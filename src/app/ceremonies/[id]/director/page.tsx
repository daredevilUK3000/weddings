import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";
import { ensureStatusProgression } from "@/lib/ceremony-status";
import { computeReadiness } from "@/lib/director/readiness";
import { computeNowNextLater } from "@/lib/director/timeline";
import { DirectorActionButton, LiveWeddingDayView } from "./director-client";
import { VendorBookingStatusEditor } from "@/components/vendor-booking-status-editor";

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
    .select(
      "id, name, booking_status, contact_person, contact_phone, booking_reference, arrival_time, service_start_time, service_end_time, amount_outstanding, vendor_notes",
    )
    .eq("ceremony_id", id);

  const readiness = computeReadiness(ceremony, vendors ?? []);

  const { data: witnesses } = await supabase
    .from("witnesses")
    .select("id, rsvp_status")
    .eq("ceremony_id", id);
  const witnessCount = witnesses?.length ?? 0;
  const respondedCount = (witnesses ?? []).filter((w) => w.rsvp_status).length;
  const witnessIds = (witnesses ?? []).map((w) => w.id);

  const { data: includedContributions } = witnessIds.length
    ? await supabase
        .from("witness_contributions")
        .select("id")
        .in("witness_id", witnessIds)
        .eq("include_in_ceremony", true)
    : { data: [] as { id: string }[] };

  const { data: timeline } = await supabase
    .from("ceremony_timeline")
    .select("id, moment_name, order_index, event_status, time, moment_kind")
    .eq("ceremony_id", id);

  const hasContributionMoment = (timeline ?? []).some(
    (m) => m.moment_kind === "witness_contribution",
  );
  const showOrphanedContributionNudge =
    (includedContributions?.length ?? 0) > 0 && !hasContributionMoment;

  const nowNextLater = computeNowNextLater(
    timeline ?? [],
    (vendors ?? []).map((v) => ({ id: v.id, name: v.name, booking_status: v.booking_status })),
  );

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

        {ceremony.status === "wedding_day" ? (
          <LiveWeddingDayView
            ceremonyDate={ceremony.date}
            startTime={ceremony.start_time}
            nowNextLater={nowNextLater}
          />
        ) : (
          <>
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
                          item.done
                            ? "text-wine"
                            : item.essential
                              ? "text-wine/60"
                              : "text-ink-soft"
                        }
                      >
                        {item.done ? "✓" : item.essential ? "⚠" : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {vendors && vendors.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-medium">Vendors</h2>
                <ul className="flex flex-col gap-3">
                  {vendors.map((v) => (
                    <li key={v.id} className="flex flex-col gap-2">
                      <p className="font-serif text-base">{v.name}</p>
                      <VendorBookingStatusEditor
                        vendor={{
                          id: v.id,
                          bookingStatus: v.booking_status,
                          contactPerson: v.contact_person,
                          contactPhone: v.contact_phone,
                          bookingReference: v.booking_reference,
                          arrivalTime: v.arrival_time,
                          serviceStartTime: v.service_start_time,
                          serviceEndTime: v.service_end_time,
                          amountOutstanding: v.amount_outstanding,
                          vendorNotes: v.vendor_notes,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}

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

        {showOrphanedContributionNudge ? (
          <section className="flex flex-col gap-2 rounded-sm border border-champagne/40 bg-parchment/60 px-5 py-4">
            <p className="text-sm text-ink-soft">
              A witness message is marked for the ceremony, but there&apos;s no Witness Contribution
              moment in your programme yet.{" "}
              <Link
                href={`/ceremonies/${id}/builder`}
                className="font-medium text-ink underline underline-offset-2"
              >
                Add one in Builder
              </Link>
              .
            </p>
          </section>
        ) : null}

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
