// Detects a gendered third-person pronoun about the client in generated
// text. This app never asks the client's gender/pronouns, so any of these
// appearing in AI-generated content is necessarily an unrequested guess —
// there is no legitimate source for one. "they/them/their" are always fine
// and never flagged.
//
// Deliberately detection-only, not auto-correction: swapping "her" to
// "their"/"them" without knowing whether it's possessive or objective case
// risks producing broken grammar that reads worse than the original. See
// src/lib/ai/ceremony-content.ts for how this is used to trigger a
// regenerate-with-a-stronger-instruction retry instead.
const GENDERED_PRONOUN = /\b(he|him|his|she|her|hers|himself|herself)\b/i;

export function containsGenderedPronoun(text: string): boolean {
  return GENDERED_PRONOUN.test(text);
}

export function findGenderedPronouns(text: string): string[] {
  const matches = text.match(new RegExp(GENDERED_PRONOUN.source, "gi"));
  return matches ? [...new Set(matches.map((m) => m.toLowerCase()))] : [];
}
