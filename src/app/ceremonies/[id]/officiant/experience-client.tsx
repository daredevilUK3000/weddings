"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OFFICIANT_STAGES } from "@/lib/officiant-questions";

type Phase = "question" | "acknowledging" | "complete";

const FALLBACK_ACKNOWLEDGMENT = "Thank you for trusting me with that.";
const ACKNOWLEDGMENT_PAUSE_MS = 1400;

function buildTranscript(answers: string[]): string {
  return OFFICIANT_STAGES.map(
    (stage, i) => `Officiant: ${stage.question}\nClient: ${answers[i]}`,
  ).join("\n\n");
}

export function OfficiantExperience({ ceremonyId }: { ceremonyId: string }) {
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("question");
  const [inputValue, setInputValue] = useState("");
  const [acknowledgment, setAcknowledgment] = useState<string | null>(null);
  const [submittingAck, setSubmittingAck] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (phase === "question") {
      textareaRef.current?.focus();
    }
  }, [phase, stageIndex]);

  async function handleSubmitAnswer() {
    const answer = inputValue.trim();
    if (!answer) return;

    const stage = OFFICIANT_STAGES[stageIndex];
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setInputValue("");
    setPhase("acknowledging");
    setSubmittingAck(true);
    setAcknowledgment(null);

    let ack = FALLBACK_ACKNOWLEDGMENT;
    try {
      const res = await fetch("/api/ai/officiant-acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceremonyId, question: stage.question, answer }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.acknowledgment) ack = data.acknowledgment;
      }
    } catch {
      // keep fallback acknowledgment — the conversation should never stall on this
    }

    setSubmittingAck(false);
    setAcknowledgment(ack);

    window.setTimeout(() => {
      const isLastStage = stageIndex === OFFICIANT_STAGES.length - 1;
      setStageIndex((i) => i + 1);
      setPhase(isLastStage ? "complete" : "question");
    }, ACKNOWLEDGMENT_PAUSE_MS);
  }

  async function handleCreateCeremony() {
    setGenerating(true);
    setGenerateError(false);

    try {
      const res = await fetch("/api/ai/ceremony-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceremonyId, interviewTranscript: buildTranscript(answers) }),
      });
      if (res.ok) {
        router.push(`/ceremonies/${ceremonyId}/builder`);
        return;
      }
    } catch {
      // fall through to error state
    }
    setGenerating(false);
    setGenerateError(true);
  }

  const stage = OFFICIANT_STAGES[stageIndex];

  return (
    <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-16 md:py-16">
      {/* PROGRESS */}
      {phase !== "complete" ? (
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {OFFICIANT_STAGES.map((s, i) => (
              <span
                key={s.stageLabel}
                className={`h-px flex-1 transition-colors duration-500 ${
                  i <= stageIndex ? "bg-champagne" : "bg-ink/10"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            {String(stageIndex + 1).padStart(2, "0")} / {String(OFFICIANT_STAGES.length).padStart(2, "0")}
            <span className="mx-2 text-champagne">·</span>
            {stage.stageLabel}
          </p>
        </div>
      ) : null}

      {phase === "question" ? (
        <div key={stageIndex} className="animate-[fadeIn_0.5s_ease] max-w-xl">
          <h2 className="font-serif text-[32px] font-medium leading-[1.15] tracking-tight text-ink sm:text-[40px]">
            {stage.question}
          </h2>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-ink-soft">
            {stage.supportingText}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAnswer();
            }}
            className="mt-9"
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
              rows={4}
              placeholder="Take your time…"
              className="w-full resize-none rounded-sm border border-ink/12 bg-ivory px-5 py-4 font-serif text-[17px] leading-relaxed text-ink placeholder:text-ink-soft/50 outline-none transition-colors focus:border-champagne"
            />
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-ink"
              >
                Continue →
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {phase === "acknowledging" ? (
        <div className="animate-[fadeIn_0.5s_ease] flex max-w-xl flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Clara
          </p>
          {submittingAck ? (
            <span className="h-2 w-2 animate-pulse rounded-full bg-champagne" aria-hidden="true" />
          ) : (
            <p className="animate-[fadeIn_0.5s_ease] font-serif text-xl italic leading-relaxed text-ink">
              {acknowledgment}
            </p>
          )}
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className="animate-[fadeIn_0.6s_ease] max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Your ceremony
          </p>
          <h2 className="mt-3 font-serif text-[32px] font-medium leading-[1.15] tracking-tight text-ink sm:text-[40px]">
            Your ceremony is ready.
          </h2>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-ink-soft">
            I&apos;ve listened to your story. Now I&apos;ll turn your words into something worthy
            of the moment.
          </p>

          <div className="mt-9">
            <button
              onClick={handleCreateCeremony}
              disabled={generating}
              className="rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {generating ? "Clara is writing your ceremony…" : "Create My Ceremony →"}
            </button>
            {generateError ? (
              <p className="mt-4 text-sm text-ink-soft">
                Something interrupted us — please try again.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
