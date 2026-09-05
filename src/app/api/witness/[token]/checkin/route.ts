import { createServiceClient } from "@/lib/supabase/service";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supabase = createServiceClient();
  const { data: witness } = await supabase
    .from("witnesses")
    .select("id")
    .eq("invite_token", token)
    .single();
  if (!witness) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await supabase
    .from("witnesses")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", witness.id)
    .is("checked_in_at", null);

  return Response.json({ ok: true });
}
