import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { status }: { status?: string } = await req.json();

  if (status !== "accepted" && status !== "declined") {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

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
    .update({ rsvp_status: status, rsvp_at: new Date().toISOString() })
    .eq("id", witness.id);

  return Response.json({ ok: true });
}
