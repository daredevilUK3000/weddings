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
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Search location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-md border border-black/10 px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => search(c.slug)}
            disabled={searching === c.slug || !location}
            className="rounded-md border border-black/10 px-3 py-2 text-sm disabled:opacity-50"
          >
            {searching === c.slug ? `Searching ${c.name}…` : `Find ${c.name}`}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-4">
        {shortlist.map((v) => (
          <li key={v.id} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{v.name}</h3>
              {v.rating ? <span className="text-sm text-black/50">★ {v.rating}</span> : null}
            </div>
            {v.address ? <p className="text-sm text-black/50">{v.address}</p> : null}
            {v.ai_rationale ? <p className="text-sm">{v.ai_rationale}</p> : null}

            {v.outreach_draft ? (
              <div className="flex flex-col gap-2 rounded-md bg-black/[.03] p-3">
                <p className="whitespace-pre-wrap text-sm">{v.outreach_draft.draft_text}</p>
                <select
                  value={v.outreach_draft.status}
                  onChange={(e) =>
                    updateStatus(v.outreach_draft!.id, e.target.value as OutreachDraft["status"])
                  }
                  className="w-fit rounded-md border border-black/10 px-2 py-1 text-sm"
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
                  className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => draftOutreach(v.id)}
                  disabled={drafting === v.id}
                  className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {drafting === v.id ? "Drafting…" : "Draft outreach"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
