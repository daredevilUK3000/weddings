"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The webhook usually beats the checkout redirect back to the app, but not
// always — this re-runs the server component every 2s until it observes
// unlocked_at set, rather than showing a hard failure on a simple race.
export function UnlockPoller() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
