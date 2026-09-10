"use client";

import { useState } from "react";

// The countdown this is built on only works if the user actually sees it
// coming — this is the piece that was missing before the hard lock on
// /locked. Understated by design: no red, no urgency styling, just a
// standing reminder with a way to skip straight to checkout.
export function TrialStatusBar({ daysLeft }: { daysLeft: number }) {
  const [pending, setPending] = useState(false);

  async function startCheckout() {
    setPending(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
      return;
    }
    setPending(false);
  }

  const message =
    daysLeft <= 1
      ? "Your trial ends tomorrow"
      : `${daysLeft} days left in your trial`;

  return (
    <div className="border-b border-champagne/30 bg-parchment/50 px-6 py-2 text-center text-sm text-ink-soft print:hidden">
      {message} —{" "}
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending}
        className="font-medium text-ink underline decoration-champagne underline-offset-2 transition-colors hover:text-wine disabled:opacity-50"
      >
        {pending
          ? "Starting checkout…"
          : daysLeft <= 1
            ? "unlock now to keep your ceremony"
            : "unlock your ceremony permanently for $49"}
      </button>
    </div>
  );
}
