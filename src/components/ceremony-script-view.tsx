import { parseCeremonyScript } from "@/lib/ceremony-script";

// Renders the stored ceremony_script string as visually distinct blocks —
// who's speaking (officiant vs. the client) must be unmistakable at a
// glance, not just technically present in a text label. Falls back to a
// plain paragraph for any block that predates this format or doesn't
// otherwise match, so older scripts still render instead of breaking.
export function CeremonyScriptView({ script }: { script: string }) {
  const blocks = parseCeremonyScript(script);

  return (
    <div className="flex flex-col gap-5 rounded-sm border border-ink/10 bg-white/60 p-5 print:border-none print:bg-transparent print:p-0">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p
              key={i}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-champagne first:mt-0"
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "direction") {
          return (
            <p key={i} className="font-serif text-[15px] italic leading-relaxed text-ink-soft">
              ({block.text})
            </p>
          );
        }
        if (block.type === "officiant" || block.type === "self") {
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <span
                className={`text-xs font-bold uppercase tracking-[0.1em] ${
                  block.type === "officiant" ? "text-wine" : "text-dusty-rose"
                }`}
              >
                {block.type === "officiant" ? "Officiant" : "You"}
              </span>
              <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink">
                {block.text}
              </p>
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
