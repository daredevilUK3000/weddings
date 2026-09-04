import { createClient } from "@/lib/supabase/server";
import { generateVendorRationale } from "@/lib/ai/vendor-rationale";
import { geocodeLocation, searchPlaces, type GeoapifyPlace } from "@/lib/geoapify";

// Maps our internal vendor category slugs to Geoapify/OSM place categories.
// Verified against Geoapify's full category list and a live spike search
// (Limoges, FR) during the Google -> Geoapify migration — see git history
// for the earlier, less accurate guesses this replaced.
const CATEGORY_GEOAPIFY: Record<string, string[]> = {
  // No dedicated wedding-venue tag in OSM; combining these three gave
  // relevant results in testing (reception halls, conference/event spaces).
  venue: ["activity.events_venue", "tourism.sights.conference_centre", "building.facility"],
  photography: ["service.photographer"], // confirmed: real photographer names, not camera shops
  catering: ["catering.restaurant"], // OSM doesn't distinguish standalone caterers from restaurants
  florist: ["commercial.florist"], // solid match, 10+ real florists in testing
  officiant: [], // no OSM equivalent — officiants aren't mapped as POIs
  hair_makeup: ["service.beauty.hairdresser", "commercial.health_and_beauty"],
  transport: ["rental.car"],
};

const CACHE_TTL_DAYS = 30;

function cacheLocationKey(location: string): string {
  return location.trim().toLowerCase();
}

export async function POST(req: Request) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEOAPIFY_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const {
    ceremonyId,
    categorySlug,
    location,
  }: { ceremonyId: string; categorySlug: string; location: string } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, budget_band, priority_ranking, location")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  const { data: category } = await supabase
    .from("vendor_categories")
    .select("id, slug, name")
    .eq("slug", categorySlug)
    .single();

  if (!ceremony || !category) {
    return Response.json({ error: "Ceremony or category not found" }, { status: 404 });
  }

  const geoapifyCategories = CATEGORY_GEOAPIFY[categorySlug] ?? [];
  if (geoapifyCategories.length === 0) {
    return Response.json({
      shortlist: [],
      warning: `"${category.name}" isn't well covered by OpenStreetMap data yet — try searching manually.`,
    });
  }

  const locationKey = cacheLocationKey(location);
  let places: GeoapifyPlace[];

  const { data: cached } = await supabase
    .from("vendor_cache")
    .select("results, fetched_at")
    .eq("category_slug", categorySlug)
    .eq("location_key", locationKey)
    .single();

  const cacheIsFresh =
    cached &&
    Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

  if (cacheIsFresh) {
    places = cached.results as GeoapifyPlace[];
  } else {
    const coords = await geocodeLocation(location, apiKey);
    if (!coords) {
      return Response.json({ error: "Could not find that location" }, { status: 400 });
    }
    places = await searchPlaces(geoapifyCategories, coords, apiKey);

    await supabase.from("vendor_cache").upsert(
      {
        category_slug: categorySlug,
        location_key: locationKey,
        results: places,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "category_slug,location_key" },
    );
  }

  // Persist the search location on the ceremony so it survives navigation —
  // otherwise the location field (and every "Find X" button) resets to
  // empty/disabled the moment the user leaves and returns to this tab.
  if (ceremony.location !== location) {
    await supabase
      .from("ceremonies")
      .update({ location, updated_at: new Date().toISOString() })
      .eq("id", ceremonyId)
      .eq("user_id", user.id);
  }

  const { data: existing } = await supabase
    .from("vendor_shortlist")
    .select("place_id")
    .eq("ceremony_id", ceremonyId)
    .eq("category_id", category.id);
  const existingPlaceIds = new Set((existing ?? []).map((row) => row.place_id));

  const priorityRanking = (ceremony.priority_ranking as string[]) ?? [];
  const newPlaces = places.filter((p) => !existingPlaceIds.has(p.placeId)).slice(0, 5);

  const shortlist = await Promise.all(
    newPlaces.map(async (place) => {
      const rationale = await generateVendorRationale(
        { name: place.name, category: category.name, address: place.address },
        {
          vibe: ceremony.vibe,
          budgetBand: ceremony.budget_band,
          priorities: priorityRanking,
        },
      );

      const { data, error } = await supabase
        .from("vendor_shortlist")
        .insert({
          ceremony_id: ceremonyId,
          category_id: category.id,
          place_id: place.placeId,
          name: place.name,
          address: place.address,
          ai_rationale: rationale,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
  );

  return Response.json({ shortlist });
}
