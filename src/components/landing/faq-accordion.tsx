"use client";

import { useState } from "react";
import type { Faq } from "@/lib/faq-data";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl divide-y divide-ink/10 border-t border-b border-ink/10">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-5 py-6 text-left"
            >
              <span className="mt-0.5 w-8 shrink-0 font-serif text-sm italic text-champagne">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-serif text-xl font-medium text-ink sm:text-[22px]">
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
              <div className="min-h-0 pl-[3.25rem]">
                <p className="pb-6 text-base leading-relaxed text-ink-soft">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
