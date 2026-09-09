import { generateText, Output } from "ai";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/ai/models";
import { officiantSystemPrompt, type OfficiantContext } from "@/lib/ai/officiant";
import { serializeCeremonyScript, type ScriptSegment } from "@/lib/ceremony-script";
import { containsGenderedPronoun, findGenderedPronouns } from "@/lib/ai/pronoun-guard";

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
        "(e.g. \"OFFICIANT:\") or parentheses in this field; those are added separately based " +
        "on type. Never a gendered pronoun (he/him/his/she/her/hers) — the client's gender is " +
        "unknown and never guessed. Address the client as \"you,\" or use singular " +
        "\"they/them/themself\" for any unavoidable third-person reference in direction.",
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
    .describe(
      "Three distinct full-length self-vow drafts the client can choose from or remix. " +
        "Written in first person (\"I promise myself...\") — never a gendered pronoun.",
    ),
  witness_reading: z
    .string()
    .nullable()
    .describe(
      "An optional short reading a friend/witness could deliver, or null if not fitting. " +
        "Never a gendered pronoun about the client — \"you\" or singular \"they/them\" only.",
    ),
});

export interface CeremonyContent {
  ceremony_script: string;
  vow_drafts: string[];
  witness_reading: string | null;
}

function hasGenderedPronoun(output: z.infer<typeof generatedContentSchema>): boolean {
  return (
    output.ceremony_script.some((seg) => containsGenderedPronoun(seg.text)) ||
    output.vow_drafts.some((v) => containsGenderedPronoun(v)) ||
    (output.witness_reading !== null && containsGenderedPronoun(output.witness_reading))
  );
}

// The client's gender is never asked and never known — any gendered
// pronoun in generated content is necessarily an unrequested guess, not a
// style slip. Rather than trust the prompt alone (the previous version of
// this prompt already forbade this and it still happened in production),
// verify the output and regenerate once with a sharper, example-specific
// instruction if a gendered pronoun slipped through.
export async function generateCeremonyContent(
  ctx: OfficiantContext,
  interviewTranscript: string,
): Promise<CeremonyContent> {
  const basePrompt = `Here is the interview transcript with the client:\n\n${interviewTranscript}\n\nUsing everything they shared, produce the ceremony script (as ordered, speaker-typed segments), three vow drafts, and an optional witness reading.`;

  let { output } = await generateText({
    model: CHAT_MODEL,
    system: officiantSystemPrompt(ctx),
    output: Output.object({ schema: generatedContentSchema }),
    prompt: basePrompt,
  });

  if (hasGenderedPronoun(output)) {
    const offending = [
      ...output.ceremony_script.map((s) => s.text),
      ...output.vow_drafts,
      output.witness_reading ?? "",
    ]
      .flatMap((t) => findGenderedPronouns(t))
      .join(", ");

    ({ output } = await generateText({
      model: CHAT_MODEL,
      system: officiantSystemPrompt(ctx),
      output: Output.object({ schema: generatedContentSchema }),
      prompt: `${basePrompt}\n\nYour previous attempt used a gendered pronoun (${offending}) somewhere in the output. This is strictly forbidden — the client's gender is unknown and never guessed, from their name or anything else. Regenerate the entire response using only "you," or singular "they/them/themself" for any unavoidable third-person reference. Do not repeat the mistake.`,
    }));
  }

  return {
    ceremony_script: serializeCeremonyScript(output.ceremony_script as ScriptSegment[]),
    vow_drafts: output.vow_drafts,
    witness_reading: output.witness_reading,
  };
}
