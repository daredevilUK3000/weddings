import { escapeHtml, emailShell, emailButton } from "./shared";

export function witnessSigningRequestEmail(params: {
  witnessName: string;
  hostName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { witnessName, hostName, portalUrl } = params;
  const host = escapeHtml(hostName);

  const subject = `Add your signature to ${hostName}'s certificate`;
  const html = emailShell(`
    <p style="font-size:15px;">Dear ${escapeHtml(witnessName)},</p>
    <p style="font-size:16px; line-height:1.6;">
      ${host} has completed their ceremony. As a member of their Witness Circle,
      you've been invited to add your signature to their Certificate of
      Self-Commitment.
    </p>
    ${emailButton(portalUrl, "Sign Certificate")}
  `);

  return { subject, html };
}
