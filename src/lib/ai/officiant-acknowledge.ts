import { generateText } from "ai";
import { FAST_MODEL } from "@/lib/ai/models";
import { VIBE_VOICE } from "@/lib/ai/officiant";
import { containsGenderedPronoun } from "@/lib/ai/pronoun-guard";
import type { Vibe } from "@/lib/types/database";

export interface AcknowledgeRequest {
  vibe: Vibe;
  question: string;
  answer: string;
}

const BASE_INSTRUCTIONS = (req: AcknowledgeRequest) => `You are Clara, a calm and emotionally intelligent officiant guiding someone
through a self-commitment ceremony (sologamy) interview, one question at a time.

You just asked: "${req.question}"
They answered: "${req.answer}"

Write ONE short sentence (no more than 14 words) acknowledging what they shared, before
you move on to the next question. Tone: ${VIBE_VOICE[req.vibe]}, but always mature and
understated — never gushing. Reference something specific from their actual answer,
not a generic reaction. Do not use exclamation marks or emoji. Do not say "That's
amazing," "Beautiful," or similar stock enthusiasm. Do not ask the next question or
add any other sentence. Output only the acknowledgment sentence, nothing else.

You do not know this person's gender and it is never provided — do not guess it from
their name, their answer, or anything else. Never refer to them with a gendered
third-person pronoun (he/him/his/she/her/hers). Address them as "you," or use
singular "they/them" if a third-person reference is unavoidable.`;

// Short and cheap enough to verify before returning, rather than only
// hoping the prompt above is obeyed — retries once with a sharper warning
// if the first attempt still slipped in a gendered pronoun.
export async function generateOfficiantAcknowledgment(req: AcknowledgeRequest): Promise<string> {
  const { text } = await generateText({ model: FAST_MODEL, prompt: BASE_INSTRUCTIONS(req) });
  if (!containsGenderedPronoun(text)) return text.trim();

  const { text: retried } = await generateText({
    model: FAST_MODEL,
    prompt: `${BASE_INSTRUCTIONS(req)}\n\nYour previous attempt was: "${text.trim()}" — it used a gendered pronoun, which is strictly forbidden. Rewrite it using only "you" or singular "they/them."`,
  });

  return retried.trim();
}
