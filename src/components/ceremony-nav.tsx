"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "officiant", label: "Officiant" },
  { slug: "builder", label: "Builder" },
  { slug: "vendors", label: "Vendors" },
  { slug: "budget", label: "Budget" },
  { slug: "certificate", label: "Certificate" },
  { slug: "extras", label: "Extras" },
];

export function CeremonyNav({ ceremonyId }: { ceremonyId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-ink/10">
      {TABS.map((tab) => {
        const href = `/ceremonies/${ceremonyId}/${tab.slug}`;
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-b-2 border-wine text-ink"
                : "border-b-2 border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
