// Shared typography for the Terms, Privacy, and Contact pages — kept tiny
// and presentational since all three pages need the same handful of styles.

export function LegalH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-serif text-xl font-medium text-ink">{children}</h2>;
}

export function LegalH3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-sm font-semibold text-ink">{children}</h3>;
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</p>;
}

export function LegalUl({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">{children}</ul>;
}

export function LegalLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 pl-1">
      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-champagne" />
      <span>{children}</span>
    </li>
  );
}
