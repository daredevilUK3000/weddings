import { generateText, Output } from "ai";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/ai/models";
import { officiantSystemPrompt, type OfficiantContext } from "@/lib/ai/officiant";

export const ceremonyContentSchema = z.object({
  ceremony_script: z
    .string()
    .describe(
      "Full ceremony script in order: processional, opening words, vows, ring/token exchange " +
        "if relevant, unity ritual, closing words. Written to be read aloud by the officiant.",
    ),
  vow_drafts: z
    .array(z.string())
    .length(3)
    .describe("Three distinct full-length self-vow drafts the client can choose from or remix."),
  witness_reading: z
    .string()
    .nullable()
    .describe("An optional short reading a friend/witness could deliver, or null if not fitting."),
});

export type CeremonyContent = z.infer<typeof ceremonyContentSchema>;

export async function generateCeremonyContent(
  ctx: OfficiantContext,
  interviewTranscript: string,
): Promise<CeremonyContent> {
  const { output } = await generateText({
    model: CHAT_MODEL,
    system: officiantSystemPrompt(ctx),
    output: Output.object({ schema: ceremonyContentSchema }),
    prompt: `Here is the interview transcript with the client:\n\n${interviewTranscript}\n\nUsing everything they shared, produce the ceremony script, three vow drafts, and an optional witness reading.`,
  });

  return output;
}
