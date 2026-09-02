"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createCeremony } from "../actions";
import { PENDING_CEREMONY_KEY } from "../onboarding-flow";

interface StoredAnswers {
  reason: string;
  vibe: string;
  location: string;
  date: string;
  guest_count: number;
  budget_band: string;
  priorities: string[];
}

export default function OnboardingCompletePage() {
  const [status, setStatus] = useState<"working" | "missing">("working");

  useEffect(() => {
    const raw = window.localStorage.getItem(PENDING_CEREMONY_KEY);
    if (!raw) {
      setStatus("missing");
      return;
    }

    let answers: StoredAnswers;
    try {
      answers = JSON.parse(raw);
    } catch {
      setStatus("missing");
      return;
    }

    window.localStorage.removeItem(PENDING_CEREMONY_KEY);

    const fd = new FormData();
    fd.set("reason", answers.reason ?? "");
    fd.set("vibe", answers.vibe ?? "");
    fd.set("guest_count", String(answers.guest_count ?? 0));
    if (answers.date) fd.set("date", answers.date);
    if (answers.location) fd.set("location", answers.location);
    if (answers.budget_band) fd.set("budget_band", answers.budget_band);
    for (const p of answers.priorities ?? []) fd.append("priority", p);

    // createCeremony redirects on success — do not wrap in try/catch,
    // which would swallow the redirect's internal throw.
    createCeremony(fd);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {status === "working" ? (
        <p className="font-serif text-2xl">Finishing your ceremony…</p>
      ) : (
        <>
          <p className="font-serif text-2xl">We couldn&apos;t find your answers.</p>
          <p className="text-ink-soft">
            That can happen if this link was opened somewhere new. Let&apos;s begin again.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
          >
            Start over
          </Link>
        </>
      )}
    </main>
  );
}
