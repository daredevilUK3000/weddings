"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ceremonyStartDate, formatRelativeTime } from "@/lib/datetime";
import type { NowNextLater } from "@/lib/director/timeline";

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

// Brief §4.4: on the wedding day, planning navigation recedes — a calm,
// chronological NOW/NEXT/LATER view replaces the readiness checklist.
// Bucketing itself is server-computed (computeNowNextLater); this just
// keeps the relative-time text fresh with a periodic re-render.
export function LiveWeddingDayView({
  ceremonyDate,
  startTime,
  nowNextLater,
}: {
  ceremonyDate: string | null;
  startTime: string | null;
  nowNextLater: NowNextLater;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const startDate = ceremonyStartDate(ceremonyDate, startTime);
  const countdown = startDate ? formatRelativeTime(startDate, new Date()) : null;
  const { activeMoment, arrivedVendors, next, later } = nowNextLater;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2 rounded-sm border border-champagne/50 bg-white/70 px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-champagne">Now</p>
        {activeMoment ? (
          <p className="font-serif text-xl">{activeMoment.label}</p>
        ) : (
          <>
            <p className="font-serif text-xl">Get ready for your ceremony</p>
            {countdown ? (
              <p className="text-sm text-ink-soft">Your ceremony begins {countdown}.</p>
            ) : null}
          </>
        )}
        {arrivedVendors.map((v) => (
          <p key={v.id} className="text-sm text-ink-soft">
            Your {v.label} has arrived.
          </p>
        ))}
      </section>

      {next ? (
        <section className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">Next</p>
          <p className="font-serif text-lg">
            {next.time ? `${next.time} — ` : ""}
            {next.label}
          </p>
        </section>
      ) : null}

      {later.length > 0 ? (
        <section className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">Later</p>
          <ul className="flex flex-col gap-1">
            {later.map((event) => (
              <li key={event.id} className="text-sm text-ink-soft">
                {event.time ? `${event.time} — ` : ""}
                {event.label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
