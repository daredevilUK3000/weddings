import { escapeHtml, emailShell, emailButton } from "./shared";

// The three Wedding Director milestone checks (brief §9.2) — a status
// nudge toward the Director page, not a task list. Kept together since
// all three share the same shape and differ only in framing.

function directorCheckEmail(params: {
  hostName: string;
  headline: string;
  body: string;
  directorUrl: string;
}): { subject: string; html: string } {
  const html = emailShell(`
    <p style="font-size:15px;">Dear ${escapeHtml(params.hostName)},</p>
    <p style="font-size:16px; line-height:1.6;">${params.body}</p>
    ${emailButton(params.directorUrl, "Open Wedding Director")}
  `);
  return { subject: params.headline, html };
}

export function director7DayEmail(params: { hostName: string; directorUrl: string }) {
  return directorCheckEmail({
    ...params,
    headline: "Your wedding day is one week away",
    body: "One week to go. Wedding Director has everything you've planned, brought together in one place — take a look whenever you're ready.",
  });
}

export function director24HourEmail(params: { hostName: string; directorUrl: string }) {
  return directorCheckEmail({
    ...params,
    headline: "Your wedding day is tomorrow",
    body: "Tomorrow's the day. Everything you needed to organise has been organised — Wedding Director will walk with you through it.",
  });
}

export function director30MinEmail(params: { hostName: string; directorUrl: string }) {
  return directorCheckEmail({
    ...params,
    headline: "Your ceremony begins in 30 minutes",
    body: "Your ceremony begins in half an hour. From here, you don't have to plan anything else — you only have to experience it.",
  });
}
