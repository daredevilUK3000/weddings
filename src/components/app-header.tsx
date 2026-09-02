import Link from "next/link";
import type { ReactNode } from "react";

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
        <Link href={homeHref} className="font-serif text-lg font-semibold tracking-tight">
          WeddingsForOne
        </Link>
        {right}
      </div>
    </header>
  );
}
