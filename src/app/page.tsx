import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SealIcon, Wordmark } from "@/components/monogram";
import { TaglineRotator } from "@/components/landing/tagline-rotator";
import { VowPromptPreview } from "@/components/landing/vow-prompt-preview";
import { CertificatePersonalizer } from "@/components/landing/certificate-personalizer";
import { FaqAccordion } from "@/components/landing/faq-accordion";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/onboarding";
  const primaryLabel = user ? "Go to your ceremonies" : "Begin your ceremony";

  return (
    <div className="flex flex-1 flex-col">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-14">
        <Link href="/" className="flex items-center gap-4 text-ink">
          <SealIcon className="h-[88px] w-[88px]" />
          <Wordmark className="text-[48px]" />
        </Link>
        <div className="flex items-center gap-9">
          <a href="#moments" className="hidden text-sm font-medium sm:inline">
            How it works
          </a>
          <a href="#certificate" className="hidden text-sm font-medium sm:inline">
            Certificate
          </a>
          <a href="#faq" className="hidden text-sm font-medium sm:inline">
            FAQ
          </a>
          {!user ? (
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

      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden rounded-b">
        <div className="absolute inset-0 bg-[url('/images/hero-poster.jpg')] bg-cover bg-center">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/15 to-ink/85" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 text-ivory sm:px-14 sm:pb-20">
          <p className="mb-5 text-sm font-medium text-champagne">A ceremony of one</p>
          <h1 className="max-w-2xl font-serif text-[44px] font-medium leading-[1.05] tracking-tight sm:text-[64px] lg:text-[78px]">
            Today, I choose myself.
          </h1>
          <p className="mt-7 max-w-md text-lg text-ivory/85">
            You&apos;ve built a life worth celebrating.
          </p>
          <TaglineRotator />
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={primaryHref}
              className="rounded-sm bg-ivory px-7 py-4 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              {primaryLabel}
            </Link>
            <a
              href="#moments"
              className="rounded-sm border border-ivory/40 px-7 py-4 text-sm font-medium text-ivory transition-colors hover:bg-ivory/10"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* VOW STRIP */}
      <section className="relative overflow-hidden bg-ivory px-6 py-20 sm:px-14 sm:py-32">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 md:grid-cols-[0.8fr_1.2fr] md:gap-[72px]">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
            <Image
              src="/images/pexels-tara-winstead-7111148.jpg"
              alt="A tealight candle, lit"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[50%_45%]"
            />
          </div>

          <div className="text-center md:text-left">
            <div className="mx-auto mb-9 flex h-10 w-10 items-center justify-center md:mx-0">
              <svg viewBox="0 0 40 40" fill="none" className="h-full w-full" aria-hidden="true">
                <circle cx="20" cy="20" r="19" stroke="var(--champagne)" strokeWidth={1} />
                <text
                  x="20"
                  y="26"
                  textAnchor="middle"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  fontSize="20"
                  fill="var(--champagne)"
                >
                  1
                </text>
              </svg>
            </div>

            <p className="mb-8 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-dusty-rose">
              A vow, drafted with your officiant
            </p>
            <div className="mx-auto mb-8 h-px w-11 bg-champagne md:mx-0" />

            <span
              className="mb-[-6px] block font-serif text-[72px] italic leading-[0.5] text-champagne opacity-55 sm:text-[100px]"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="font-serif text-[28px] font-medium italic leading-[1.45] text-ink sm:text-4xl">
              I promise to stop waiting for permission to celebrate my own life. Today, I do.
            </p>

            <div className="mx-auto mt-9 mb-6 h-px w-11 bg-champagne md:mx-0" />
            <p className="text-[13px] text-ink-soft">
              Written for someone else&apos;s ceremony — yours will sound like you
            </p>
          </div>
        </div>
      </section>

      {/* THE OFFICIANT — editorial conversation treatment */}
      <section id="moments" className="bg-parchment px-6 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-16 max-w-xl">
            <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
              Everything a wedding needs. Scoped for one.
            </h2>
            <p className="mt-4 text-base text-ink-soft sm:text-[16.5px]">
              Not a stripped-down version of a couple&apos;s wedding — a ceremony designed, from
              the ground up, around a single celebrant.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-14 border-t border-ink/10 py-14 md:grid-cols-2 md:gap-16">
            <div>
              <div className="mb-3 font-serif text-sm text-wine">The officiant</div>
              <h3 className="text-2xl font-medium">Someone needs to ask you the right questions.</h3>
              <VowPromptPreview />
              <p className="mt-6 text-base leading-relaxed text-ink-soft">
                Your words become your ceremony — a script and vows that sound like you, drafted
                by an AI officiant that listens before it writes.
              </p>
            </div>
            <div className="relative aspect-3/4 overflow-hidden rounded-sm border border-ink/8">
              <Image
                src="/images/landing/altar.jpg"
                alt="A person standing alone at the altar, sunlit and unhurried"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-14 border-t border-ink/10 py-14 md:grid-cols-2 md:gap-16">
            <div className="md:order-2">
              <div className="mb-3 font-serif text-sm text-wine">The planner</div>
              <h3 className="text-2xl font-medium">Real vendors, already briefed</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                We shortlist venues, photographers, and florists near you — and draft the inquiry
                for you, so you&apos;re never the one explaining what a solo wedding is.
              </p>
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-sm border border-ink/8 md:order-1">
              <Image
                src="/images/landing/dinner-table.jpg"
                alt="An elegant dinner table set for one, candlelit"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-14 border-t border-ink/10 border-b py-14 md:grid-cols-2 md:gap-16">
            <div>
              <div className="mb-3 font-serif text-sm text-wine">The day</div>
              <h3 className="text-2xl font-medium">A programme that&apos;s actually yours</h3>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Processional, vows, a ring for yourself, a first dance with no one but you. Build
                the day moment by moment, in whatever order means something.
              </p>
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-sm border border-ink/8">
              <Image
                src="/images/landing/dancing-alone.jpg"
                alt="A solitary dance, arms outstretched, seen from above"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE SHOWCASE */}
      <section
        id="certificate"
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 py-24 sm:px-14 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-18"
      >
        <div>
          <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
            Something to keep. Something to frame.
          </h2>
          <p className="mt-4 max-w-sm text-base text-ink-soft sm:text-[16.5px]">
            A Certificate of Self-Commitment — designed to match your ceremony&apos;s tone. Proof
            that you chose yourself, ready to frame, print, or post.
          </p>
        </div>
        <CertificatePersonalizer />
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-ink/10 bg-parchment px-6 py-24 sm:px-14 sm:py-28">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
            Questions people ask before they begin
          </h2>
        </div>
        <FaqAccordion />
      </section>

      {/* TRUST SIGNAL — marketing copy is exempt from the in-product AI-invisibility rule */}
      <section className="border-t border-ink/10 px-6 py-14 text-center sm:px-14">
        <p className="mx-auto max-w-lg text-sm text-ink-soft">
          One of the first AI-powered ceremony platforms built for a wedding of one — an AI
          officiant and planner working quietly behind a ceremony that feels entirely human.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink px-6 py-24 text-center text-ivory sm:px-14 sm:py-28">
        <h2 className="mx-auto max-w-xl font-serif text-[30px] font-medium leading-tight sm:text-4xl lg:text-[48px]">
          Your day. Your vows. Your name on the certificate.
        </h2>
        <Link
          href={primaryHref}
          className="mt-9 inline-block rounded-sm bg-ivory px-7 py-4 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          {primaryLabel}
        </Link>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-[13px] text-ink-soft sm:px-14">
        <span className="flex items-center gap-3 text-ink">
          <SealIcon className="h-[56px] w-[56px]" />
          <Wordmark className="text-[28px]" />
        </span>
        <span>A ceremony of one</span>
      </footer>
    </div>
  );
}
