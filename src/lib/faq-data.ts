export interface Faq {
  question: string;
  answer: string;
}

// Ordered as a narrative: legal clarity, who it's for, solo vs. witnessed,
// how the officiant works, quality, deliverables, cost, why this instead of
// a planner, vendor/religious/flexibility follow-ups, privacy, and a warm
// closing reassurance.
export const FAQS: Faq[] = [
  {
    question: "Is this legally binding?",
    answer:
      "No. A Weddings for One ceremony is a personal ritual and commitment to yourself — not a legal marriage, and it carries no legal status, rights, or obligations. It's a way to formally mark a choice you're making about your own life, nothing more and nothing less.",
  },
  {
    question: "Is this just for women?",
    answer:
      "No. Weddings for One is built for anyone choosing to commit to themselves — regardless of gender. Your officiant, your vows, and your ceremony are shaped entirely around you.",
  },
  {
    question: "Do people do this alone, or with guests?",
    answer:
      "Both. Some ceremonies are entirely solo — just you, your officiant, and the moment. Others are witnessed, with friends and family invited to be there for it. You choose the guest count when you build your ceremony, and everything else adapts to match.",
  },
  {
    question: "How does the AI officiant actually work?",
    answer:
      "Your officiant asks you a series of thoughtful questions — why now, what this day means to you, what you want to promise yourself — the way a real officiant would in a planning conversation. From your answers, it writes a ceremony script and a set of vows that sound like you, not like a template.",
  },
  {
    question: "Will my ceremony sound generic, like something an AI wrote?",
    answer:
      "The goal is the opposite. Nothing is generated until you've actually answered the questions — your vows come from what you say, not from a fill-in-the-blank template. You'll also see multiple drafts and can choose or reshape the one that feels most like you.",
  },
  {
    question: "What do I actually get at the end?",
    answer:
      "A full ceremony script, your vows, a timeline for the day, and a Certificate of Self-Commitment you can keep, frame, or share. If you use the planning side, you'll also have a shortlist of vendors and ready-to-send inquiries for your venue, photographer, and anything else you've chosen to arrange.",
  },
  {
    question: "Is there a cost?",
    answer:
      "You get full access to every part of WeddingsForOne — free — for 14 days from when you sign up, so you can actually build your ceremony before deciding anything. After that, a one-time payment of $49 permanently unlocks your ceremony — no recurring subscription.",
  },
  {
    question: "Why would I use this instead of just hiring a wedding planner?",
    answer:
      "Most wedding planners have never worked with someone marrying themselves — their entire process, from vendor relationships to how they talk about \"the couple,\" is built around two people. You'd likely spend your first conversation explaining the idea before you got any real help. Planners are also priced for full-scale events, which rarely makes sense for a smaller, more personal ceremony. And the part of this that matters most — actually shaping your vows and your ceremony's meaning — isn't something a planner typically does at all; that's closer to what an officiant does, which is why it's built into the AI conversation at the center of this platform, not treated as an afterthought. Think of this less as a cheaper wedding planner, and more as something built specifically for a kind of ceremony that planners were never designed to serve.",
  },
  {
    question: "How do I explain this to a vendor who's never heard of it?",
    answer:
      "We've thought about this one specifically. When you shortlist a venue, photographer, or florist, we draft a ready-to-send inquiry that explains what a self-commitment ceremony is in a normal, confident way — so you're never the one having to justify it from scratch.",
  },
  {
    question: "Can I involve a religious or spiritual element in my ceremony?",
    answer:
      "Yes. Your officiant conversation is shaped by what matters to you, so if faith or spirituality is part of that, it can be reflected in your script and vows. The ceremony isn't tied to any one tradition — it's built around yours.",
  },
  {
    question: "Can I change my mind about details after I've started?",
    answer:
      "Yes — nothing is locked in until you're ready. You can revisit your vows, reorder your ceremony timeline, and update vendor choices at any point while you're planning.",
  },
  {
    question: "What happens to my information?",
    answer:
      "Your ceremony content — your answers, your vows, your ceremony details — is private to your account. We don't share it or use it beyond building your ceremony.",
  },
  {
    question: "Do I need to be recently single, or have a particular reason to do this?",
    answer:
      "No. People come to this after a breakup, after a big birthday, after surviving something hard, after a career milestone, or simply because they wanted to. There's no qualifying reason — if it means something to you, that's reason enough.",
  },
];
