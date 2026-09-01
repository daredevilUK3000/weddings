import { createCeremony } from "./actions";

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
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Tell us about your ceremony</h1>
        <p className="mt-1 text-black/60">
          This shapes everything from your vows to your vendor shortlist.
        </p>
      </div>

      <form action={createCeremony} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Why now?</span>
          <textarea
            name="reason"
            rows={3}
            placeholder="A milestone, a recovery, a career win, a simple yes to yourself…"
            className="rounded-md border border-black/10 px-3 py-2"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Vibe / tone</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VIBES.map((v) => (
              <label
                key={v.value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-black/10 px-3 py-2 has-[:checked]:border-black"
              >
                <input type="radio" name="vibe" value={v.value} required />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Guest count</span>
            <input
              type="number"
              name="guest_count"
              min={0}
              defaultValue={0}
              className="rounded-md border border-black/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Date (optional)</span>
            <input type="date" name="date" className="rounded-md border border-black/10 px-3 py-2" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Location</span>
          <input
            type="text"
            name="location"
            placeholder="City, region…"
            className="rounded-md border border-black/10 px-3 py-2"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Budget band</legend>
          <div className="flex flex-col gap-2">
            {BUDGET_BANDS.map((b) => (
              <label key={b} className="flex items-center gap-2">
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
              <label key={p.value} className="flex items-center gap-2">
                <input type="checkbox" name="priority" value={p.value} />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="rounded-md bg-black px-4 py-3 text-white">
          Meet your AI officiant
        </button>
      </form>
    </main>
  );
}
