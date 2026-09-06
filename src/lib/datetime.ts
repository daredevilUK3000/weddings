// Hand-rolled — no date library added, consistent with format-ceremony-date.ts.
// Only two operations are ever needed: build the ceremony's start Date from
// its separate date/time columns, and render a short relative-time string
// against it.

export function ceremonyStartDate(date: string | null, startTime: string | null): Date | null {
  if (!date) return null;
  const time = startTime ?? "00:00:00";
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) return diffMs >= 0 ? "starting now" : "just started";

  if (absMinutes < 60) {
    const unit = absMinutes === 1 ? "minute" : "minutes";
    return diffMinutes > 0 ? `in ${absMinutes} ${unit}` : `${absMinutes} ${unit} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) {
    const unit = absHours === 1 ? "hour" : "hours";
    return diffHours > 0 ? `in ${absHours} ${unit}` : `${absHours} ${unit} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  const unit = absDays === 1 ? "day" : "days";
  return diffDays > 0 ? `in ${absDays} ${unit}` : `${absDays} ${unit} ago`;
}
