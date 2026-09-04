export interface Faq {
  question: string;
  answer: string;
}

// Ordered as a narrative: credibility, then legal clarity, who it's for,
// solo vs. witnessed, how the officiant works, quality, deliverables,
// cost, privacy, and a warm closing reassurance.
export const FAQS: Faq[] = [
  {
    question: "Isn't this just a joke, or a gimmick?",
    answer:
      "It isn't. Self-commitment ceremonies (sometimes called sologamy) have been part of the cultural conversation for two decades, and for the people who do them, the reasons are usually serious: recovering from something difficult, marking a milestone, or simply deciding they're done waiting for permission to celebrate their own life. We built this to give that moment the same care a traditional wedding gets — not to make light of it.",
  },
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
    // Revisit once pricing/tiering is decided — this answer is deliberately
    // non-committal while the paywall is on hold. Update the copy, don't
    // build conditional logic around it until real tiers exist.
    question: "Is there a cost?",
    answer:
      "Weddings for One is currently free to use while we're in early access and refining the platform around real ceremonies. If that changes down the line, existing users will hear about it directly rather than being surprised by it.",
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
