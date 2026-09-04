import { createClient } from "@/lib/supabase/server";
import { generateVendorRationale } from "@/lib/ai/vendor-rationale";
import { geocodeLocation, searchPlaces, type GeoapifyPlace } from "@/lib/geoapify";

// Maps our internal vendor category slugs to Geoapify/OSM place categories.
// OSM's category taxonomy is POI-shaped (physical shops/venues), not
// service-directory-shaped like Google's — several of these have no clean
// equivalent and are flagged accordingly. Revisit after the coverage spike.
const CATEGORY_GEOAPIFY: Record<string, string[]> = {
  venue: ["entertainment.events_venue", "building.facility"], // no dedicated wedding-venue tag in OSM
  photography: ["commercial.hobby.photo"], // this is a camera/photo retail shop tag, not "photographer service" — likely thin
  catering: ["catering.restaurant"], // OSM doesn't distinguish standalone caterers from restaurants well
  florist: ["commercial.florist"], // solid match
  officiant: [], // no OSM equivalent — officiants aren't mapped as POIs
  hair_makeup: ["service.beauty.hairdresser", "commercial.beauty"],
  transport: ["service.car_rental"],
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
    .select("vibe, budget_band, priority_ranking")
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
