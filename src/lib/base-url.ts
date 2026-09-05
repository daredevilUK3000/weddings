import { headers } from "next/headers";

// Server actions don't receive a Request, so there's no req.url to read an
// origin from (unlike API routes, e.g. src/app/auth/callback/route.ts) —
// this reconstructs it from the incoming request's own headers instead.
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
