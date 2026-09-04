import { generateText } from "ai";
import { FAST_MODEL } from "@/lib/ai/models";
import { VIBE_VOICE } from "@/lib/ai/officiant";
import type { Vibe } from "@/lib/types/database";

export interface AcknowledgeRequest {
  vibe: Vibe;
  question: string;
  answer: string;
}

export async function generateOfficiantAcknowledgment(req: AcknowledgeRequest): Promise<string> {
  const { text } = await generateText({
    model: FAST_MODEL,
    prompt: `You are Clara, a calm and emotionally intelligent officiant guiding someone
through a self-commitment ceremony (sologamy) interview, one question at a time.

You just asked: "${req.question}"
They answered: "${req.answer}"

Write ONE short sentence (no more than 14 words) acknowledging what they shared, before
you move on to the next question. Tone: ${VIBE_VOICE[req.vibe]}, but always mature and
understated — never gushing. Reference something specific from their actual answer,
not a generic reaction. Do not use exclamation marks or emoji. Do not say "That's
amazing," "Beautiful," or similar stock enthusiasm. Do not ask the next question or
add any other sentence. Output only the acknowledgment sentence, nothing else.`,
  });

  return text.trim();
}
