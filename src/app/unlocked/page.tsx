import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { SignOutButton } from "@/components/sign-out-button";
import { UnlockPoller } from "@/components/unlock-poller";

export const metadata = {
  title: "Welcome back — Weddings for One",
};

export default async function UnlockedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("unlocked_at")
    .eq("id", user.id)
    .single();

  const isUnlocked = !!profile?.unlocked_at;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader right={<SignOutButton />} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        {isUnlocked ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne">
              <span aria-hidden className="font-serif text-2xl italic text-champagne">
                &hearts;
              </span>
            </div>
            <div>
              <p className="text-sm font-medium tracking-wide text-champagne uppercase">
                Payment confirmed
              </p>
              <h1 className="mt-2 font-serif text-3xl font-medium">
                You&apos;re unlocked — welcome back.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">
              Your ceremony is fully yours again, permanently. Thank you for making this a place
              worth paying for.
            </p>
            <Link
              href="/dashboard"
              className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine"
            >
              Go to your ceremonies
            </Link>
          </>
        ) : (
          <>
            <UnlockPoller />
            <div>
              <p className="text-sm font-medium tracking-wide text-champagne uppercase">
                One moment
              </p>
              <h1 className="mt-2 font-serif text-3xl font-medium">Confirming your payment…</h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">
              This usually takes only a few seconds. This page will update on its own — no need
              to refresh or pay again.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
