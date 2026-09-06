"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ceremonyStartDate, formatRelativeTime } from "@/lib/datetime";
import { getDirectorMessage } from "@/lib/director/messages";
import { ClaraMessage } from "@/components/clara-message";
import type { NowNextLater } from "@/lib/director/timeline";
import type { MomentKind, TimelineEventStatus } from "@/lib/types/database";

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
      <ClaraMessage
        label="Wedding Director"
        message={getDirectorMessage("wedding_day_started")}
      />

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

interface CeremonyMoment {
  id: string;
  momentName: string;
  eventStatus: TimelineEventStatus;
  momentKind: MomentKind | null;
}

interface IncludedMessage {
  witnessName: string;
  body: string;
}

const TERMINAL_STATUSES: TimelineEventStatus[] = ["completed", "skipped"];

// Brief §4.5: a dedicated, minimal interface for the ceremony itself —
// large typography, one moment at a time, sequence read directly from
// Ceremony Builder (never edited here). "Mark complete" advances through
// the same ordered rows Builder produced; a witness_contribution moment
// reads the messages marked for inclusion instead of showing a bare title.
export function CeremonyModeView({
  ceremonyId,
  moments: initialMoments,
  includedMessages,
}: {
  ceremonyId: string;
  moments: CeremonyMoment[];
  includedMessages: IncludedMessage[];
}) {
  const [moments, setMoments] = useState(initialMoments);
  const [completing, setCompleting] = useState(false);

  const currentMoment = moments.find((m) => !TERMINAL_STATUSES.includes(m.eventStatus)) ?? null;
  const currentId = currentMoment?.id;
  const currentStatus = currentMoment?.eventStatus;

  useEffect(() => {
    if (!currentId || currentStatus === "active") return;
    fetch("/api/director/timeline-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ momentId: currentId, eventStatus: "active" }),
    }).then((res) => {
      if (res.ok) {
        setMoments((prev) =>
          prev.map((m) => (m.id === currentId ? { ...m, eventStatus: "active" } : m)),
        );
      }
    });
  }, [currentId, currentStatus]);

  async function handleComplete() {
    if (!currentMoment) return;
    setCompleting(true);
    const res = await fetch("/api/director/timeline-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ momentId: currentMoment.id, eventStatus: "completed" }),
    });
    setCompleting(false);
    if (res.ok) {
      setMoments((prev) =>
        prev.map((m) => (m.id === currentMoment.id ? { ...m, eventStatus: "completed" } : m)),
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-10 text-center">
      <ClaraMessage label="Wedding Director" message={getDirectorMessage("ceremony_started")} />

      {currentMoment ? (
        <div className="flex flex-col items-center gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">Now</p>
          <h1 className="font-serif text-3xl font-medium">{currentMoment.momentName}</h1>

          {currentMoment.momentKind === "witness_contribution" ? (
            <div className="flex max-w-md flex-col gap-4 text-left">
              {includedMessages.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  No witness messages were marked for the ceremony.
                </p>
              ) : (
                includedMessages.map((m, i) => (
                  <div key={i} className="rounded-sm border border-champagne/40 bg-white/60 p-4">
                    <p className="font-serif text-[15px] italic leading-relaxed">{m.body}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-ink-soft">
                      {m.witnessName}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <button
            onClick={handleComplete}
            disabled={completing}
            className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50"
          >
            {completing ? "…" : "Mark complete"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-ink-soft">Every moment is complete.</p>
          <DirectorActionButton
            ceremonyId={ceremonyId}
            action="finish_ceremony"
            label="Finish Ceremony"
          />
        </div>
      )}
    </div>
  );
}
