import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = {
  title: "Your ceremony is saved — Weddings for One",
};

export default async function LockedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at, unlocked_at")
    .eq("id", user.id)
    .single();

  // Only reachable if actually locked — otherwise send them back in, so a
  // stale bookmark or a completed unlock never strands someone here.
  const isLocked =
    !!profile &&
    !profile.unlocked_at &&
    new Date(profile.trial_ends_at).getTime() < new Date().getTime();
  if (!isLocked) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader right={<SignOutButton />} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne">
          <span aria-hidden className="font-serif text-2xl italic text-champagne">
            &hearts;
          </span>
        </div>

        <div>
          <p className="text-sm font-medium tracking-wide text-champagne uppercase">
            Your trial has ended
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium">Your ceremony is complete, and saved.</h1>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          Everything you&apos;ve built — your script, vows, vendor shortlist, budget, and
          certificate — is exactly as you left it. Nothing has been deleted. A one-time payment
          unlocks it permanently, for as long as WeddingsForOne exists.
        </p>

        <a
          href="mailto:info@weddingsforone.com?subject=Unlock%20my%20ceremony"
          className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
        >
          Unlock your ceremony
        </a>

        <p className="text-xs text-ink-soft">
          Payment is being finalized — email us and we&apos;ll unlock it for you directly in the
          meantime.
        </p>

        <Link
          href="/dashboard"
          className="text-sm text-ink-soft underline decoration-ink-soft/30 underline-offset-2 hover:text-ink"
        >
          Back to your ceremonies
        </Link>
      </main>
    </div>
  );
}
