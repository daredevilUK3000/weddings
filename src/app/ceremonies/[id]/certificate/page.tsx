import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Certificate of Self-Commitment</h1>
        <a href={pdfUrl} download className="rounded-md bg-black px-4 py-2 text-white">
          Download PDF
        </a>
      </div>
      <iframe src={pdfUrl} className="h-[80vh] w-full rounded-md border border-black/10" />
    </main>
  );
}
