import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";
import { Eyebrow } from "@/components/eyebrow";
import { Watermark } from "@/components/watermark";
import {
  PRIMARY_BUTTON_CLASS,
  RISE_IN_HEADLINE,
  RISE_IN_FIELD,
  RISE_IN_ACTIONS,
} from "@/lib/design-tokens";

export default async function CertificatePage({
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

  const pdfUrl = `/api/certificate/pdf?ceremonyId=${id}`;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <CeremonyNav ceremonyId={id} />

      <main className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 overflow-hidden px-6 py-12">
        <Watermark corner="left" size="mid" />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Something to keep</Eyebrow>
            <h1
              className={`mt-3 font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] text-ink min-[701px]:text-[56px] ${RISE_IN_HEADLINE}`}
            >
              Certificate of Self-Commitment
            </h1>
            <p className={`mt-3 max-w-md font-serif text-lg text-ink-soft italic ${RISE_IN_FIELD}`}>
              Print it, frame it, keep it somewhere you&apos;ll see it.
            </p>
          </div>
          <a href={pdfUrl} download className={`${PRIMARY_BUTTON_CLASS} ${RISE_IN_ACTIONS}`}>
            Download PDF
          </a>
        </div>

        <div className={`relative z-10 ${RISE_IN_FIELD}`}>
          <div className="relative border border-champagne/40 bg-ivory p-3 shadow-[0_24px_60px_rgba(32,32,29,0.10)]">
            <span
              aria-hidden
              className="absolute top-0 left-0 h-6 w-6 border-t border-l border-champagne"
            />
            <span
              aria-hidden
              className="absolute right-0 bottom-0 h-6 w-6 border-r border-b border-champagne"
            />
            <iframe src={pdfUrl} className="h-[80vh] w-full rounded-sm border border-ink/10 bg-ink" />
          </div>
        </div>
      </main>
    </div>
  );
}
