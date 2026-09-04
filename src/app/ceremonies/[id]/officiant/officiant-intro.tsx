export function OfficiantIntro() {
  return (
    <div className="flex flex-col items-center gap-5 px-8 py-10 text-center md:h-full md:items-start md:px-10 md:py-14 md:text-left">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-champagne/70 md:h-28 md:w-28"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(200,173,130,0.18), transparent 60%), var(--parchment)",
        }}
        aria-hidden="true"
      >
        <span className="font-serif text-2xl italic text-champagne md:text-5xl">C</span>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          Your officiant
        </p>
        <p className="mt-2 font-serif text-2xl font-medium text-ink">Clara</p>
        <p className="text-xs uppercase tracking-[0.14em] text-dusty-rose">
          Ceremony Writer &amp; Officiant
        </p>
      </div>

      <p className="max-w-xs font-serif text-lg italic leading-relaxed text-ink-soft">
        &ldquo;I&apos;ll listen first.
        <br className="hidden md:block" /> Then I&apos;ll write.&rdquo;
      </p>

      <div className="hidden items-center gap-3 md:flex" aria-hidden="true">
        <span className="h-px w-8 bg-champagne" />
        <svg width="7" height="7" viewBox="0 0 8 8" className="shrink-0">
          <path d="M4,0 L8,4 L4,8 L0,4 Z" fill="var(--champagne)" />
        </svg>
      </div>

      <p className="hidden text-sm text-ink-soft md:mt-auto md:block">
        An officiant who listens before it writes.
      </p>
    </div>
  );
}
