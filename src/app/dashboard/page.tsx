import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AppHeader } from "@/components/app-header";

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
    <div className="flex min-h-screen flex-col">
      <AppHeader
        right={
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm text-ink-soft underline decoration-ink-soft/30 underline-offset-2 hover:text-ink"
            >
              Visit homepage
            </Link>
            <SignOutButton />
          </div>
        }
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-medium">Your ceremonies</h1>
        </div>

        <Link
          href="/onboarding"
          className="rounded-sm bg-ink px-4 py-3 text-center font-medium text-paper transition-colors hover:bg-rust"
        >
          Start planning a new ceremony
        </Link>

        {ceremonies && ceremonies.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {ceremonies.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ceremonies/${c.id}/officiant`}
                  className="flex items-center justify-between rounded-sm border border-ink/10 bg-white/40 px-4 py-3 transition-colors hover:border-rust/40 hover:bg-white"
                >
                  <span>
                    {VIBE_LABEL[c.vibe] ?? c.vibe} ceremony
                    {c.location ? ` · ${c.location}` : ""}
                    {c.date ? ` · ${c.date}` : ""}
                  </span>
                  <span className="text-sm uppercase tracking-wide text-ink-soft">
                    {c.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-ink/15 bg-stone/60 px-6 py-14 text-center">
            <p className="font-serif text-xl">Nothing planned yet — and that's the point.</p>
            <p className="max-w-sm text-sm text-ink-soft">
              This is the day you build for yourself. Start above and your officiant will walk
              you through it.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
