import { createCeremony } from "./actions";
import { AppHeader } from "@/components/app-header";

const VIBES = [
  { value: "spiritual", label: "Spiritual" },
  { value: "glam", label: "Glam" },
  { value: "minimalist", label: "Minimalist" },
  { value: "gothic_romantic", label: "Gothic Romantic" },
  { value: "funny", label: "Funny" },
];

const BUDGET_BANDS = ["Under $1,000", "$1,000–$3,000", "$3,000–$7,000", "$7,000+"];

const PRIORITIES = [
  { value: "venue", label: "Venue" },
  { value: "photography", label: "Photography" },
  { value: "catering", label: "Food" },
  { value: "florist", label: "Flowers" },
  { value: "hair_makeup", label: "Hair & Makeup" },
];

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader homeHref="/dashboard" />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-16">
        <div>
          <h1 className="font-serif text-3xl font-medium">Tell us about your ceremony</h1>
          <p className="mt-2 text-ink-soft">
            This shapes everything from your vows to your vendor shortlist.
          </p>
        </div>

        <form action={createCeremony} className="flex flex-col gap-7">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Why now?</span>
            <textarea
              name="reason"
              rows={3}
              placeholder="A milestone, a recovery, a career win, a simple yes to yourself…"
              className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Vibe / tone</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VIBES.map((v) => (
                <label
                  key={v.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm has-[:checked]:border-rust has-[:checked]:bg-rust/5"
                >
                  <input type="radio" name="vibe" value={v.value} required />
                  {v.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Guest count</span>
              <input
                type="number"
                name="guest_count"
                min={0}
                defaultValue={0}
                className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Date (optional)</span>
              <input
                type="date"
                name="date"
                className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Location</span>
            <input
              type="text"
              name="location"
              placeholder="City, region…"
              className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Budget band</legend>
            <div className="flex flex-col gap-2">
              {BUDGET_BANDS.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="budget_band" value={b} />
                  {b}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">
              Priorities — check the ones that matter most, most important first
            </legend>
            <div className="flex flex-col gap-2">
              {PRIORITIES.map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="priority" value={p.value} />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="rounded-sm bg-ink px-4 py-3 font-medium text-paper transition-colors hover:bg-rust"
          >
            Meet your AI officiant
          </button>
        </form>
      </main>
    </div>
  );
}
