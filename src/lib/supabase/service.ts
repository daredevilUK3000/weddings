import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Service-role client — bypasses RLS entirely. Only for server-only code
// paths that enforce their own authorization (the witness portal's token
// lookup, the notification budget service). Never expose this to a route
// that trusts client-supplied identity without an independent check.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
