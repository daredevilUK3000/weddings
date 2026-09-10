import Link from "next/link";
import { SealIcon, Wordmark } from "@/components/monogram";

export function MarketingNav({
  isAuthenticated,
  primaryHref,
  primaryLabel,
}: {
  isAuthenticated: boolean;
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-14 sm:py-7">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 text-ink sm:gap-4">
        <SealIcon className="h-10 w-10 shrink-0 sm:h-[88px] sm:w-[88px]" />
        <Wordmark className="truncate text-xl sm:text-[48px]" />
      </Link>
      {/* Desktop menu */}
      <div className="hidden shrink-0 items-center gap-9 sm:flex">
        <Link href="/#moments" className="text-sm font-medium">
          How it works
        </Link>
        <Link href="/#certificate" className="text-sm font-medium">
          Certificate
        </Link>
        <Link href="/faq" className="text-sm font-medium">
          FAQ
        </Link>
        {!isAuthenticated ? (
          <Link href="/login" className="text-sm font-medium">
            Sign in
          </Link>
        ) : null}
        <Link
          href={primaryHref}
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
        >
          {primaryLabel}
        </Link>
      </div>

      {/* Mobile: CTA plus a tap-to-reveal menu (no JS needed) */}
      <div className="flex shrink-0 items-center gap-2 sm:hidden">
        <Link
          href={primaryHref}
          className="rounded-sm bg-ink px-3 py-2 text-xs font-medium whitespace-nowrap text-ivory transition-all hover:bg-wine"
        >
          {primaryLabel}
        </Link>
        <details className="group relative">
          <summary
            className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-sm border border-ink/15 text-ink [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
              <path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute top-full right-0 z-20 mt-2 flex w-52 flex-col gap-1 rounded-sm border border-ink/10 bg-ivory p-3 shadow-[0_12px_30px_rgba(32,32,29,0.12)]">
            <Link href="/#moments" className="rounded-sm px-2 py-2 text-sm font-medium hover:bg-parchment/60">
              How it works
            </Link>
            <Link href="/#certificate" className="rounded-sm px-2 py-2 text-sm font-medium hover:bg-parchment/60">
              Certificate
            </Link>
            <Link href="/faq" className="rounded-sm px-2 py-2 text-sm font-medium hover:bg-parchment/60">
              FAQ
            </Link>
            {!isAuthenticated ? (
              <Link href="/login" className="rounded-sm px-2 py-2 text-sm font-medium hover:bg-parchment/60">
                Sign in
              </Link>
            ) : null}
          </div>
        </details>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8 text-[13px] text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-14">
      <span className="flex items-center gap-3 text-ink">
        <SealIcon className="h-[56px] w-[56px]" />
        <Wordmark className="text-[28px]" />
      </span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span>A ceremony of one</span>
        <Link href="/terms" className="hover:text-ink">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
        <Link href="/contact" className="hover:text-ink">
          Contact
        </Link>
      </div>
    </footer>
  );
}
