import type { Vibe } from "@/lib/types/database";
import { escapeHtml, emailShell, emailButton } from "./shared";

// One intro line per vibe so the invitation reads as ceremony-appropriate,
// per brief §6.3 ("a gothic-romantic ceremony should not produce the same
// invitation as a minimalist one") and §9.4 (never twee, never defensive
// about sologamy).
const VIBE_INTROS: Record<Vibe, string> = {
  spiritual: "You are invited to witness something sacred.",
  glam: "You are invited to witness something unforgettable.",
  minimalist: "You are invited to witness something meaningful.",
  gothic_romantic: "You are invited to witness something profound.",
  funny: "You are invited to witness something wonderfully real.",
};

export function witnessInvitationEmail(params: {
  witnessName: string;
  hostName: string;
  vibe: Vibe;
  dateLine: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { witnessName, hostName, vibe, dateLine, portalUrl } = params;
  const intro = VIBE_INTROS[vibe] ?? VIBE_INTROS.minimalist;
  const host = escapeHtml(hostName);

  const subject = `${hostName} has invited you to their Witness Circle`;
  const html = emailShell(`
    <p style="font-size:15px;">Dear ${escapeHtml(witnessName)},</p>
    <p style="font-size:16px; line-height:1.6;">${intro}</p>
    <p style="font-size:16px; line-height:1.6;">
      ${host} will make a formal commitment to themself. They've asked you to be
      part of their Witness Circle — a small group invited to witness and
      acknowledge that commitment.
    </p>
    ${dateLine ? `<p style="font-size:14px; color:#6B6259;">${escapeHtml(dateLine)}</p>` : ""}
    ${emailButton(portalUrl, "Accept Invitation")}
  `);

  return { subject, html };
}
