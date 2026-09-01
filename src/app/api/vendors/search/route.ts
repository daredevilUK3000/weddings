import { createClient } from "@/lib/supabase/server";
import { generateVendorRationale } from "@/lib/ai/vendor-rationale";

// Maps our internal vendor category slugs to Google Places "included types".
// See https://developers.google.com/maps/documentation/places/web-service/place-types
const CATEGORY_PLACE_TYPES: Record<string, string[]> = {
  venue: ["wedding_venue", "banquet_hall", "event_venue"],
  photography: ["photographer"],
  catering: ["caterer"],
  florist: ["florist"],
  officiant: ["wedding_officiant"],
  hair_makeup: ["hair_salon", "beauty_salon"],
  transport: ["car_rental", "limousine_service"],
};

interface PlacesSearchResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  priceLevel?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured on the server." },
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

  const includedTypes = CATEGORY_PLACE_TYPES[categorySlug] ?? [categorySlug];

  const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel",
    },
    body: JSON.stringify({
      textQuery: `${category.name} near ${location}`,
      includedType: includedTypes[0],
      maxResultCount: 8,
    }),
  });

  if (!placesRes.ok) {
    const errText = await placesRes.text();
    return Response.json({ error: `Places API error: ${errText}` }, { status: 502 });
  }

  const { places = [] } = (await placesRes.json()) as { places?: PlacesSearchResult[] };

  const priorityRanking = (ceremony.priority_ranking as string[]) ?? [];

  const shortlist = await Promise.all(
    places.slice(0, 5).map(async (place) => {
      const rationale = await generateVendorRationale(
        {
          name: place.displayName?.text ?? "Unknown vendor",
          category: category.name,
          rating: place.rating ?? null,
          priceLevel: place.priceLevel ? Number(place.priceLevel) : null,
          address: place.formattedAddress ?? null,
        },
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
          place_id: place.id,
          name: place.displayName?.text ?? "Unknown vendor",
          address: place.formattedAddress ?? null,
          rating: place.rating ?? null,
          price_level: place.priceLevel ? Number(place.priceLevel) : null,
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
