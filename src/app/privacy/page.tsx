import { createClient } from "@/lib/supabase/server";
import { MarketingNav, MarketingFooter } from "@/components/marketing-chrome";
import { LegalH2, LegalP, LegalUl, LegalLi } from "@/components/legal-prose";
import { Eyebrow } from "@/components/eyebrow";

export const metadata = {
  title: "Privacy Policy — Weddings for One",
  description: "What personal data WeddingsForOne collects, why, and what rights you have over it.",
};

const LAST_UPDATED = "September 8, 2026";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/onboarding";
  const primaryLabel = user ? "Go to your ceremonies" : "Begin your ceremony";

  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav isAuthenticated={!!user} primaryHref={primaryHref} primaryLabel={primaryLabel} />

      <section className="px-6 pt-14 pb-24 sm:px-14 sm:pb-32">
        <div className="mx-auto max-w-2xl">
          <Eyebrow animate={false}>Legal</Eyebrow>
          <h1 className="mt-3 font-serif text-[36px] font-medium leading-[1.1] tracking-tight text-ink sm:text-[42px]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-ink-soft">Last updated: {LAST_UPDATED}</p>

          <LegalP>
            This Privacy Policy explains what personal data WeddingsForOne collects, why, and
            what rights you have over it. We process data in accordance with the EU General Data
            Protection Regulation (GDPR).
          </LegalP>

          <LegalH2>Data controller</LegalH2>
          <LegalP>
            Business Game Changer Magazine. WeddingsForOne is a trading name (nom commercial) of
            Kizzi Nkwocha, sole trader (auto-entrepreneur), SIRET: 813 208 790 00010, based in
            Limoges, France. Contact:{" "}
            <a href="mailto:info@weddingsforone.com" className="text-wine underline underline-offset-2">
              info@weddingsforone.com
            </a>
          </LegalP>

          <LegalH2>What data we collect</LegalH2>
          <LegalUl>
            <LegalLi>
              <strong className="text-ink">Account data</strong>: email address, and any name you
              provide.
            </LegalLi>
            <LegalLi>
              <strong className="text-ink">Ceremony content</strong>: your answers to officiant
              questions, generated vows and ceremony scripts, ceremony details (date, timeline),
              witness information you choose to add, budget entries, and vendor
              shortlist/outreach content.
            </LegalLi>
            <LegalLi>
              <strong className="text-ink">Usage data</strong>: basic technical data (e.g. login
              timestamps) needed to operate the Service securely.
            </LegalLi>
          </LegalUl>
          <LegalP>
            We do not collect special-category data (e.g. health, religious belief) as a required
            part of the Service, though you may voluntarily include reflections of that nature in
            your own ceremony content (e.g. mentioning faith in your vows) — this remains private
            to your account as described below.
          </LegalP>

          <LegalH2>Why we process it (legal basis)</LegalH2>
          <LegalUl>
            <LegalLi>
              To provide the Service you&apos;ve signed up for (performance of a contract) —
              account data and ceremony content.
            </LegalLi>
            <LegalLi>With your consent, where applicable (e.g. optional communications).</LegalLi>
            <LegalLi>
              Legitimate interest in keeping the Service secure and functioning (usage/technical
              data).
            </LegalLi>
          </LegalUl>

          <LegalH2>Who we share it with</LegalH2>
          <LegalP>
            We use the following third-party processors to operate the Service. None of them are
            permitted to use your data for their own purposes beyond providing their service to
            us:
          </LegalP>
          <LegalUl>
            <LegalLi>
              <strong className="text-ink">Supabase</strong> — database hosting, authentication,
              and storage of your account and ceremony data. Supabase&apos;s Data Processing
              Agreement (incorporating Standard Contractual Clauses) is automatically part of
              their standard terms, with no separate signing step required.
            </LegalLi>
            <LegalLi>
              <strong className="text-ink">Vercel</strong> — application hosting and deployment.
            </LegalLi>
            <LegalLi>
              <strong className="text-ink">Anthropic</strong> — processes your
              officiant-conversation answers to generate your ceremony script, vows, and vendor
              rationale, via a direct commercial API relationship (not routed through a
              third-party intermediary). Anthropic&apos;s Data Processing Addendum, incorporating
              Standard Contractual Clauses for data transferred outside the EEA, is automatically
              part of their Commercial Terms of Service. Anthropic does not use API prompts or
              outputs to train its models. Data is retained for up to 30 days by default for
              trust and safety purposes, then deleted, and is encrypted in transit and at rest.
            </LegalLi>
            <LegalLi>
              <strong className="text-ink">Geoapify</strong> — processes your location/category
              search terms to return vendor results (OpenStreetMap-based data).
            </LegalLi>
          </LegalUl>
          <LegalP>
            We do not sell your personal data, and we do not share your ceremony content publicly
            or with anyone other than the processors above, except where required by law.
          </LegalP>

          <LegalH2>International data transfers</LegalH2>
          <LegalP>
            Data processed by Supabase and Anthropic may be transferred outside the EU/EEA,
            typically to the United States. Both providers&apos; Data Processing Addenda
            automatically incorporate Standard Contractual Clauses for this purpose as part of
            their standard commercial terms, requiring no separate action.
          </LegalP>
          <LegalP>
            Vercel, in its role as our application host, may also process data outside the
            EU/EEA in the course of providing hosting infrastructure. We are working to put a
            formal Data Processing Agreement in place with Vercel for this hosting-level
            processing and will update this policy once that is confirmed.
          </LegalP>

          <LegalH2>How long we keep your data</LegalH2>
          <LegalP>
            We retain your account and ceremony data for as long as your account is active. If
            you delete your account, your data is deleted immediately. If your trial expires
            without payment, your data is preserved but inaccessible until you complete the
            one-time payment (see Terms §4) — it is not deleted on that basis alone.
          </LegalP>

          <LegalH2>Your rights</LegalH2>
          <LegalP>
            Under GDPR, you have the right to: access the personal data we hold about you;
            correct inaccurate data; request deletion; request a copy of your data in a portable
            format; object to or restrict certain processing; and lodge a complaint with the CNIL
            (France&apos;s data protection authority, cnil.fr) if you believe your rights
            haven&apos;t been respected. To exercise any of these, contact{" "}
            <a href="mailto:info@weddingsforone.com" className="text-wine underline underline-offset-2">
              info@weddingsforone.com
            </a>
            .
          </LegalP>

          <LegalH2>Cookies and local storage</LegalH2>
          <LegalP>
            The Service uses exactly one type of cookie: Supabase&apos;s own
            authentication-session cookie, which exists solely to keep you logged in. We do not
            use analytics, tracking, or advertising cookies of any kind — no Google Analytics, no
            Vercel Analytics, no tracking pixels, nothing similar. A single piece of browser
            local storage (not a cookie) is used temporarily during signup to hold your
            onboarding quiz answers as you move through that step; it&apos;s functional, not
            tracking-related. Google Fonts used on the site are self-hosted at build time and
            don&apos;t involve any runtime request to Google or any cookie from them.
          </LegalP>

          <LegalH2>Children</LegalH2>
          <LegalP>
            The Service is not intended for anyone under 18, and we do not knowingly collect data
            from minors.
          </LegalP>

          <LegalH2>Changes to this policy</LegalH2>
          <LegalP>
            We&apos;ll update this policy as needed and note material changes clearly rather than
            silently.
          </LegalP>

          <LegalH2>Contact</LegalH2>
          <LegalP>
            <a href="mailto:info@weddingsforone.com" className="text-wine underline underline-offset-2">
              info@weddingsforone.com
            </a>
          </LegalP>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
