import Link from "next/link";
import type { ReactNode } from "react";
import { SealIcon, Wordmark } from "@/components/monogram";
import { TrialStatusBar } from "@/components/trial-status-bar";
import { createClient } from "@/lib/supabase/server";
import { daysLeftInTrial } from "@/lib/trial-status";

// Async so the trial status bar can show up everywhere AppHeader already
// does — every authenticated page — without each page needing to fetch
// and thread this through itself. Every current caller is already a
// Server Component, so this is a safe conversion (see the commit that
// added this for the audit).
export async function AppHeader({
  homeHref = "/dashboard",
  right,
}: {
  homeHref?: string;
  right?: ReactNode;
}) {
  const daysLeft = await getTrialDaysLeft();

  return (
    <header className="border-b border-ink/10 print:hidden">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <Link href={homeHref} className="flex min-w-0 items-center gap-2.5 text-ink sm:gap-3.5">
          <SealIcon className="h-9 w-9 shrink-0 sm:h-[72px] sm:w-[72px]" />
          <Wordmark className="truncate text-lg sm:text-[40px]" />
        </Link>
        <div className="shrink-0">{right}</div>
      </div>
      {daysLeft !== null ? <TrialStatusBar daysLeft={daysLeft} /> : null}
    </header>
  );
}

async function getTrialDaysLeft(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at, unlocked_at")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return daysLeftInTrial(profile.trial_ends_at, profile.unlocked_at);
}
