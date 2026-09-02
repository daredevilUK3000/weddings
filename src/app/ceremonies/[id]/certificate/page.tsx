import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { CeremonyNav } from "@/components/ceremony-nav";

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

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-rust">Something to keep</p>
            <h1 className="font-serif text-3xl font-medium">Certificate of Self-Commitment</h1>
          </div>
          <a
            href={pdfUrl}
            download
            className="rounded-sm bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-rust"
          >
            Download PDF
          </a>
        </div>
        <iframe
          src={pdfUrl}
          className="h-[80vh] w-full rounded-sm border border-ink/10 bg-ink"
        />
      </main>
    </div>
  );
}
