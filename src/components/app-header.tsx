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
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href={homeHref} className="flex items-center gap-3.5 text-ink">
          <SealIcon className="h-[72px] w-[72px]" />
          <Wordmark className="text-[40px]" />
        </Link>
        {right}
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
