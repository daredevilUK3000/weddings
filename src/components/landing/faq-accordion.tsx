"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is this legally binding?",
    answer:
      "No. A Weddings for One ceremony is a personal ritual and commitment to yourself — not a legal marriage, and it carries no legal status, rights, or obligations. It's a way to formally mark a choice you're making about your own life, nothing more and nothing less.",
  },
  {
    question: "Do people do this alone, or with guests?",
    answer:
      "Both. Some ceremonies are entirely solo — just you, your officiant, and the moment. Others are witnessed, with friends and family invited to be there for it. You choose the guest count when you build your ceremony, and everything else adapts to match.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl divide-y divide-ink/10 border-t border-b border-ink/10">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-serif text-xl font-medium text-ink sm:text-[22px]">
                {faq.question}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center text-lg text-champagne transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <p className="pb-6 text-base leading-relaxed text-ink-soft">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
