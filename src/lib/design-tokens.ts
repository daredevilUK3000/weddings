// Shared class-name constants for the "bold" design system (see
// WeddingsStuff for Claude/weddingsforone-design-system-bold-sitewide.md
// and its two reference mockups: dashboard-mockup-bold.html for the
// hero/first-run scale, onboarding-question-mockup-bold.html for the
// mid-flow scale — values below are transcribed from those, not
// approximated). The point of centralizing these is the brief's own core
// complaint: without one source of truth, buttons/inputs drift (the grey
// disabled Continue button read as an "ungoverned color" once there was a
// real system to compare it against). Pulling from one constant means
// every primary button site-wide changes together, on purpose.
//
// Tailwind's JIT compiler statically scans source for literal class
// strings — it cannot see a class assembled at runtime from a template
// literal. Every export here is a plain string for that reason; don't
// turn these into functions that interpolate a variable into an
// `animate-[...]`/arbitrary-value class, or the utility silently won't
// exist in the shipped CSS.

// Primary action, mid-flow scale (onboarding questions, officiant chat,
// most of the app) — ink background, ivory text, wine on hover. There
// must be exactly one "loud" button style in the app; everything else
// uses SECONDARY_LINK_CLASS. Disabled state uses opacity, not a color
// swap — that's the correct "not ready yet" affordance, not a bug.
export const PRIMARY_BUTTON_CLASS =
  "inline-flex w-fit items-center gap-3 rounded-sm bg-ink px-8 py-[17px] text-[14.5px] font-medium tracking-[0.4px] text-ivory transition-all hover:-translate-y-px hover:bg-wine disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-ink";

// Larger variant for hero/first-run moments only (dashboard empty state,
// and any future full-bleed "moment" screen at that same scale).
export const PRIMARY_BUTTON_HERO_CLASS =
  "inline-flex w-fit items-center gap-3 rounded-sm bg-ink px-[34px] py-[19px] text-[14.5px] font-medium tracking-[0.4px] text-ivory transition-all hover:-translate-y-px hover:bg-wine disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-ink";

// Secondary/tertiary — muted text only, never a second competing button
// shape. Matches the mockups' "skip" link exactly (45% ink, full ink +
// visible underline on hover).
export const SECONDARY_LINK_CLASS =
  "border-b border-transparent text-[13px] text-ink/45 transition-colors hover:border-ink/30 hover:text-ink";

// Functional form fields (a date, a budget amount) — plain Inter, same
// frame as the emotional variant below.
export const INPUT_CLASS =
  "rounded-[2px] border border-[rgba(184,150,110,0.5)] bg-white px-4 py-3 text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-dusty-rose focus:shadow-[0_0_0_3px_rgba(185,130,122,0.12)]";

// Reflective/emotional fields (vow drafting, officiant answers) — italic
// Cormorant Garamond content, per the onboarding mockup's textarea exactly.
export const INPUT_EMOTIONAL_CLASS =
  "rounded-[2px] border border-[rgba(184,150,110,0.5)] bg-white px-6 py-[22px] font-serif text-[19px] text-ink italic leading-[1.6] outline-none transition-[border-color,box-shadow] duration-200 placeholder:not-italic placeholder:text-ink/35 focus:border-dusty-rose focus:shadow-[0_0_0_3px_rgba(185,130,122,0.12)]";

// Mid-flow "riseIn" stagger (onboarding-question-mockup-bold.html exactly):
// eyebrow at 0.7s/0s, headline at 0.8s/0.08s, field at 0.8s/0.16s, actions
// at 0.8s/0.24s. Distinct timing from the hero stagger below — the two
// mockups don't share one animation schedule, so neither should the code.
export const RISE_IN_EYEBROW = "rise-in-el animate-[riseIn_0.7s_ease_both]";
export const RISE_IN_HEADLINE = "rise-in-el animate-[riseIn_0.8s_ease_0.08s_both]";
export const RISE_IN_FIELD = "rise-in-el animate-[riseIn_0.8s_ease_0.16s_both]";
export const RISE_IN_ACTIONS = "rise-in-el animate-[riseIn_0.8s_ease_0.24s_both]";

// Hero stagger (dashboard-mockup-bold.html exactly): headline/subhead/cta
// at 0.9s with 0s/0.1s/0.2s delays, keepsake card at 1s/0.3s.
export const RISE_IN_HERO_HEADLINE = "rise-in-el animate-[riseIn_0.9s_ease_both]";
export const RISE_IN_HERO_SUBHEAD = "rise-in-el animate-[riseIn_0.9s_ease_0.1s_both]";
export const RISE_IN_HERO_CTA = "rise-in-el animate-[riseIn_0.9s_ease_0.2s_both]";
export const RISE_IN_HERO_CARD = "rise-in-el animate-[riseIn_1s_ease_0.3s_both]";
