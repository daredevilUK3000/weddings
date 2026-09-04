import { generateCeremonyContent } from "@/lib/ai/ceremony-content";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { ceremonyId, interviewTranscript }: { ceremonyId: string; interviewTranscript: string } =
    await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, reason, guest_count, location")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const content = await generateCeremonyContent(
    {
      vibe: ceremony.vibe,
      reason: ceremony.reason,
      guestCount: ceremony.guest_count,
      location: ceremony.location,
      clientName: profile?.name ?? null,
    },
    interviewTranscript,
  );

  const { error } = await supabase
    .from("ceremonies")
    .update({
      ceremony_script: content.ceremony_script,
      vows: content.vow_drafts.join("\n\n---\n\n"),
      witness_reading: content.witness_reading,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ceremonyId)
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(content);
}
