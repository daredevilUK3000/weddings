import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OfficiantChat } from "./chat-client";

export default async function OfficiantPage({
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

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-2xl flex-col gap-4 px-6 py-8">
      <h1 className="text-xl font-semibold">Your AI officiant</h1>
      <OfficiantChat ceremonyId={id} />
    </main>
  );
}
