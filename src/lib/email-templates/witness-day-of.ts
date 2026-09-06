import { escapeHtml, emailShell, emailButton } from "./shared";

// The final pre-ceremony touch (§9.2) — sent to every witness regardless
// of RSVP, since even an undecided witness should know the day has come.
export function witnessDayOfEmail(params: {
  witnessName: string;
  hostName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { witnessName, hostName, portalUrl } = params;

  const subject = `Today's the day — ${hostName}'s ceremony`;
  const html = emailShell(`
    <p style="font-size:15px;">Dear ${escapeHtml(witnessName)},</p>
    <p style="font-size:16px; line-height:1.6;">
      Today, ${escapeHtml(hostName)} will make a formal commitment to themself. Your Witness
      Circle link has everything you need for today.
    </p>
    ${emailButton(portalUrl, "Open Your Invitation")}
  `);

  return { subject, html };
}
