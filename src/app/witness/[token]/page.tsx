import { notFound } from "next/navigation";
import { getWitnessByToken, markWitnessOpened } from "@/lib/supabase/witness";
import { SealIcon, Wordmark } from "@/components/monogram";

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

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
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
          Circle, a small group invited to witness and acknowledge this commitment. The full
          portal (RSVP, leaving a message, checking in, and signing the certificate) is coming
          shortly.
        </p>
      </main>
    </div>
  );
}
