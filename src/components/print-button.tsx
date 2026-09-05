"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-sm border border-ink/15 bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-champagne"
    >
      Print
    </button>
  );
}
