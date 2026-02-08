const GOOGLE_API_KEY = process.env.GOOGLE_SOLAR_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_SOLAR_API_KEY environment variable is not set");
}

export async function GetSolarDataByCoords(Lat, Lon) {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_SOLAR_API_KEY is not configured");
  }

  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${Lat}&location.longitude=${Lon}&key=${GOOGLE_API_KEY}`;
  console.log(`[Google Solar] Fetching data for (${Lat}, ${Lon})`);

  const response = await fetch(url);
  const content = await response.json();

  if (response.status !== 200) {
    console.error("[Google Solar] API error:", content);
    throw new Error(content.error?.message || `Google Solar API returned ${response.status}`);
  }

  console.log(`[Google Solar] Success — segments: ${content.solarPotential?.roofSegmentStats?.length || 0}`);
  return content;
}
