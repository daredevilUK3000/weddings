// Shared "the 14th of June" style date formatting for the Certificate of
// Self-Commitment — used by the generated PDF and the landing-page preview.

export function formatCeremonyDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDate();
  const suffix =
    dayNum % 10 === 1 && dayNum !== 11
      ? "st"
      : dayNum % 10 === 2 && dayNum !== 12
        ? "nd"
        : dayNum % 10 === 3 && dayNum !== 13
          ? "rd"
          : "th";
  const monthName = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return `the ${dayNum}${suffix} of ${monthName}`;
}
