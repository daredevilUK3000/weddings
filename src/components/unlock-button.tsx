"use client";

import { useState } from "react";

export function UnlockButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
      return;
    }
    setPending(false);
    setError("Could not start checkout — please try again, or email us below.");
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending}
        className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {pending ? "Starting checkout…" : "Unlock permanently — $49"}
      </button>
      {error ? <p className="text-sm text-wine">{error}</p> : null}
    </div>
  );
}
