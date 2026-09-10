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
    <div className="bg-wine px-6 py-[13px] text-center text-[13.5px] tracking-[0.2px] text-ivory/90 print:hidden">
      {message} —{" "}
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending}
        className="font-semibold text-champagne underline decoration-champagne/55 underline-offset-2 transition-colors hover:decoration-champagne disabled:opacity-50"
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
