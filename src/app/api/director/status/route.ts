import { createClient } from "@/lib/supabase/server";
import { advanceStatus, type DirectorAction } from "@/lib/ceremony-status";

const VALID_ACTIONS: DirectorAction[] = ["start_wedding_day", "begin_ceremony", "finish_ceremony"];

export async function POST(req: Request) {
  const { ceremonyId, action }: { ceremonyId?: string; action?: string } = await req.json();

  if (!ceremonyId || !action || !VALID_ACTIONS.includes(action as DirectorAction)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("id")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();
  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const result = await advanceStatus(ceremonyId, action as DirectorAction);
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 409 });
  }

  return Response.json({ ok: true });
}
