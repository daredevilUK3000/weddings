// Shared contract between ceremony script generation (src/lib/ai/ceremony-content.ts)
// and display (the Builder page): a canonical, unambiguous plain-text format
// for who speaks each part of the script, stored as-is in
// ceremonies.ceremony_script (still a plain text column — no schema change).
//
// Generation produces strongly-typed segments (see ScriptSegment) and
// serializes them into this format, so every new script is reliably
// labeled rather than depending on the model to freely format prose
// consistently. The parser then re-reads that same format for display, and
// falls back to a plain paragraph for anything it doesn't recognize — so
// older scripts generated before this format existed still render, just
// without the enhanced speaker styling until regenerated.

export type ScriptSegmentType = "heading" | "direction" | "officiant" | "self";

export interface ScriptSegment {
  type: ScriptSegmentType;
  text: string;
}

export interface ParsedScriptBlock {
  type: ScriptSegmentType | "plain";
  text: string;
}

export function serializeCeremonyScript(segments: ScriptSegment[]): string {
  return segments
    .map((segment) => {
      const text = segment.text.trim();
      switch (segment.type) {
        case "heading":
          return text.toUpperCase();
        case "direction":
          return text.startsWith("(") && text.endsWith(")") ? text : `(${text})`;
        case "officiant":
          return `OFFICIANT:\n${text}`;
        case "self":
          return `YOU:\n${text}`;
        default:
          return text;
      }
    })
    .join("\n\n");
}

export function parseCeremonyScript(raw: string): ParsedScriptBlock[] {
  const blocks = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block): ParsedScriptBlock => {
    const labelMatch = block.match(/^(OFFICIANT|YOU):\s*([\s\S]*)$/i);
    if (labelMatch) {
      const type: ScriptSegmentType = labelMatch[1].toUpperCase() === "OFFICIANT" ? "officiant" : "self";
      return { type, text: labelMatch[2].trim() };
    }

    if (/^\([\s\S]*\)$/.test(block)) {
      return { type: "direction", text: block.slice(1, -1).trim() };
    }

    // A short, single-line, all-caps block with no terminal punctuation
    // reads as a section heading (e.g. "PROCESSIONAL") — matches the
    // convention the generation prompt already produced inconsistently.
    const isHeadingLike =
      !block.includes("\n") &&
      block.length <= 40 &&
      block === block.toUpperCase() &&
      /[A-Z]/.test(block) &&
      !/[.!?]$/.test(block);
    if (isHeadingLike) {
      return { type: "heading", text: block };
    }

    // Fallback for scripts generated before this format existed, or any
    // block that doesn't match — render as plain prose rather than
    // guessing at a speaker.
    return { type: "plain", text: block };
  });
}
