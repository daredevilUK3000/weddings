import { Eyebrow } from "@/components/eyebrow";

// Extracted from the officiant chat's "acknowledging" phase — same visual
// treatment (eyebrow label + italic serif message), now shared so Wedding
// Director's milestone messages use the identical presentation under a
// different label. Presentational only; the officiant chat's own behavior
// is unchanged.
export function ClaraMessage({ label, message }: { label: string; message: string }) {
  return (
    <div className="animate-[fadeIn_0.5s_ease] flex max-w-xl flex-col gap-3">
      <Eyebrow animate={false}>{label}</Eyebrow>
      <p className="font-serif text-xl italic leading-relaxed text-ink">{message}</p>
    </div>
  );
}
