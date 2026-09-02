import Link from "next/link";
import type { ReactNode } from "react";
import { Monogram, Wordmark } from "@/components/monogram";

export function AppHeader({
  homeHref = "/dashboard",
  right,
}: {
  homeHref?: string;
  right?: ReactNode;
}) {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href={homeHref} className="flex items-center gap-2.5 text-ink">
          <Monogram className="h-7 w-7" />
          <Wordmark />
        </Link>
        {right}
      </div>
    </header>
  );
}
