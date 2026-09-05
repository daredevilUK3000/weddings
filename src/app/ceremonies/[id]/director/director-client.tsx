"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DirectorAction = "start_wedding_day" | "begin_ceremony" | "finish_ceremony";

export function DirectorActionButton({
  ceremonyId,
  action,
  label,
  disabled,
  disabledReason,
}: {
  ceremonyId: string;
  action: DirectorAction;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/director/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ceremonyId, action }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const { error: message } = await res.json();
      setError(message ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || submitting}
        title={disabled ? disabledReason : undefined}
        className="w-fit rounded-sm bg-ink px-5 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {submitting ? "…" : label}
      </button>
      {disabled && disabledReason ? (
        <p className="text-xs text-ink-soft">{disabledReason}</p>
      ) : null}
      {error ? <p className="text-xs text-wine">{error}</p> : null}
    </div>
  );
}
