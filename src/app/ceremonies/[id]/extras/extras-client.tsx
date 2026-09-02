"use client";

import { useState } from "react";

interface Suggestion {
  title: string;
  description: string;
}

export function RegistryGenerator({ ceremonyId }: { ceremonyId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/ai/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ceremonyId }),
    });
    setLoading(false);
    if (res.ok) {
      const { suggestions } = await res.json();
      setSuggestions(suggestions);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={generate}
        disabled={loading}
        className="w-fit rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:bg-wine disabled:opacity-50"
      >
        {loading ? "Thinking of gifts…" : "Generate registry ideas"}
      </button>
      {suggestions.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <li key={i} className="rounded-sm border border-ink/10 bg-white/60 p-4 text-sm">
              <p className="font-serif text-base font-medium">{s.title}</p>
              <p className="mt-1 text-ink-soft">{s.description}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
