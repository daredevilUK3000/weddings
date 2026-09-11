// The signature device of the bold redesign — one oversized "W" per
// screen, maximum, bleeding off a corner. Three sizes matching the
// reference mockups exactly: "hero" for first-run/landing moments
// (dashboard-mockup-bold.html: 620px, top-left, hidden below 881px),
// "mid" for everything else — onboarding questions, officiant chat,
// certificate (onboarding-question-mockup-bold.html: 480px, top-right,
// hidden below 701px) — and "credibility" for the one inverted-palette
// landing section (credibility-section-mockup.html: 520px, top-right,
// hidden below 760px). Alternate corner between screens in a flow so
// consecutive pages don't feel identically stamped; skip entirely on
// dense/functional screens (vendor lists, budget tables).
//
// `tone="dark"` swaps the mark to a near-invisible ivory tint (~3.5%
// opacity) for use against a dark (ink) background instead of the usual
// light backgrounds — text-parchment at full opacity would read as a
// stark, high-contrast shape on ink rather than the subtle ghost mark
// used everywhere else.
export function Watermark({
  corner = "left",
  size = "mid",
  tone = "light",
}: {
  corner?: "left" | "right";
  size?: "hero" | "mid" | "credibility";
  tone?: "light" | "dark";
}) {
  const isHero = size === "hero";
  const isCredibility = size === "credibility";
  const positionClass = isHero
    ? corner === "left"
      ? "-top-[60px] -left-20"
      : "-top-[60px] -right-20"
    : isCredibility
      ? corner === "left"
        ? "-top-[70px] -left-[60px]"
        : "-top-[70px] -right-[60px]"
      : corner === "left"
        ? "-top-10 -left-[60px]"
        : "-top-10 -right-[60px]";
  const sizeClass = isHero ? "text-[620px]" : isCredibility ? "text-[520px]" : "text-[480px]";
  const breakpointClass = isHero
    ? "min-[881px]:block"
    : isCredibility
      ? "min-[760px]:block"
      : "min-[701px]:block";
  const toneClass = tone === "dark" ? "text-[rgba(247,243,236,0.035)]" : "text-parchment";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 hidden leading-none font-serif select-none ${toneClass} ${sizeClass} ${positionClass} ${breakpointClass}`}
    >
      W
    </div>
  );
}
