"use client";

import { useState } from "react";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface OutreachDraft {
  id: string;
  vendor_shortlist_id: string;
  draft_text: string;
  status: "not_sent" | "sent" | "replied" | "booked";
}

interface ShortlistEntry {
  id: string;
  category_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  price_level: number | null;
  ai_rationale: string | null;
  selected: boolean;
  outreach_draft: OutreachDraft | null;
}

const STATUS_OPTIONS: OutreachDraft["status"][] = ["not_sent", "sent", "replied", "booked"];

export function VendorsClient({
  ceremonyId,
  defaultLocation,
  categories,
  initialShortlist,
}: {
  ceremonyId: string;
  defaultLocation: string;
  categories: Category[];
  initialShortlist: ShortlistEntry[];
}) {
  const [location, setLocation] = useState(defaultLocation);
  const [searching, setSearching] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>(initialShortlist);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [asks, setAsks] = useState<Record<string, string>>({});

  async function search(categorySlug: string) {
    setSearching(categorySlug);
    const res = await fetch("/api/vendors/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ceremonyId, categorySlug, location }),
    });
    setSearching(null);

    if (res.ok) {
      const { shortlist: newEntries } = await res.json();
      setShortlist((prev) => [
        ...prev,
        ...newEntries.map((e: ShortlistEntry) => ({ ...e, outreach_draft: null })),
      ]);
    } else {
      const { error } = await res.json();
      alert(error);
    }
  }

  async function draftOutreach(vendorShortlistId: string) {
    setDrafting(vendorShortlistId);
    const res = await fetch("/api/ai/outreach-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorShortlistId,
        categorySpecificAsk: asks[vendorShortlistId] ?? "availability and pricing",
      }),
    });
    setDrafting(null);

    if (res.ok) {
      const draft = await res.json();
      setShortlist((prev) =>
        prev.map((v) => (v.id === vendorShortlistId ? { ...v, outreach_draft: draft } : v)),
      );
    }
  }

  async function updateStatus(outreachDraftId: string, status: OutreachDraft["status"]) {
    await fetch("/api/ai/outreach-draft", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreachDraftId, status }),
    });
    setShortlist((prev) =>
      prev.map((v) =>
        v.outreach_draft?.id === outreachDraftId
          ? { ...v, outreach_draft: { ...v.outreach_draft, status } }
          : v,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Search location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-sm border border-ink/15 bg-white px-3 py-2.5 outline-none focus:border-rust"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => search(c.slug)}
            disabled={searching === c.slug || !location}
            className="rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm transition-colors hover:border-rust disabled:opacity-50"
          >
            {searching === c.slug ? `Searching ${c.name}…` : `Find ${c.name}`}
          </button>
        ))}
      </div>

      {shortlist.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-ink/15 bg-stone/60 px-6 py-14 text-center">
          <p className="font-serif text-lg">No vendors shortlisted yet.</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Set a location and search a category above — we&apos;ll pull real venues,
            photographers, and florists near you with a note on why each one fits.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {shortlist.map((v) => (
            <li
              key={v.id}
              className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-white/60 p-5"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-lg font-medium">{v.name}</h3>
                {v.rating ? (
                  <span className="text-sm text-gold">★ {v.rating}</span>
                ) : null}
              </div>
              {v.address ? <p className="text-sm text-ink-soft">{v.address}</p> : null}
              {v.ai_rationale ? (
                <p className="border-l-2 border-gold/50 pl-3 text-sm text-ink-soft">
                  {v.ai_rationale}
                </p>
              ) : null}

              {v.outreach_draft ? (
                <div className="flex flex-col gap-3 rounded-sm bg-stone/60 p-4">
                  <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {v.outreach_draft.draft_text}
                  </p>
                  <select
                    value={v.outreach_draft.status}
                    onChange={(e) =>
                      updateStatus(
                        v.outreach_draft!.id,
                        e.target.value as OutreachDraft["status"],
                      )
                    }
                    className="w-fit rounded-sm border border-ink/15 bg-white px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Anything specific to ask? (optional)"
                    value={asks[v.id] ?? ""}
                    onChange={(e) => setAsks((prev) => ({ ...prev, [v.id]: e.target.value }))}
                    className="flex-1 rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-rust"
                  />
                  <button
                    onClick={() => draftOutreach(v.id)}
                    disabled={drafting === v.id}
                    className="rounded-sm bg-ink px-3 py-2 text-sm font-medium text-paper transition-colors hover:bg-rust disabled:opacity-50"
                  >
                    {drafting === v.id ? "Drafting…" : "Draft outreach"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
