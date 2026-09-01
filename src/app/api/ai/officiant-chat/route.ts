import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_MODEL } from "@/lib/ai/models";
import { officiantSystemPrompt } from "@/lib/ai/officiant";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, ceremonyId }: { messages: UIMessage[]; ceremonyId: string } =
    await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, reason, guest_count, location")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  if (!ceremony) {
    return new Response("Ceremony not found", { status: 404 });
  }

  const result = streamText({
    model: CHAT_MODEL,
    system: officiantSystemPrompt({
      vibe: ceremony.vibe,
      reason: ceremony.reason,
      guestCount: ceremony.guest_count,
      location: ceremony.location,
    }),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
