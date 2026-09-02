export function PhotoSlot({
  label,
  aspect = "aspect-4/3",
  className = "",
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex ${aspect} flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-ink/20 bg-parchment/40 p-6 text-center ${className}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft/70">
        Photography slot
      </span>
      <span className="max-w-[220px] text-[13px] text-ink-soft">{label}</span>
    </div>
  );
}
