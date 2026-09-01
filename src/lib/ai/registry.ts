import { generateText, Output } from "ai";
import { z } from "zod";
import { FAST_MODEL } from "@/lib/ai/models";
import type { Vibe } from "@/lib/types/database";

export const registrySuggestionsSchema = z.object({
  suggestions: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .length(5),
});

export async function generateRegistrySuggestions(ctx: {
  vibe: Vibe;
  reason: string | null;
  budgetBand: string | null;
}) {
  const { output } = await generateText({
    model: FAST_MODEL,
    output: Output.object({ schema: registrySuggestionsSchema }),
    prompt: `Suggest 5 "gift yourself" registry items for someone having a solo wedding
(sologamy) ceremony. Their vibe is ${ctx.vibe}, their reason for the ceremony is
"${ctx.reason ?? "not specified"}", and their budget band is ${ctx.budgetBand ?? "not specified"}.
Mix categories: an experience/trip, a course or skill, a wellness/therapy item, a keepsake
(tattoo/jewelry), and one wildcard. Keep each description to one sentence.`,
  });

  return output.suggestions;
}
