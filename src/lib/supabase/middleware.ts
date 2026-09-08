import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// /api/witness and /api/certificate/pdf are reachable by an unauthenticated
// witness (via their invite token, resolved inside each route handler) as
// well as by the signed-in owner — each route enforces its own
// authorization, so the middleware only needs to not redirect them away.
// /api/cron/notifications is the same shape of exception: it's called by
// an external scheduler (GitHub Actions) with no Supabase session at all,
// and enforces its own CRON_SECRET bearer-token check.
// /api/webhooks/stripe is the same shape again: Stripe calls it
// server-to-server with no Supabase session, and enforces its own
// authorization via the Stripe signature (see that route).
const PUBLIC_PATHS = [
  "/login",
  "/sign-up",
  "/auth/callback",
  "/onboarding",
  "/faq",
  "/terms",
  "/privacy",
  "/contact",
  "/witness",
  "/api/witness",
  "/api/certificate/pdf",
  "/api/cron",
  "/api/webhooks/stripe",
];

// Routes gated by the 14-day trial lock (see WeddingsStuff for Claude/
// weddingsforone-monetization-trial-lock.md) — the ceremony-building and
// -editing surface, not the dashboard shell itself, so a locked-out user
// can still see their ceremony exists and reach the unlock CTA.
// /api/certificate/pdf and /api/witness are deliberately excluded: they're
// already public paths above with their own bespoke authorization (a
// witness's invite token), and gating them further would conflict with that.
const CEREMONY_LOCK_PATH_PREFIXES = [
  "/ceremonies/",
  "/api/ai/",
  "/api/vendors/",
  "/api/director/",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isPublicPath && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const isCeremonyRoute = CEREMONY_LOCK_PATH_PREFIXES.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    if (isCeremonyRoute) {
      // Fail open on any error or unexpected shape (including running
      // before the trial_ends_at/unlocked_at migration lands) — a lock
      // check that can't confirm someone is locked must never lock them
      // out anyway.
      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_ends_at, unlocked_at")
        .eq("id", user.id)
        .single();

      const isLocked =
        !!profile &&
        !profile.unlocked_at &&
        new Date(profile.trial_ends_at).getTime() < Date.now();

      if (isLocked) {
        if (request.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Your trial has ended. Unlock your ceremony to continue." },
            { status: 403 },
          );
        }
        const url = request.nextUrl.clone();
        url.pathname = "/locked";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
