import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

const VIBE_LABEL: Record<string, string> = {
  spiritual: "Spiritual",
  glam: "Glam",
  minimalist: "Minimalist",
  gothic_romantic: "Gothic Romantic",
  funny: "Funny",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ceremonies } = await supabase
    .from("ceremonies")
    .select("id, vibe, date, location, status")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your ceremonies</h1>
        <SignOutButton />
      </div>

      <Link
        href="/onboarding"
        className="rounded-md bg-black px-4 py-3 text-center text-white"
      >
        Start planning a new ceremony
      </Link>

      {ceremonies && ceremonies.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {ceremonies.map((c) => (
            <li key={c.id}>
              <Link
                href={`/ceremonies/${c.id}/officiant`}
                className="flex items-center justify-between rounded-md border border-black/10 px-4 py-3 hover:bg-black/[.03]"
              >
                <span>
                  {VIBE_LABEL[c.vibe] ?? c.vibe} ceremony
                  {c.location ? ` · ${c.location}` : ""}
                  {c.date ? ` · ${c.date}` : ""}
                </span>
                <span className="text-sm uppercase text-black/50">{c.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-black/60">No ceremonies yet — start your first one above.</p>
      )}
    </main>
  );
}
