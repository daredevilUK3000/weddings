// The six fixed stages of the officiant interview. Deliberately not
// AI-improvised — the questions themselves are part of the designed
// experience, per the Officiant Experience Redesign brief. Only the
// acknowledgment between stages is generated (see lib/ai/officiant-acknowledge.ts).

export interface OfficiantStage {
  stageLabel: string;
  question: string;
  supportingText: string;
}

export const OFFICIANT_STAGES: OfficiantStage[] = [
  {
    stageLabel: "Your Story",
    question: "What brought you here?",
    supportingText: "What made you decide that you wanted this moment — for yourself?",
  },
  {
    stageLabel: "This Moment",
    question: "Why does this ceremony matter to you now?",
    supportingText: "Whatever brought you to this moment is reason enough.",
  },
  {
    stageLabel: "Who You've Become",
    question: "What are you proudest of becoming?",
    supportingText: "Not what you've achieved — who you've become in the process.",
  },
  {
    stageLabel: "Your Promises",
    question: "What do you want to promise yourself?",
    supportingText: "These words may become part of the vows you speak.",
  },
  {
    stageLabel: "Your Future",
    question: "What would you like the next chapter of your life to look like?",
    supportingText: "There's no need to have it figured out — just tell me what you're hoping for.",
  },
  {
    stageLabel: "The Ceremony",
    question:
      "If you could have everyone hear one thing about this moment, what would you want them to know?",
    supportingText: "This will help shape the words spoken on the day.",
  },
];
