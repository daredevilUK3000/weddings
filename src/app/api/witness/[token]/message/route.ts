import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { body, includeInCeremony }: { body?: string; includeInCeremony?: boolean } =
    await req.json();
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) {
    return Response.json({ error: "Message is required" }, { status: 400 });
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

  const { data: existing } = await supabase
    .from("witness_contributions")
    .select("id")
    .eq("witness_id", witness.id)
    .single();

  if (existing) {
    await supabase
      .from("witness_contributions")
      .update({ body: text, include_in_ceremony: !!includeInCeremony })
      .eq("id", existing.id);
  } else {
    await supabase.from("witness_contributions").insert({
      witness_id: witness.id,
      body: text,
      include_in_ceremony: !!includeInCeremony,
    });
  }

  return Response.json({ ok: true });
}
