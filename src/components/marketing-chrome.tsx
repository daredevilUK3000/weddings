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
      <div className="flex shrink-0 items-center gap-9">
        <Link href="/#moments" className="hidden text-sm font-medium sm:inline">
          How it works
        </Link>
        <Link href="/#certificate" className="hidden text-sm font-medium sm:inline">
          Certificate
        </Link>
        <Link href="/faq" className="hidden text-sm font-medium sm:inline">
          FAQ
        </Link>
        {!isAuthenticated ? (
          <Link href="/login" className="hidden text-sm font-medium sm:inline">
            Sign in
          </Link>
        ) : null}
        <Link
          href={primaryHref}
          className="rounded-sm bg-ink px-3 py-2 text-xs font-medium whitespace-nowrap text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {primaryLabel}
        </Link>
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
