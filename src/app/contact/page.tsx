import { createClient } from "@/lib/supabase/server";
import { MarketingNav, MarketingFooter } from "@/components/marketing-chrome";
import { Eyebrow } from "@/components/eyebrow";

export const metadata = {
  title: "Contact Us — Weddings for One",
  description: "Questions, feedback, or something not working the way it should? Get in touch.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/onboarding";
  const primaryLabel = user ? "Go to your ceremonies" : "Begin your ceremony";

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav isAuthenticated={!!user} primaryHref={primaryHref} primaryLabel={primaryLabel} />

      <section
        className="relative overflow-hidden px-6 pt-16 pb-24 text-center sm:px-14 sm:pt-24 sm:pb-32"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(200,173,130,0.10), transparent 45%), radial-gradient(circle at 85% 75%, rgba(185,130,122,0.08), transparent 45%), var(--ivory)",
        }}
      >
        <div className="mx-auto max-w-xl">
          <div className="mx-auto mb-5 w-fit">
            <Eyebrow animate={false}>Get in touch</Eyebrow>
          </div>
          <h1 className="font-serif text-[38px] font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            Questions, feedback, or something not working the way it should? We&apos;d like to
            hear about it.
          </p>

          <a
            href="mailto:info@weddingsforone.com"
            className="mt-9 inline-block rounded-sm bg-ink px-7 py-4 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
          >
            info@weddingsforone.com
          </a>

          <p className="mt-6 text-sm text-ink-soft">We aim to respond within 2 business days.</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
