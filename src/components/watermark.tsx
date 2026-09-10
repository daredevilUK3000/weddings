// The signature device of the bold redesign — one oversized "W" per
// screen, maximum, bleeding off a corner. Two sizes matching the two
// reference mockups exactly: "hero" for first-run/landing moments
// (dashboard-mockup-bold.html: 620px, top-left, hidden below 881px) and
// "mid" for everything else — onboarding questions, officiant chat,
// certificate (onboarding-question-mockup-bold.html: 480px, top-right,
// hidden below 701px). Alternate corner between screens in a flow so
// consecutive pages don't feel identically stamped; skip entirely on
// dense/functional screens (vendor lists, budget tables).
export function Watermark({
  corner = "left",
  size = "mid",
}: {
  corner?: "left" | "right";
  size?: "hero" | "mid";
}) {
  const isHero = size === "hero";
  const positionClass = isHero
    ? corner === "left"
      ? "-top-[60px] -left-20"
      : "-top-[60px] -right-20"
    : corner === "left"
      ? "-top-10 -left-[60px]"
      : "-top-10 -right-[60px]";
  const sizeClass = isHero ? "text-[620px]" : "text-[480px]";
  const breakpointClass = isHero ? "min-[881px]:block" : "min-[701px]:block";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 hidden leading-none font-serif text-parchment select-none ${sizeClass} ${positionClass} ${breakpointClass}`}
    >
      W
    </div>
  );
}
