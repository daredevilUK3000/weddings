import { notFound } from "next/navigation";
import { getWitnessByToken, markWitnessOpened } from "@/lib/supabase/witness";
import { SealIcon, Wordmark } from "@/components/monogram";
import { WitnessPortalClient } from "./witness-portal-client";

const VIBE_LABEL: Record<string, string> = {
  spiritual: "Spiritual",
  glam: "Glam",
  minimalist: "Minimalist",
  gothic_romantic: "Gothic Romantic",
  funny: "Funny",
};

export default async function WitnessPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getWitnessByToken(token);

  if (!data) {
    notFound();
  }

  await markWitnessOpened(data.witness.id);

  const { witness, ceremony } = data;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3.5 px-6 py-5 text-ink">
          <SealIcon className="h-[56px] w-[56px]" />
          <Wordmark className="text-[28px]" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
        <div>
          <p className="text-sm font-medium text-wine">You&apos;re invited to witness</p>
          <h1 className="mt-1 font-serif text-3xl font-medium">
            {VIBE_LABEL[ceremony.vibe] ?? ceremony.vibe} ceremony
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {[ceremony.date, ceremony.startTime, ceremony.location].filter(Boolean).join(" · ") ||
              "Details to follow"}
          </p>
        </div>

        <p className="max-w-md text-sm text-ink-soft">
          Hello {witness.name.split(" ")[0]} — you&apos;ve been asked to be part of a Witness
          Circle, a small group invited to witness and acknowledge this commitment.
        </p>

        {ceremony.ceremonyStory ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">About this ceremony</h2>
            <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink">
              {ceremony.ceremonyStory}
            </p>
          </section>
        ) : null}

        {ceremony.vows ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Their vows</h2>
            <p className="whitespace-pre-wrap font-serif text-[15px] italic leading-relaxed text-ink">
              {ceremony.vows}
            </p>
          </section>
        ) : null}

        {ceremony.programme && ceremony.programme.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Programme</h2>
            <ol className="flex flex-col gap-1 text-sm text-ink-soft">
              {ceremony.programme.map((m, i) => (
                <li key={i}>{m.momentName}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {ceremony.livestreamUrl ? (
          <a
            href={ceremony.livestreamUrl}
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-sm bg-ink px-4 py-2 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
          >
            Join Ceremony Live
          </a>
        ) : null}

        {ceremony.shareCertificate ? (
          <a
            href={`/api/certificate/pdf?ceremonyId=${witness.ceremonyId}&witnessToken=${token}`}
            target="_blank"
            rel="noreferrer"
            className="w-fit text-sm font-medium text-ink underline underline-offset-2"
          >
            View the certificate
          </a>
        ) : null}

        <WitnessPortalClient
          token={token}
          witness={{
            attendanceType: witness.attendanceType,
            canSignCertificate: witness.canSignCertificate,
            rsvpStatus: witness.rsvpStatus,
            checkedInAt: witness.checkedInAt,
            contribution: witness.contribution,
            signature: witness.signature,
          }}
        />
      </main>
    </div>
  );
}
