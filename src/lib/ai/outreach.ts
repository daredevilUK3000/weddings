import { generateText } from "ai";
import { CHAT_MODEL } from "@/lib/ai/models";
import type { Vibe } from "@/lib/types/database";

export interface OutreachRequest {
  category: string;
  vendorName: string;
  vibe: Vibe;
  date: string | null;
  location: string | null;
  budgetBand: string | null;
  guestCount: number;
  clientName: string;
  categorySpecificAsk: string;
}

export async function generateOutreachDraft(req: OutreachRequest): Promise<string> {
  const { text } = await generateText({
    model: CHAT_MODEL,
    prompt: `You are drafting a vendor inquiry message on behalf of a client planning a
solo wedding ceremony (sologamy) — a self-commitment ceremony celebrating
one person, with ${req.guestCount} guests attending as witnesses.

Vendor category: ${req.category}
Vendor name: ${req.vendorName}
Client vibe/tone: ${req.vibe}
Date/season: ${req.date ?? "flexible"}
Location: ${req.location ?? "not specified"}
Budget band: ${req.budgetBand ?? "not specified"}
Specific ask: ${req.categorySpecificAsk}

Write a warm, concise inquiry message that:
1. Briefly and confidently explains the event is a solo wedding/self-
   commitment ceremony (assume the vendor may not have heard of this —
   one short clarifying sentence, framed normally, not apologetically)
2. States the practical details plainly: date, guest count, location,
   what's needed from this vendor
3. Asks 2-3 concrete questions (availability, pricing for the guest
   count, any package options)
4. Keeps a confident, non-defensive tone throughout — this is a
   legitimate booking, not a novelty request
5. Signs off with the client's name only (no company/platform branding,
   since this is sent as the client, copy-pasted by them)

Client's name for sign-off: ${req.clientName}

Keep it under 150 words. Match formality to vendor category (formal for
venues/caterers, slightly warmer for photographers/florists). Output ONLY
the message text, no subject line, no preamble.`,
  });

  return text.trim();
}
