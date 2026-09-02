"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCeremony } from "./actions";

export const PENDING_CEREMONY_KEY = "wf1_pending_ceremony";

const VIBES = [
  { value: "spiritual", label: "Spiritual" },
  { value: "glam", label: "Glam" },
  { value: "minimalist", label: "Minimalist" },
  { value: "gothic_romantic", label: "Gothic Romantic" },
  { value: "funny", label: "Funny" },
];

const BUDGET_BANDS = ["Under $1,000", "$1,000–$3,000", "$3,000–$7,000", "$7,000+"];

const PRIORITIES = [
  { value: "venue", label: "Venue" },
  { value: "photography", label: "Photography" },
  { value: "catering", label: "Food" },
  { value: "florist", label: "Flowers" },
  { value: "hair_makeup", label: "Hair & Makeup" },
];

interface Answers {
  reason: string;
  vibe: string;
  location: string;
  date: string;
  guest_count: number;
  budget_band: string;
  priorities: string[];
}

const EMPTY_ANSWERS: Answers = {
  reason: "",
  vibe: "",
  location: "",
  date: "",
  guest_count: 0,
  budget_band: "",
  priorities: [],
};

type Step = "reason" | "reveal" | "vibe" | "place" | "people" | "summary" | "auth" | "sent";

function answersToFormData(answers: Answers): FormData {
  const fd = new FormData();
  fd.set("reason", answers.reason);
  fd.set("vibe", answers.vibe);
  fd.set("guest_count", String(answers.guest_count || 0));
  if (answers.date) fd.set("date", answers.date);
  if (answers.location) fd.set("location", answers.location);
  if (answers.budget_band) fd.set("budget_band", answers.budget_band);
  for (const p of answers.priorities) fd.append("priority", p);
  return fd;
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="max-w-lg font-serif text-3xl font-medium leading-tight sm:text-[40px]">
      {children}
    </h1>
  );
}

function ContinueButton({
  onClick,
  disabled,
  type = "button",
  children = "Continue",
}: {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  children?: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-fit rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-40 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

export function OnboardingFlow({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [step, setStep] = useState<Step>("reason");
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleEnter() {
    if (isAuthenticated) {
      setSubmitting(true);
      await createCeremony(answersToFormData(answers));
      return;
    }
    setStep("auth");
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      window.localStorage.setItem(PENDING_CEREMONY_KEY, JSON.stringify(answers));
    } catch {
      // localStorage unavailable — the completion step will show a friendly fallback.
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/complete` },
    });

    setSubmitting(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setStep("sent");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-8 px-6 py-16">
      {step === "reason" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]">
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            Let&apos;s begin with one question
          </p>
          <Prompt>Why are you doing this?</Prompt>
          <textarea
            autoFocus
            rows={3}
            value={answers.reason}
            onChange={(e) => update("reason", e.target.value)}
            placeholder="A milestone, a recovery, a career win, a simple yes to yourself…"
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 font-serif text-lg outline-none focus:border-champagne"
          />
          <ContinueButton
            disabled={!answers.reason.trim()}
            onClick={() => setStep("reveal")}
          />
        </div>
      ) : null}

      {step === "reveal" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.6s_ease]">
          <p className="font-serif text-2xl italic leading-relaxed sm:text-3xl">
            &ldquo;{answers.reason}&rdquo;
          </p>
          <p className="text-sm text-ink-soft">That&apos;s going into your ceremony.</p>
          <ContinueButton onClick={() => setStep("vibe")} />
        </div>
      ) : null}

      {step === "vibe" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]">
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            The tone
          </p>
          <Prompt>What does this ceremony feel like?</Prompt>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VIBES.map((v) => (
              <button
                key={v.value}
                onClick={() => update("vibe", v.value)}
                className={`rounded-sm border px-3 py-3 text-sm transition-colors ${
                  answers.vibe === v.value
                    ? "border-champagne bg-champagne/15"
                    : "border-ink/15 bg-white hover:border-champagne/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <ContinueButton disabled={!answers.vibe} onClick={() => setStep("place")} />
        </div>
      ) : null}

      {step === "place" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]">
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            The place and day
          </p>
          <Prompt>Where would you love to do it?</Prompt>
          <input
            autoFocus
            value={answers.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="City, region… (or leave it open for now)"
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 font-serif text-lg outline-none focus:border-champagne"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-soft">A date, if you have one in mind</span>
            <input
              type="date"
              value={answers.date}
              onChange={(e) => update("date", e.target.value)}
              className="w-fit rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-champagne"
            />
          </label>
          <ContinueButton onClick={() => setStep("people")} />
        </div>
      ) : null}

      {step === "people" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]">
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            Your people, your budget
          </p>
          <Prompt>Who do you want beside you, and what matters most?</Prompt>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink-soft">Guest count</span>
            <input
              type="number"
              min={0}
              value={answers.guest_count}
              onChange={(e) => update("guest_count", Number(e.target.value) || 0)}
              className="w-32 rounded-sm border border-ink/15 bg-white px-3 py-2 outline-none focus:border-champagne"
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-ink-soft">Budget</span>
            <div className="flex flex-wrap gap-2">
              {BUDGET_BANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => update("budget_band", b)}
                  className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                    answers.budget_band === b
                      ? "border-champagne bg-champagne/15"
                      : "border-ink/15 bg-white hover:border-champagne/60"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-ink-soft">
              What matters most — choose as many as you like
            </span>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const checked = answers.priorities.includes(p.value);
                return (
                  <button
                    key={p.value}
                    onClick={() =>
                      update(
                        "priorities",
                        checked
                          ? answers.priorities.filter((x) => x !== p.value)
                          : [...answers.priorities, p.value],
                      )
                    }
                    className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? "border-champagne bg-champagne/15"
                        : "border-ink/15 bg-white hover:border-champagne/60"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <ContinueButton onClick={() => setStep("summary")} />
        </div>
      ) : null}

      {step === "summary" ? (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.6s_ease]">
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            Your ceremony
          </p>
          <Prompt>We&apos;ve got the beginning of your day.</Prompt>
          <div className="rounded-sm border border-champagne/50 bg-white px-6 py-6">
            <p className="font-serif text-xl">
              {VIBES.find((v) => v.value === answers.vibe)?.label ?? "Your"} ceremony
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {[answers.date, answers.location].filter(Boolean).join(" · ") ||
                "Details still open — you can shape them later."}
            </p>
          </div>
          <ContinueButton disabled={submitting} onClick={handleEnter}>
            {submitting ? "Entering…" : "Enter your ceremony →"}
          </ContinueButton>
        </div>
      ) : null}

      {step === "auth" ? (
        <form
          onSubmit={handleCreateAccount}
          className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease]"
        >
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            One last thing
          </p>
          <Prompt>Save your ceremony so it&apos;s waiting for you.</Prompt>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-champagne"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-champagne"
          />
          {authError ? <p className="text-sm text-wine">{authError}</p> : null}
          <ContinueButton type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save & continue"}
          </ContinueButton>
        </form>
      ) : null}

      {step === "sent" ? (
        <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.6s_ease]">
          <div className="mx-auto h-px w-10 bg-champagne" />
          <Prompt>Check your email.</Prompt>
          <p className="text-ink-soft">
            We sent a confirmation link to {email}. Follow it, and your ceremony will be waiting
            for you.
          </p>
        </div>
      ) : null}
    </main>
  );
}
