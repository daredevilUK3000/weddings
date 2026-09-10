import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { AppHeader } from "@/components/app-header";
import { CeremonyDangerActions } from "@/components/ceremony-danger-actions";
import { Watermark } from "@/components/watermark";
import { ButtonArrowIcon } from "@/components/button-arrow-icon";
import {
  PRIMARY_BUTTON_HERO_CLASS,
  RISE_IN_HERO_HEADLINE,
  RISE_IN_HERO_SUBHEAD,
  RISE_IN_HERO_CTA,
  RISE_IN_HERO_CARD,
} from "@/lib/design-tokens";
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

// Bold empty-state treatment — a brand-new user's first view, before any
// ceremony exists. Deliberately a step up from the site's usual restraint
// (see WeddingsStuff for Claude/weddingsforone-bold-dashboard-build-brief).
// Only shown when there are zero ceremonies; the populated state below is
// untouched.
function EmptyStateHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-16 px-7 pt-[60px] pb-[90px] min-[881px]:grid-cols-[1.15fr_0.85fr] min-[881px]:px-12 min-[881px]:pt-[90px] min-[881px]:pb-[140px]">
        <Watermark corner="left" size="hero" />

        <div className="relative z-10">
          <div className="mb-7 h-px w-10 bg-champagne" />
          <h1 className={`m-0 font-serif text-[56px] font-medium leading-[0.98] tracking-[-0.5px] min-[881px]:text-[88px] ${RISE_IN_HERO_HEADLINE}`}>
            Your
            <br />
            ceremony
            <br />
            <em className="font-normal text-dusty-rose italic">begins here.</em>
          </h1>
          <p className={`mb-12 max-w-[420px] font-serif text-2xl text-ink/65 italic ${RISE_IN_HERO_SUBHEAD}`}>
            Not a project. An occasion.
          </p>
          <div className={`flex items-center gap-5 ${RISE_IN_HERO_CTA}`}>
            <Link href="/onboarding" className={PRIMARY_BUTTON_HERO_CLASS}>
              Start planning a new ceremony
              <ButtonArrowIcon />
            </Link>
          </div>
        </div>

        <div className={`relative z-10 ${RISE_IN_HERO_CARD}`}>
          <div className="group relative rotate-[1.4deg] border border-champagne/40 bg-ivory px-10 py-14 text-center shadow-[0_24px_60px_rgba(32,32,29,0.10)] transition-transform duration-[400ms] ease-out hover:rotate-0">
            <span
              aria-hidden
              className="absolute top-[14px] left-[14px] h-[26px] w-[26px] border-t border-l border-champagne"
            />
            <span
              aria-hidden
              className="absolute right-[14px] bottom-[14px] h-[26px] w-[26px] border-r border-b border-champagne"
            />
            <div aria-hidden className="mb-1 font-serif text-[64px] leading-none text-champagne">
              &ldquo;
            </div>
            <h2 className="mt-1 mb-4 font-serif text-[25px] leading-[1.3] font-medium text-wine italic">
              Nothing planned yet —
              <br />
              and that&apos;s the point.
            </h2>
            <div className="mx-auto my-[22px] h-px w-8 bg-dusty-rose" />
            <p className="text-[13.5px] leading-[1.7] text-ink/60">
              This is the day you build for yourself.
              <br />
              Your officiant will walk you through it,
              <br />
              one question at a time.
            </p>
          </div>
          <p className="mt-[18px] text-center text-xs tracking-[0.3px] text-ink/40">
            Your certificate will look something like this
          </p>
        </div>
      </div>
    </div>
  );
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
        <CeremonyDangerActions ceremonyId={c.id} variant="kebab" />
      </div>
      <Link href={primaryHref} className="flex flex-col gap-4">
        <div className="pr-24">
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

      {ceremonies && ceremonies.length > 0 ? (
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

          <ul className="flex flex-col gap-4">
            {ceremonies.map((c) => (
              <li key={c.id}>
                <CeremonyCard c={c} />
              </li>
            ))}
          </ul>
        </main>
      ) : (
        <main className="flex flex-1 flex-col justify-center">
          <EmptyStateHero />
        </main>
      )}
    </div>
  );
}
