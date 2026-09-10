import { createClient } from "@/lib/supabase/server";
import { MarketingNav, MarketingFooter } from "@/components/marketing-chrome";
import { LegalH2, LegalP, LegalUl, LegalLi } from "@/components/legal-prose";
import { Eyebrow } from "@/components/eyebrow";

export const metadata = {
  title: "Terms & Conditions — Weddings for One",
  description: "The terms that apply when you create an account and use WeddingsForOne.",
};

const LAST_UPDATED = "September 8, 2026";

export default async function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-ink-soft">Last updated: {LAST_UPDATED}</p>

          <LegalP>
            Welcome to WeddingsForOne (&ldquo;the Service,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;),
            operated by Business Game Changer Magazine. WeddingsForOne is a trading name (nom
            commercial) of Kizzi Nkwocha, sole trader (auto-entrepreneur) registered in France,
            SIRET: 813 208 790 00010. By creating an account or using the Service, you agree to
            these Terms.
          </LegalP>

          <LegalH2>1. What WeddingsForOne is</LegalH2>
          <LegalP>
            WeddingsForOne is a planning platform for self-commitment ceremonies. We provide
            AI-assisted ceremony planning tools, including an AI officiant conversation, ceremony
            script and vow generation, vendor recommendations, budget tracking, and a printable
            Certificate of Self-Commitment. WeddingsForOne is not a legal, religious, or
            government authority. A self-commitment ceremony conducted using this Service has no
            legal effect and does not constitute marriage, civil partnership, or any legally
            recognized status. The Certificate of Self-Commitment is a personal, symbolic
            keepsake, not a legal or government document.
          </LegalP>

          <LegalH2>2. Eligibility</LegalH2>
          <LegalP>You must be at least 18 years old to create an account and use the Service.</LegalP>

          <LegalH2>3. Your account</LegalH2>
          <LegalP>
            You&apos;re responsible for keeping your login credentials secure and for activity
            that happens under your account. Let us know at{" "}
            <a href="mailto:info@weddingsforone.com" className="text-wine underline underline-offset-2">
              info@weddingsforone.com
            </a>{" "}
            if you believe your account has been compromised.
          </LegalP>

          <LegalH2>4. Trial and payment</LegalH2>
          <LegalP>
            New accounts receive full access to the Service free of charge for 14 days from the
            date of signup. After the trial period, continued access requires a one-time payment
            of $49 to permanently unlock your ceremony. Your ceremony content is preserved, not
            deleted, when your trial expires — you&apos;ll simply need to complete payment to
            access or edit it again.
          </LegalP>
          <LegalP>
            <strong className="text-ink">&ldquo;Permanent&rdquo; access.</strong> A one-time
            payment unlocks your ceremony for as long as WeddingsForOne operates as a service. In
            the unlikely event we discontinue the Service entirely, we will provide at least 60
            days&apos; advance notice and a way to export or download your ceremony content
            before shutdown. &ldquo;Permanent&rdquo; access is not a guarantee independent of the
            Service&apos;s continued operation, and does not entitle you to compensation, a
            refund, or continued access if the Service is discontinued, provided we meet the
            notice-and-export commitment above.
          </LegalP>

          <LegalH2>5. Your content</LegalH2>
          <LegalP>
            Ceremony content you create — your answers, vows, ceremony script, and related
            details — belongs to you. We don&apos;t claim ownership of it. We use it only to
            provide the Service to you (see our{" "}
            <a href="/privacy" className="text-wine underline underline-offset-2">
              Privacy Policy
            </a>{" "}
            for detail on how AI-generation works).
          </LegalP>

          <LegalH2>6. AI-generated content</LegalH2>
          <LegalP>
            Ceremony scripts, vows, and vendor recommendations are generated with the help of AI
            based on what you tell us. While we&apos;ve built this to reflect your own answers
            rather than generic templates, you&apos;re responsible for reviewing and
            personalizing anything generated before you use it in your actual ceremony.
          </LegalP>

          <LegalH2>7. Vendor Concierge</LegalH2>
          <LegalP>
            WeddingsForOne helps you find and draft outreach to vendors (venues, photographers,
            florists, etc.). We do not book, pay, or contract with vendors on your behalf, and we
            are not a party to any agreement you make with a vendor. Any arrangement with a
            vendor is directly between you and them.
          </LegalP>

          <LegalH2>8. Acceptable use</LegalH2>
          <LegalUl>
            <LegalLi>Don&apos;t use the Service to harass, impersonate, or harm others.</LegalLi>
            <LegalLi>Don&apos;t attempt to disrupt or reverse-engineer the platform.</LegalLi>
            <LegalLi>
              Don&apos;t use generated content for purposes unrelated to your own ceremony
              planning without permission.
            </LegalLi>
          </LegalUl>

          <LegalH2>9. Termination</LegalH2>
          <LegalP>
            You may delete your account and ceremony data at any time from within the app. We may
            suspend or terminate accounts that violate these Terms.
          </LegalP>

          <LegalH2>10. Limitation of liability</LegalH2>
          <LegalP>
            The Service is provided &ldquo;as is.&rdquo; We aren&apos;t liable for decisions you
            make based on AI-generated content, for your dealings with third-party vendors, or
            for indirect or consequential damages arising from use of the Service, to the extent
            permitted by French law.
          </LegalP>

          <LegalH2>11. Changes to these Terms</LegalH2>
          <LegalP>
            We may update these Terms from time to time. Material changes will be communicated to
            you directly (e.g. by email) rather than silently changing underneath you.
          </LegalP>

          <LegalH2>12. Governing law</LegalH2>
          <LegalP>
            These Terms are governed by French law. Disputes will be handled in the competent
            courts of France, without prejudice to any mandatory consumer-protection rights you
            have as a resident of the EU.
          </LegalP>

          <LegalH2>13. Contact</LegalH2>
          <LegalP>
            Questions about these Terms:{" "}
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
