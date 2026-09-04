import { generateOfficiantAcknowledgment } from "@/lib/ai/officiant-acknowledge";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { ceremonyId, question, answer }: { ceremonyId: string; question: string; answer: string } =
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
    .select("vibe")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const acknowledgment = await generateOfficiantAcknowledgment({
    vibe: ceremony.vibe,
    question,
    answer,
  });

  return Response.json({ acknowledgment });
}
