// Fixed, canned copy — not AI-generated — per brief §4.6: "a handful of
// milestone messages, not a running commentary." Clara relabels to
// "Wedding Director" for these; the copy itself never changes at runtime.

export type DirectorMilestone = "wedding_day_started" | "ceremony_started" | "ceremony_completed";

const MESSAGES: Record<DirectorMilestone, string> = {
  wedding_day_started:
    "Everything you needed to organise has been organised. Your vows are waiting. From this point onwards, you don't have to plan your wedding. You only have to experience it.",
  ceremony_started: "It's time. Everything is ready. So are you.",
  ceremony_completed: "You did it. This is real, and it's yours.",
};

export function getDirectorMessage(milestone: DirectorMilestone): string {
  return MESSAGES[milestone];
}
