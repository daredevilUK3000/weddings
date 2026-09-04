"use client";

import { useEffect, useRef, useState } from "react";

const PROMPTS = [
  {
    label: "Why now?",
    response:
      "Because waiting for the perfect moment was really just waiting for permission — and I'm done doing that.",
  },
  {
    label: "What are you celebrating?",
    response:
      "A decade of choosing myself when it was hard, and never once throwing a party for it.",
  },
  {
    label: "What are you letting go of?",
    response:
      "The idea that a milestone only counts if someone else is standing next to me when it happens.",
  },
];

const TYPE_MS_PER_CHAR = 18;

export function VowPromptPreview() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const reducedMotionRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const fullText = PROMPTS[active].response;
    window.clearInterval(timerRef.current);

    if (reducedMotionRef.current) {
      setTyped(fullText);
      return;
    }

    setTyped("");
    let position = 0;
    timerRef.current = window.setInterval(() => {
      position += 1;
      setTyped(fullText.slice(0, position));
      if (position >= fullText.length) {
        window.clearInterval(timerRef.current);
      }
    }, TYPE_MS_PER_CHAR);

    return () => window.clearInterval(timerRef.current);
  }, [active]);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Your officiant
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROMPTS.map((prompt, i) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                active === i
                  ? "border-champagne bg-champagne/15 text-ink"
                  : "border-ink/15 text-ink-soft hover:border-champagne/60 hover:text-ink"
              }`}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">You</p>
        <p className="mt-1 min-h-[3.5em] font-serif text-lg italic leading-relaxed">
          &ldquo;{typed}
          <span className="animate-pulse">{typed.length < PROMPTS[active].response.length ? "|" : ""}</span>
          &rdquo;
        </p>
      </div>
      <p className="text-[11px] tracking-wide text-ink-soft/70">
        A sample vow, drafted live with your officiant
      </p>
    </div>
  );
}
