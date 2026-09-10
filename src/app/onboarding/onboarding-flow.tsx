"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCeremony } from "./actions";
import { Eyebrow } from "@/components/eyebrow";
import { Watermark } from "@/components/watermark";
import { ButtonArrowIcon } from "@/components/button-arrow-icon";
import {
  PRIMARY_BUTTON_CLASS,
  INPUT_CLASS,
  INPUT_EMOTIONAL_CLASS,
  RISE_IN_HEADLINE,
  RISE_IN_FIELD,
  RISE_IN_ACTIONS,
} from "@/lib/design-tokens";

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
  name: string;
  reason: string;
  vibe: string;
  location: string;
  date: string;
  guest_count: number;
  budget_band: string;
  priorities: string[];
}

const EMPTY_ANSWERS: Answers = {
  name: "",
  reason: "",
  vibe: "",
  location: "",
  date: "",
  guest_count: 0,
  budget_band: "",
  priorities: [],
};

type Step = "reason" | "reveal" | "name" | "vibe" | "place" | "people" | "summary" | "auth" | "sent";

function answersToFormData(answers: Answers): FormData {
  const fd = new FormData();
  fd.set("name", answers.name);
  fd.set("reason", answers.reason);
  fd.set("vibe", answers.vibe);
  fd.set("guest_count", String(answers.guest_count || 0));
  if (answers.date) fd.set("date", answers.date);
  if (answers.location) fd.set("location", answers.location);
  if (answers.budget_band) fd.set("budget_band", answers.budget_band);
  for (const p of answers.priorities) fd.append("priority", p);
  return fd;
}

// Mid-flow headline — 56px desktop / 38px mobile per the design system's
// scale for "an individual onboarding question," matching
// onboarding-question-mockup-bold.html exactly (700px breakpoint, 1.05
// line-height, -0.3px tracking).
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className={`m-0 max-w-lg font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] min-[701px]:text-[56px] ${RISE_IN_HEADLINE}`}
    >
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
    <div className={`flex items-center ${RISE_IN_ACTIONS}`}>
      <button type={type} onClick={onClick} disabled={disabled} className={PRIMARY_BUTTON_CLASS}>
        {children}
        <ButtonArrowIcon />
      </button>
    </div>
  );
}

// Wraps a step's content with the shared watermark (alternating corner
// per step so a run of questions doesn't feel identically stamped) and
// the relative/z-10 scaffolding every "moment" screen needs.
function QuestionScreen({
  corner,
  children,
}: {
  corner: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Watermark corner={corner} size="mid" />
      <div className="relative z-10 flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function OnboardingFlow({
  isAuthenticated,
  existingName,
}: {
  isAuthenticated: boolean;
  existingName?: string | null;
}) {
  const [step, setStep] = useState<Step>("reason");
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...EMPTY_ANSWERS,
    name: existingName ?? "",
  }));
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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center overflow-hidden px-6 py-16">
      {step === "reason" ? (
        <QuestionScreen corner="right">
          <Eyebrow>Let&apos;s begin with one question</Eyebrow>
          <Prompt>Why are you doing this?</Prompt>
          <textarea
            autoFocus
            rows={3}
            value={answers.reason}
            onChange={(e) => update("reason", e.target.value)}
            placeholder="A milestone, a recovery, a career win, a simple yes to yourself…"
            className={`${INPUT_EMOTIONAL_CLASS} ${RISE_IN_FIELD}`}
          />
          <ContinueButton disabled={!answers.reason.trim()} onClick={() => setStep("reveal")} />
        </QuestionScreen>
      ) : null}

      {step === "reveal" ? (
        <QuestionScreen corner="left">
          <p className={`font-serif text-2xl italic leading-relaxed sm:text-3xl ${RISE_IN_HEADLINE}`}>
            &ldquo;{answers.reason}&rdquo;
          </p>
          <p className={`text-sm text-ink-soft ${RISE_IN_FIELD}`}>That&apos;s going into your ceremony.</p>
          <ContinueButton onClick={() => setStep(existingName ? "vibe" : "name")} />
        </QuestionScreen>
      ) : null}

      {step === "name" ? (
        <QuestionScreen corner="right">
          <Eyebrow>Making this feel like yours</Eyebrow>
          <Prompt>What should we call you?</Prompt>
          <input
            autoFocus
            value={answers.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your first name is plenty"
            className={`${INPUT_EMOTIONAL_CLASS} ${RISE_IN_FIELD}`}
          />
          <ContinueButton disabled={!answers.name.trim()} onClick={() => setStep("vibe")} />
        </QuestionScreen>
      ) : null}

      {step === "vibe" ? (
        <QuestionScreen corner="left">
          <Eyebrow>The tone</Eyebrow>
          <Prompt>What does this ceremony feel like?</Prompt>
          <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${RISE_IN_FIELD}`}>
            {VIBES.map((v) => (
              <button
                key={v.value}
                onClick={() => update("vibe", v.value)}
                className={`rounded-sm border px-3 py-3 text-sm transition-colors ${
                  answers.vibe === v.value
                    ? "border-champagne bg-champagne/15"
                    : "border-[rgba(184,150,110,0.5)] bg-white hover:border-champagne/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <ContinueButton disabled={!answers.vibe} onClick={() => setStep("place")} />
        </QuestionScreen>
      ) : null}

      {step === "place" ? (
        <QuestionScreen corner="right">
          <Eyebrow>The place and day</Eyebrow>
          <Prompt>Where would you love to do it?</Prompt>
          <input
            autoFocus
            value={answers.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="City, region… (or leave it open for now)"
            className={`${INPUT_EMOTIONAL_CLASS} ${RISE_IN_FIELD}`}
          />
          <label className={`flex flex-col gap-1.5 ${RISE_IN_FIELD}`}>
            <span className="text-sm text-ink-soft">A date, if you have one in mind</span>
            <input
              type="date"
              value={answers.date}
              onChange={(e) => update("date", e.target.value)}
              className={`w-fit text-sm ${INPUT_CLASS}`}
            />
          </label>
          <ContinueButton onClick={() => setStep("people")} />
        </QuestionScreen>
      ) : null}

      {step === "people" ? (
        <QuestionScreen corner="left">
          <Eyebrow>Your people, your budget</Eyebrow>
          <Prompt>Who do you want beside you, and what matters most?</Prompt>
          <label className={`flex flex-col gap-1.5 ${RISE_IN_FIELD}`}>
            <span className="text-sm text-ink-soft">Guest count</span>
            <input
              type="number"
              min={0}
              value={answers.guest_count}
              onChange={(e) => update("guest_count", Number(e.target.value) || 0)}
              className={`w-32 ${INPUT_CLASS}`}
            />
          </label>
          <div className={`flex flex-col gap-2 ${RISE_IN_FIELD}`}>
            <span className="text-sm text-ink-soft">Budget</span>
            <div className="flex flex-wrap gap-2">
              {BUDGET_BANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => update("budget_band", b)}
                  className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                    answers.budget_band === b
                      ? "border-champagne bg-champagne/15"
                      : "border-[rgba(184,150,110,0.5)] bg-white hover:border-champagne/60"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className={`flex flex-col gap-2 ${RISE_IN_FIELD}`}>
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
                        : "border-[rgba(184,150,110,0.5)] bg-white hover:border-champagne/60"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <ContinueButton onClick={() => setStep("summary")} />
        </QuestionScreen>
      ) : null}

      {step === "summary" ? (
        <QuestionScreen corner="right">
          <Eyebrow>Your ceremony</Eyebrow>
          <Prompt>We&apos;ve got the beginning of your day.</Prompt>
          <div className={`rounded-sm border border-[rgba(184,150,110,0.5)] bg-white px-6 py-6 ${RISE_IN_FIELD}`}>
            <p className="font-serif text-xl">
              {VIBES.find((v) => v.value === answers.vibe)?.label ?? "Your"} ceremony
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {[answers.date, answers.location].filter(Boolean).join(" · ") ||
                "Details still open — you can shape them later."}
            </p>
          </div>
          <ContinueButton disabled={submitting} onClick={handleEnter}>
            {submitting ? "Entering…" : "Enter your ceremony"}
          </ContinueButton>
        </QuestionScreen>
      ) : null}

      {step === "auth" ? (
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-6">
          <Eyebrow animate={false}>One last thing</Eyebrow>
          <h1 className="m-0 max-w-lg font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] min-[701px]:text-[56px]">
            Save your ceremony so it&apos;s waiting for you.
          </h1>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
          {authError ? <p className="text-sm text-wine">{authError}</p> : null}
          <div className="flex items-center">
            <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
              {submitting ? "Saving…" : "Save & continue"}
              <ButtonArrowIcon />
            </button>
          </div>
        </form>
      ) : null}

      {step === "sent" ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto h-px w-10 bg-champagne" />
          <h1 className="m-0 font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] min-[701px]:text-[56px]">
            Check your email.
          </h1>
          <p className="text-ink-soft">
            We sent a confirmation link to {email}. Follow it, and your ceremony will be waiting
            for you.
          </p>
        </div>
      ) : null}
    </main>
  );
}
