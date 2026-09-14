import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Minimal legitimate health check for App Keeper: a tiny read against a
// small, static-ish table, plus an Auth admin API call, both fresh on every
// request. No caching anywhere in this path, so App Keeper's cache-busted,
// no-store request always reaches Postgres.
export async function GET() {
  const checks: Record<string, "OK" | "FAILED" | "NOT_CHECKED"> = {
    application: "OK",
    supabase: "NOT_CHECKED",
    authentication: "NOT_CHECKED",
    database: "NOT_CHECKED",
  };
  let error: string | undefined;

  try {
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("vendor_categories")
      .select("id")
      .limit(1);

    if (dbError) {
      checks.supabase = "FAILED";
      checks.database = "FAILED";
      error = `Database query failed: ${dbError.message}`;
    } else {
      checks.supabase = "OK";
      checks.database = "OK";
    }
  } catch (err) {
    checks.supabase = "FAILED";
    checks.database = "FAILED";
    error = `Supabase connection failed: ${err instanceof Error ? err.message : String(err)}`;
  }

  try {
    const serviceClient = createServiceClient();
    const { error: authError } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1 });
    checks.authentication = authError ? "FAILED" : "OK";
    if (authError && !error) error = `Authentication check failed: ${authError.message}`;
  } catch (err) {
    checks.authentication = "FAILED";
    if (!error) error = `Authentication check failed: ${err instanceof Error ? err.message : String(err)}`;
  }

  const status = Object.values(checks).includes("FAILED") ? "FAILED" : "OK";

  return Response.json(
    { status, checks, ...(error ? { error } : {}) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
