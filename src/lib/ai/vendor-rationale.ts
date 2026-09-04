import { generateText } from "ai";
import { FAST_MODEL } from "@/lib/ai/models";
import type { Vibe } from "@/lib/types/database";

export interface VendorForRationale {
  name: string;
  category: string;
  address: string | null;
}

// Geoapify/OSM data carries no rating or price-level signal, so the
// rationale is now the primary (not secondary) trust signal a user sees —
// it has to work harder on qualitative fit and must never imply a rating
// it doesn't have.
export async function generateVendorRationale(
  vendor: VendorForRationale,
  ctx: { vibe: Vibe; budgetBand: string | null; priorities: string[] },
): Promise<string> {
  const { text } = await generateText({
    model: FAST_MODEL,
    prompt: `You are writing a short recommendation for a vendor, to help a client
planning a solo wedding ceremony decide whether to shortlist them.

You do not have access to review ratings or scores for this vendor. Do not reference
or imply a rating, review count, or popularity — base the recommendation entirely on
how well the vendor's category, location, and any available details match the client's
stated vibe, budget, and priorities.

Vendor name: ${vendor.name}
Category: ${vendor.category}
Location: ${vendor.address ?? "not specified"}
Client vibe/tone: ${ctx.vibe}
Client budget band: ${ctx.budgetBand ?? "not specified"}
Client priorities: ${ctx.priorities.join(", ") || "not specified"}

Write a 1-2 sentence rationale explaining why this vendor could be a good fit for this
specific client's ceremony. Be concrete and specific rather than generic — reference the
vibe/style match directly. If you genuinely don't have enough information to say anything
specific and credible, keep the rationale brief and honest rather than inventing detail
that isn't there. No preamble, no quotes around it.`,
  });

  return text.trim();
}
