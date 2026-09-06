// Extracted from the officiant chat's "acknowledging" phase — same visual
// treatment (small uppercase label + italic serif message), now shared so
// Wedding Director's milestone messages use the identical presentation
// under a different label. Presentational only; the officiant chat's own
// behavior is unchanged.
export function ClaraMessage({ label, message }: { label: string; message: string }) {
  return (
    <div className="animate-[fadeIn_0.5s_ease] flex max-w-xl flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">{label}</p>
      <p className="font-serif text-xl italic leading-relaxed text-ink">{message}</p>
    </div>
  );
}
