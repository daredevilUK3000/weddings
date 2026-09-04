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
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-14">
      <Link href="/" className="flex items-center gap-4 text-ink">
        <SealIcon className="h-[88px] w-[88px]" />
        <Wordmark className="text-[48px]" />
      </Link>
      <div className="flex items-center gap-9">
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
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
        >
          {primaryLabel}
        </Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-[13px] text-ink-soft sm:px-14">
      <span className="flex items-center gap-3 text-ink">
        <SealIcon className="h-[56px] w-[56px]" />
        <Wordmark className="text-[28px]" />
      </span>
      <span>A ceremony of one</span>
    </footer>
  );
}
