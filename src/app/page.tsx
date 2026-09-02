import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7 sm:px-14">
        <span className="font-serif text-xl font-semibold tracking-tight">WeddingsForOne</span>
        <div className="flex items-center gap-9">
          <a href="#moments" className="hidden text-sm font-medium sm:inline">
            How it works
          </a>
          <a href="#certificate" className="hidden text-sm font-medium sm:inline">
            Certificate
          </a>
          <Link href="/login" className="hidden text-sm font-medium sm:inline">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-rust"
          >
            Begin your ceremony
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
          <div className="absolute inset-0 bg-gradient-to-b from-ink/10 to-ink/80" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 text-paper sm:px-14 sm:pb-20">
          <p className="mb-5 text-sm font-medium text-gold">A ceremony of one</p>
          <h1 className="max-w-3xl font-serif text-[38px] font-medium leading-[1.06] tracking-tight sm:text-[52px] lg:text-[68px]">
            You&apos;ve built a life worth celebrating. Marry the person who built it.
          </h1>
          <p className="mt-6 max-w-md text-lg text-paper/85">
            Plan a real ceremony — vows, a venue, a photographer, a day that&apos;s entirely
            yours — with an AI officiant and planner built for one.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/sign-up"
              className="rounded-sm bg-paper px-7 py-4 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              Begin your ceremony
            </Link>
            <a
              href="#moments"
              className="rounded-sm border border-paper/40 px-7 py-4 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* VOW STRIP */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-14 sm:py-24">
        <p className="font-serif text-2xl font-normal leading-snug sm:text-[34px]">
          &ldquo;I promise to stop waiting for permission to celebrate my own life. Today, I
          do.&rdquo;
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          — a vow drafted with the AI officiant, written for someone else&apos;s ceremony
        </p>
      </section>

      {/* PRODUCT MOMENTS */}
      <section id="moments" className="bg-stone px-6 py-24 sm:px-14 sm:py-28">
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

          <div className="flex flex-col">
            {[
              {
                number: "The officiant",
                title: "A conversation, not a form",
                body: "Talk through why now, what this day means, and what you want to promise yourself. Your officiant turns it into a script and vows that sound like you.",
                visual: "Officiant chat — a warm, streaming conversation",
              },
              {
                number: "The planner",
                title: "Real vendors, already briefed",
                body: "We shortlist venues, photographers, and florists near you — and draft the inquiry for you, so you're never the one explaining what a solo wedding is.",
                visual: "Vendor shortlist — AI rationale on every match",
                reverse: true,
              },
              {
                number: "The day",
                title: "A timeline that's actually yours",
                body: "Processional, vows, a ring for yourself, a first dance with no one but you. Build the day moment by moment, in whatever order means something.",
                visual: "Ceremony timeline — reorder every moment",
              },
            ].map((m, i) => (
              <div
                key={m.title}
                className={`grid grid-cols-1 items-center gap-10 border-t border-ink/10 py-14 last:border-b md:grid-cols-2 md:gap-16 ${
                  i === 0 ? "" : ""
                }`}
              >
                <div className={m.reverse ? "md:order-2" : ""}>
                  <div className="flex aspect-4/3 items-center justify-center rounded-sm border border-ink/8 bg-gradient-to-br from-white to-stone p-6 text-center text-[13px] text-ink-soft">
                    {m.visual}
                  </div>
                </div>
                <div className={m.reverse ? "md:order-1" : ""}>
                  <div className="mb-3 font-serif text-sm text-rust">{m.number}</div>
                  <h3 className="text-2xl font-medium">{m.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{m.body}</p>
                </div>
              </div>
            ))}
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
            Something to keep, long after the day ends.
          </h2>
          <p className="mt-4 max-w-sm text-base text-ink-soft sm:text-[16.5px]">
            A Certificate of Self-Commitment — designed to match your ceremony&apos;s tone,
            ready to frame, print, or post.
          </p>
        </div>
        <div className="flex aspect-3/4 items-center justify-center rounded bg-ink p-10">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-xs border border-gold bg-paper px-8 py-8 text-center">
            <div className="text-[11px] tracking-[0.04em] text-rust">
              CERTIFICATE OF SELF-COMMITMENT
            </div>
            <div className="my-3 h-px w-14 bg-gold" />
            <div className="font-serif text-xl">Alex Rivera</div>
            <div className="text-[13px] text-ink-soft">committed to themself on</div>
            <div className="font-serif text-base">the 14th of June</div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink px-6 py-24 text-center text-paper sm:px-14 sm:py-28">
        <h2 className="mx-auto max-w-xl font-serif text-[30px] font-medium leading-tight sm:text-4xl lg:text-[48px]">
          Your day. Your vows. Your name on the certificate.
        </h2>
        <Link
          href="/sign-up"
          className="mt-9 inline-block rounded-sm bg-paper px-7 py-4 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Begin your ceremony
        </Link>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-[13px] text-ink-soft sm:px-14">
        <span>WeddingsForOne</span>
        <span>A ceremony of one</span>
      </footer>
    </div>
  );
}
