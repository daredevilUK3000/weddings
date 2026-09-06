import { escapeHtml, emailShell, emailButton } from "./shared";

// Sent only to witnesses who haven't yet responded (§9.2's second
// pre-ceremony touch) — an informational nudge, never framed as overdue.
export function witnessReminderEmail(params: {
  witnessName: string;
  hostName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { witnessName, hostName, portalUrl } = params;

  const subject = `A gentle reminder from ${hostName}'s Witness Circle`;
  const html = emailShell(`
    <p style="font-size:15px;">Dear ${escapeHtml(witnessName)},</p>
    <p style="font-size:16px; line-height:1.6;">
      ${escapeHtml(hostName)}'s ceremony is coming up, and you haven't yet let them know
      whether you'll be part of their Witness Circle.
    </p>
    ${emailButton(portalUrl, "Respond to Invitation")}
  `);

  return { subject, html };
}
