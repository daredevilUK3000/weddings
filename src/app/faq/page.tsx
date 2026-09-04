import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav, MarketingFooter } from "@/components/marketing-chrome";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { FAQS } from "@/lib/faq-data";

export const metadata = {
  title: "FAQ — Weddings for One",
  description: "Answers to the questions people ask before beginning a ceremony of one.",
};

export default async function FaqPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/onboarding";
  const primaryLabel = user ? "Go to your ceremonies" : "Begin your ceremony";

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav isAuthenticated={!!user} primaryHref={primaryHref} primaryLabel={primaryLabel} />

      {/* HEADER */}
      <section
        className="relative overflow-hidden px-6 pt-16 pb-20 text-center sm:px-14 sm:pt-24 sm:pb-24"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(200,173,130,0.10), transparent 45%), radial-gradient(circle at 85% 75%, rgba(185,130,122,0.08), transparent 45%), var(--ivory)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-7 flex h-11 w-11 items-center justify-center rounded-full border border-champagne">
            <span className="font-serif text-xl italic text-champagne">?</span>
          </div>
          <p className="mb-5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-dusty-rose">
            Before you begin
          </p>
          <h1 className="font-serif text-[38px] font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Questions, answered.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            An unconventional ceremony raises reasonable questions. Here are honest answers to
            the ones we hear most.
          </p>
          <div className="mx-auto mt-9 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-11 bg-champagne" />
            <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
              <path d="M4,0 L8,4 L4,8 L0,4 Z" fill="var(--champagne)" />
            </svg>
            <span className="h-px w-11 bg-champagne" />
          </div>
        </div>
      </section>

      {/* FAQ LIST */}
      <section className="px-6 pt-4 pb-24 sm:px-14 sm:pb-32">
        <FaqAccordion faqs={FAQS} />
      </section>

      {/* CLOSING CTA */}
      <section className="bg-ink px-6 py-24 text-center text-ivory sm:px-14 sm:py-28">
        <h2 className="mx-auto max-w-xl font-serif text-[28px] font-medium leading-tight sm:text-4xl">
          Still here? That&apos;s usually a good sign.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ivory/75">
          Start when you&apos;re ready — nothing is generated until you are.
        </p>
        <Link
          href={primaryHref}
          className="mt-9 inline-block rounded-sm bg-ivory px-7 py-4 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          {primaryLabel}
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
