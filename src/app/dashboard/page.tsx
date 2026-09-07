import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AppHeader } from "@/components/app-header";
import { DeleteCeremonyButton } from "@/components/delete-ceremony-button";
import type { CeremonyStatus } from "@/lib/types/database";

const VIBE_LABEL: Record<string, string> = {
  spiritual: "Spiritual",
  glam: "Glam",
  minimalist: "Minimalist",
  gothic_romantic: "Gothic Romantic",
  funny: "Funny",
};

const VIBE_TAGLINE: Record<string, string> = {
  spiritual: "The day you meet yourself, quietly.",
  glam: "The day you become impossible to look away from.",
  minimalist: "The day, stripped down to what matters.",
  gothic_romantic: "The day you commit to yourself, dramatically.",
  funny: "The day you finally stop taking this so seriously.",
};

interface Ceremony {
  id: string;
  vibe: string;
  date: string | null;
  location: string | null;
  ceremony_script: string | null;
  vows: string | null;
  status: CeremonyStatus;
}

function Stage({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-ink/8 py-2.5 text-sm first:border-t-0">
      <span>{label}</span>
      <span className={done ? "text-wine" : "text-ink-soft"}>
        {done ? "Complete" : "In progress"}
      </span>
    </div>
  );
}

// Brief §4.1: "Prepare My Wedding Day" before the essentials are done,
// "Start My Wedding Day" once ready and the ceremony date has arrived.
function directorLabel(status: CeremonyStatus, isCeremonyDay: boolean): string {
  switch (status) {
    case "wedding_day":
      return "Continue Your Wedding Day";
    case "ceremony_active":
      return "Continue Your Ceremony";
    case "completed":
      return "View Wedding Day";
    case "ready":
      return isCeremonyDay ? "Start My Wedding Day" : "Wedding Director";
    default:
      return "Prepare My Wedding Day";
  }
}

function CeremonyCard({ c }: { c: Ceremony }) {
  const stages = [
    { label: "Ceremony", done: !!c.ceremony_script },
    { label: "Your vows", done: !!c.vows },
    { label: "Your place", done: !!c.location },
  ];
  const doneCount = stages.filter((s) => s.done).length;
  // Once the officiant interview has produced a script, "continue" should
  // mean "view what you built" (builder), not "start the interview over" —
  // the officiant route always begins its conversation at question one.
  const primaryHref = c.ceremony_script
    ? `/ceremonies/${c.id}/builder`
    : `/ceremonies/${c.id}/officiant`;
  const isCeremonyDay = c.date === new Date().toISOString().slice(0, 10);

  return (
    <div className="relative flex flex-col gap-4 rounded-sm border border-ink/10 bg-white/40 px-6 py-6 transition-all hover:border-champagne/50 hover:bg-white">
      <div className="absolute right-4 top-4">
        <DeleteCeremonyButton ceremonyId={c.id} variant="kebab" />
      </div>
      <Link href={primaryHref} className="flex flex-col gap-4">
        <div className="pr-10">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-champagne">
            Your ceremony
          </p>
          <h2 className="mt-1 font-serif text-2xl font-medium">
            {VIBE_LABEL[c.vibe] ?? c.vibe} ceremony
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {[c.date, c.location].filter(Boolean).join(" · ") || "Details still open"}
          </p>
          <p className="mt-2 font-serif text-base italic text-ink-soft">
            {VIBE_TAGLINE[c.vibe] ?? "The day you're choosing yourself."}
          </p>
        </div>

        <div>
          {stages.map((s) => (
            <Stage key={s.label} label={s.label} done={s.done} />
          ))}
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {doneCount} of {stages.length} stages complete
        </p>
      </Link>

      <Link
        href={`/ceremonies/${c.id}/director`}
        className="w-fit rounded-sm border border-champagne/60 bg-parchment/40 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-champagne hover:bg-parchment"
      >
        {directorLabel(c.status, isCeremonyDay)}
      </Link>
    </div>
  );
}

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
    .select("id, vibe, date, location, ceremony_script, vows, status")
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
        <div>
          <h1 className="font-serif text-3xl font-medium">Your ceremony</h1>
          <p className="mt-1 text-sm text-ink-soft">Not a project. An occasion.</p>
        </div>

        <Link
          href="/onboarding"
          className="rounded-sm bg-ink px-4 py-3 text-center font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
        >
          Start planning a new ceremony
        </Link>

        {ceremonies && ceremonies.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {ceremonies.map((c) => (
              <li key={c.id}>
                <CeremonyCard c={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-ink/15 bg-parchment/60 px-6 py-14 text-center">
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
