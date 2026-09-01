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
        className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Thinking of gifts…" : "Generate registry ideas"}
      </button>
      {suggestions.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <li key={i} className="rounded-md border border-black/10 p-3 text-sm">
              <p className="font-medium">{s.title}</p>
              <p className="text-black/60">{s.description}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
