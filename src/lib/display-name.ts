// A user-facing display name, never a raw email address. Every place that
// addresses the ceremony owner by name in generated content (a witness
// invitation, the certificate, a vendor inquiry, a director check-in email)
// must go through this — an email address showing up in a message meant to
// feel personal reads as impersonal, and in third-party-facing messages
// (witness emails, vendor inquiries) exposes the owner's email to someone
// who has no reason to see it. There is no fallback path here that can
// resolve to an email; callers pass a plain phrase for when no name is set.
export function displayName(name: string | null | undefined, fallback: string): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : fallback;
}
