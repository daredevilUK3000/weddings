import { generateText, Output } from "ai";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/ai/models";
import { officiantSystemPrompt, type OfficiantContext } from "@/lib/ai/officiant";
import { serializeCeremonyScript, type ScriptSegment } from "@/lib/ceremony-script";

// Every segment of the script must be explicitly typed by the model —
// structured output, not a prose-formatting instruction the model can
// apply inconsistently. This is what actually fixes "some generations
// label the speaker, some don't": the schema makes an untyped/ambiguous
// line impossible to produce, rather than hoping the model remembers to
// prepend a label every time.
const scriptSegmentSchema = z.object({
  type: z
    .enum(["heading", "direction", "officiant", "self"])
    .describe(
      "heading = a short section title, not spoken aloud by anyone (e.g. \"Processional\"). " +
        "direction = stage direction/narration describing setting, action, or atmosphere — " +
        "not spoken aloud by anyone (e.g. \"soft instrumental music plays\"). " +
        "officiant = a line spoken aloud by the officiant. " +
        "self = a line spoken aloud by the client themselves (e.g. their vows or any " +
        "responsive line). Every segment containing spoken words MUST be typed 'officiant' " +
        "or 'self' — never fold spoken words into a 'direction' segment, and never leave a " +
        "spoken segment untyped.",
    ),
  text: z
    .string()
    .describe(
      "The heading, direction, or spoken text itself only — do not include a speaker label " +
        "(e.g. \"OFFICIANT:\") or parentheses in this field; those are added separately based on type.",
    ),
});

const generatedContentSchema = z.object({
  ceremony_script: z
    .array(scriptSegmentSchema)
    .min(1)
    .describe(
      "The full ceremony script broken into ordered segments, covering in order: " +
        "processional, opening words, vows, ring/token exchange if relevant, unity ritual, " +
        "closing words. Written to be read aloud by the officiant and, where typed 'self', " +
        "by the client.",
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

export interface CeremonyContent {
  ceremony_script: string;
  vow_drafts: string[];
  witness_reading: string | null;
}

export async function generateCeremonyContent(
  ctx: OfficiantContext,
  interviewTranscript: string,
): Promise<CeremonyContent> {
  const { output } = await generateText({
    model: CHAT_MODEL,
    system: officiantSystemPrompt(ctx),
    output: Output.object({ schema: generatedContentSchema }),
    prompt: `Here is the interview transcript with the client:\n\n${interviewTranscript}\n\nUsing everything they shared, produce the ceremony script (as ordered, speaker-typed segments), three vow drafts, and an optional witness reading.`,
  });

  return {
    ceremony_script: serializeCeremonyScript(output.ceremony_script as ScriptSegment[]),
    vow_drafts: output.vow_drafts,
    witness_reading: output.witness_reading,
  };
}
