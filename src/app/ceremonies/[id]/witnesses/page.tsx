import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";
import { inviteWitness, removeWitness, requestSignature, updateVowsSharing } from "./actions";
import { computeSharedContent, describeWitnessSharing } from "@/lib/witness-sharing";
import type { WitnessAttendanceType } from "@/lib/types/database";

const ATTENDANCE_LABEL: Record<WitnessAttendanceType, string> = {
  in_person: "Attending in person",
  online: "Joining live online",
  remote_contribution: "Contributing remotely",
  witnessing_afterward: "Witnessing afterward",
};

function statusLabel(
  w: {
    invited_at: string | null;
    opened_at: string | null;
    rsvp_status: string | null;
    checked_in_at: string | null;
  },
  signed: boolean,
): string {
  if (signed) return "Signed the certificate";
  if (w.checked_in_at) return "Checked in";
  if (w.rsvp_status === "declined") return "Declined";
  if (w.rsvp_status === "accepted") return "Accepted — hasn't checked in yet";
  if (w.opened_at) return "Opened the invitation, awaiting RSVP";
  if (w.invited_at) return "Invited, not yet opened";
  return "Invitation pending";
}

export default async function WitnessesPage({
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

  const { data: witnesses } = await supabase
    .from("witnesses")
    .select(
      "id, name, relationship, attendance_type, can_sign_certificate, share_vows, invited_at, opened_at, rsvp_status, checked_in_at",
    )
    .eq("ceremony_id", id)
    .order("created_at");

  const witnessIds = (witnesses ?? []).map((w) => w.id);
  const { data: signatures } = witnessIds.length
    ? await supabase.from("witness_signatures").select("witness_id").in("witness_id", witnessIds)
    : { data: [] as { witness_id: string }[] };
  const signedIds = new Set((signatures ?? []).map((s) => s.witness_id));

  const respondedCount = (witnesses ?? []).filter((w) => w.rsvp_status).length;
  const witnessCount = witnesses?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-12">
        <div>
          <h1 className="font-serif text-3xl font-medium">Witness Circle</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Invite the people you&apos;d like to witness, acknowledge, or contribute to your
            ceremony — whether they&apos;re beside you or somewhere else in the world.
          </p>
          <p className="mt-3 text-xs text-ink-soft">
            Never shared, with anyone: your budget, vendor details, private notes, or Clara
            conversation history.
          </p>
          {witnessCount > 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              {respondedCount} of {witnessCount} invited have responded.
            </p>
          ) : null}
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Add a witness</h2>
          {witnessCount >= 12 ? (
            <p className="text-sm text-ink-soft">
              Your Witness Circle is full — up to 12 witnesses per ceremony.
            </p>
          ) : (
            <form
              action={inviteWitness.bind(null, id)}
              className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="name"
                  placeholder="Name"
                  required
                  className="flex-1 rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="flex-1 rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
                />
              </div>
              <input
                name="relationship"
                placeholder="Relationship (optional)"
                className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
              />
              <select
                name="attendance_type"
                required
                defaultValue=""
                className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Attendance
                </option>
                {Object.entries(ATTENDANCE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" name="can_sign_certificate" defaultChecked />
                Can sign the certificate
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" name="share_vows" />
                Also share my vows with them
              </label>
              <button
                type="submit"
                className="w-fit rounded-sm bg-ink px-4 py-2 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
              >
                Invite
              </button>
            </form>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Your circle</h2>
          {!witnesses || witnesses.length === 0 ? (
            <p className="text-ink-soft">
              No witnesses yet — invite the people you&apos;d like beside you.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {witnesses.map((w) => {
                const shared = computeSharedContent(
                  w.attendance_type,
                  w.can_sign_certificate,
                  w.share_vows,
                );
                return (
                  <li
                    key={w.id}
                    className="flex flex-col gap-2 rounded-sm border border-ink/10 bg-white/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg">{w.name}</p>
                        <p className="text-sm text-ink-soft">
                          {ATTENDANCE_LABEL[w.attendance_type]}
                          {w.relationship ? ` · ${w.relationship}` : ""}
                        </p>
                      </div>
                      <form action={removeWitness.bind(null, id, w.id)}>
                        <button type="submit" className="text-sm text-ink-soft hover:text-wine">
                          Remove
                        </button>
                      </form>
                    </div>
                    <p className="text-sm text-champagne">{statusLabel(w, signedIds.has(w.id))}</p>
                    <p className="text-xs text-ink-soft">
                      {describeWitnessSharing(w.name.split(" ")[0], w.attendance_type, shared)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <form action={updateVowsSharing.bind(null, id, w.id, !w.share_vows)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-ink underline underline-offset-2"
                        >
                          {w.share_vows ? "Stop sharing vows" : "Also share vows"}
                        </button>
                      </form>
                      {w.can_sign_certificate && !signedIds.has(w.id) ? (
                        <form action={requestSignature.bind(null, id, w.id)}>
                          <button
                            type="submit"
                            className="text-xs font-medium text-ink underline underline-offset-2"
                          >
                            Request certificate signature
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
