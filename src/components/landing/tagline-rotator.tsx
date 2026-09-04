"use client";

import { useEffect, useState } from "react";

const TAGLINES = [
  "This is the ceremony that celebrates your life, entirely yours.",
  "This is the ceremony that celebrates your resilience.",
  "This is the ceremony that celebrates your fresh start.",
  "This is the ceremony that celebrates your milestones.",
];

const INTERVAL_MS = 4200;
const FADE_MS = 350;

export function TaglineRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const fadeOut = window.setTimeout(() => setVisible(false), INTERVAL_MS - FADE_MS);
    const advance = window.setTimeout(() => {
      setIndex((current) => (current + 1) % TAGLINES.length);
      setVisible(true);
    }, INTERVAL_MS);

    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(advance);
    };
  }, [index, reducedMotion]);

  return (
    <p
      className={`mt-2 max-w-md text-lg text-ivory/85 ${
        reducedMotion ? "" : "transition-opacity duration-[350ms] ease-out"
      } ${!reducedMotion && !visible ? "opacity-0" : "opacity-100"}`}
    >
      {TAGLINES[index]}
    </p>
  );
}
