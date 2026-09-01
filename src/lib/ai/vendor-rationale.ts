import { generateText } from "ai";
import { FAST_MODEL } from "@/lib/ai/models";
import type { Vibe } from "@/lib/types/database";

export interface VendorForRationale {
  name: string;
  category: string;
  rating: number | null;
  priceLevel: number | null;
  address: string | null;
}

export async function generateVendorRationale(
  vendor: VendorForRationale,
  ctx: { vibe: Vibe; budgetBand: string | null; priorities: string[] },
): Promise<string> {
  const { text } = await generateText({
    model: FAST_MODEL,
    prompt: `You are a wedding planner writing a one-to-two sentence note explaining why a
vendor fits a client planning a solo wedding (sologamy — one person marrying themselves).

Vendor: ${vendor.name} (${vendor.category})
Rating: ${vendor.rating ?? "unrated"} | Price level: ${vendor.priceLevel ?? "unknown"} | ${vendor.address ?? ""}
Client vibe: ${ctx.vibe}
Budget band: ${ctx.budgetBand ?? "not specified"}
Client priorities, ranked: ${ctx.priorities.join(", ") || "not specified"}

Write ONLY the 1-2 sentence rationale, as personalized planner commentary — not a generic
directory blurb. No preamble, no quotes around it.`,
  });

  return text.trim();
}
