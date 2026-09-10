"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OFFICIANT_STAGES } from "@/lib/officiant-questions";
import { ClaraMessage } from "@/components/clara-message";
import { Eyebrow } from "@/components/eyebrow";
import { Watermark } from "@/components/watermark";
import { ButtonArrowIcon } from "@/components/button-arrow-icon";
import {
  PRIMARY_BUTTON_CLASS,
  INPUT_EMOTIONAL_CLASS,
  RISE_IN_HEADLINE,
  RISE_IN_FIELD,
  RISE_IN_ACTIONS,
} from "@/lib/design-tokens";

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
    <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-8 py-12 md:px-16 md:py-16">
      <Watermark corner="right" size="mid" />

      <div className="relative z-10">
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
            <div className="mt-3">
              <Eyebrow animate={false}>
                {String(stageIndex + 1).padStart(2, "0")} / {String(OFFICIANT_STAGES.length).padStart(2, "0")}{" "}
                · {stage.stageLabel}
              </Eyebrow>
            </div>
          </div>
        ) : null}

        {phase === "question" ? (
          <div key={stageIndex} className="max-w-xl">
            <h2
              className={`font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] text-ink min-[701px]:text-[56px] ${RISE_IN_HEADLINE}`}
            >
              {stage.question}
            </h2>
            <p className={`mt-4 font-serif text-lg leading-relaxed text-ink-soft italic ${RISE_IN_FIELD}`}>
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
                className={`w-full resize-none ${INPUT_EMOTIONAL_CLASS} ${RISE_IN_FIELD}`}
              />
              <div className={`mt-5 flex justify-end ${RISE_IN_ACTIONS}`}>
                <button type="submit" disabled={!inputValue.trim()} className={PRIMARY_BUTTON_CLASS}>
                  Continue
                  <ButtonArrowIcon />
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {phase === "acknowledging" ? (
          submittingAck ? (
            <div className="flex max-w-xl flex-col gap-3">
              <Eyebrow animate={false}>Clara</Eyebrow>
              <span className="h-2 w-2 animate-pulse rounded-full bg-champagne" aria-hidden="true" />
            </div>
          ) : (
            <ClaraMessage label="Clara" message={acknowledgment ?? ""} />
          )
        ) : null}

        {phase === "complete" ? (
          <div className="animate-[fadeIn_0.6s_ease] max-w-xl">
            <Eyebrow animate={false}>Your ceremony</Eyebrow>
            <h2 className="mt-3 font-serif text-[38px] leading-[1.05] font-medium tracking-[-0.3px] text-ink min-[701px]:text-[56px]">
              Your ceremony is ready.
            </h2>
            <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft italic">
              I&apos;ve listened to your story. Now I&apos;ll turn your words into something worthy
              of the moment.
            </p>

            <div className="mt-9">
              <button onClick={handleCreateCeremony} disabled={generating} className={PRIMARY_BUTTON_CLASS}>
                {generating ? "Clara is writing your ceremony…" : "Create My Ceremony"}
                <ButtonArrowIcon />
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
    </div>
  );
}
