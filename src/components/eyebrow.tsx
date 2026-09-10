import { RISE_IN_EYEBROW } from "@/lib/design-tokens";

// Replaces the old all-caps tracked-out label pattern site-wide (e.g.
// "LET'S BEGIN WITH ONE QUESTION") with a thin champagne rule + small
// italic serif line, per onboarding-question-mockup-bold.html exactly.
// Pass animate={false} on screens that don't use the rise-in entrance
// (e.g. a static page like /faq, which has no other animated siblings to
// stagger against).
export function Eyebrow({ children, animate = true }: { children: React.ReactNode; animate?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${animate ? RISE_IN_EYEBROW : ""}`}>
      <span aria-hidden className="h-px w-8 bg-champagne" />
      <span className="font-serif text-base text-ink/55 italic">{children}</span>
    </div>
  );
}
