export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const INK = "#20201D";
const IVORY = "#F7F3EC";
const INK_SOFT = "#6B6259";

export function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family: Georgia, 'Cormorant Garamond', serif; color:${INK}; max-width:480px; margin:0 auto; padding:8px;">
      ${bodyHtml}
      <p style="margin-top:32px; font-size:11px; letter-spacing:2px; color:${INK_SOFT}; text-transform:uppercase;">
        Weddings for One
      </p>
    </div>
  `;
}

export function emailButton(href: string, label: string): string {
  return `
    <p style="margin:28px 0;">
      <a href="${href}" style="display:inline-block; background:${INK}; color:${IVORY}; padding:12px 26px; text-decoration:none; letter-spacing:1px; font-size:14px;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}
