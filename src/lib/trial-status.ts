// Pure day-count logic for the trial status bar (src/components/app-header.tsx,
// src/components/trial-status-bar.tsx) — kept separate from the Supabase
// fetch so it's directly testable.
//
// Returns null when the bar shouldn't show at all: no trial data, already
// unlocked, or the trial has already expired (the /locked screen owns that
// message — this bar would otherwise duplicate or contradict it).
export function daysLeftInTrial(
  trialEndsAt: string | null | undefined,
  unlockedAt: string | null | undefined,
): number | null {
  if (!trialEndsAt || unlockedAt) return null;

  const msLeft = new Date(trialEndsAt).getTime() - Date.now();
  if (msLeft <= 0) return null;

  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
}
