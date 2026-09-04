// Geoapify Places API client — direct REST calls, no SDK, matching the
// pattern of every other external API call in this codebase.
//
// Unlike Google's Text Search (one call, free-text query), Geoapify's
// Places API needs coordinates: geocode the location string first, then
// search places near it. Docs: https://apidocs.geoapify.com/docs/places/

export interface GeoapifyPlace {
  placeId: string;
  name: string;
  address: string | null;
}

interface GeoapifyGeocodeFeature {
  properties: { lat: number; lon: number };
}

interface GeoapifyPlaceFeature {
  properties: {
    place_id: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
  };
}

export async function geocodeLocation(
  location: string,
  apiKey: string,
): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", location);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geoapify geocoding error: ${await res.text()}`);
  }

  const { features = [] } = (await res.json()) as { features?: GeoapifyGeocodeFeature[] };
  const first = features[0];
  return first ? { lat: first.properties.lat, lon: first.properties.lon } : null;
}

// Radius is intentionally generous (60km) — confirmed empirically during the
// migration spike (Limoges, FR): venue results roughly doubled and
// photography results went from 2 to 5 going from 25km to 60km. OSM POI
// density is lower than Google's index, so vendor categories worth
// traveling for need a wide net; `bias=proximity` still sorts closest-first.
const SEARCH_RADIUS_METERS = 60_000;

export async function searchPlaces(
  categories: string[],
  near: { lat: number; lon: number },
  apiKey: string,
  limit = 10,
): Promise<GeoapifyPlace[]> {
  const url = new URL("https://api.geoapify.com/v2/places");
  url.searchParams.set("categories", categories.join(","));
  url.searchParams.set("filter", `circle:${near.lon},${near.lat},${SEARCH_RADIUS_METERS}`);
  url.searchParams.set("bias", `proximity:${near.lon},${near.lat}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geoapify places error: ${await res.text()}`);
  }

  const { features = [] } = (await res.json()) as { features?: GeoapifyPlaceFeature[] };

  return features
    .filter((f) => f.properties.name)
    .map((f) => ({
      placeId: f.properties.place_id,
      name: f.properties.name!,
      address: f.properties.formatted ?? f.properties.address_line1 ?? null,
    }));
}
