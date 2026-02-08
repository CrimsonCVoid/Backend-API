/**
 * Converts Google Solar API buildingInsights response to the frontend RoofData format.
 *
 * Google Solar API returns roofSegmentStats with:
 *   - pitchDegrees, azimuthDegrees
 *   - stats: { areaMeters2, groundAreaMeters2, sunshineQuantiles }
 *   - center: { latitude, longitude }
 *   - boundingBox: { sw, ne }
 *
 * Frontend expects RoofData with:
 *   - planes[]: { id, vertices[][], area_sf, slope, panel_count }
 *   - measurements: { ridge_length_ft, eave_length_ft, valley_length_ft, hip_length_ft, total_perimeter_ft }
 *   - total_area_sf, panel_count, panel_type, seam_width, color
 */

const SQ_METERS_TO_SQ_FEET = 10.7639;
const METERS_TO_FEET = 3.28084;

/**
 * Convert a roof segment's bounding box to approximate vertex coordinates.
 * Returns 4 corner vertices as [x, y, z] arrays relative to the building center.
 */
function boundingBoxToVertices(boundingBox, segCenter, buildingCenter, pitchDegrees) {
  if (!boundingBox?.sw || !boundingBox?.ne) return [];

  const sw = boundingBox.sw;
  const ne = boundingBox.ne;

  // Convert lat/lng offsets to approximate meters (1 degree lat ≈ 111,320m)
  const latScale = 111320;
  const lngScale = 111320 * Math.cos((buildingCenter.latitude * Math.PI) / 180);

  const x1 = (sw.longitude - buildingCenter.longitude) * lngScale;
  const z1 = (sw.latitude - buildingCenter.latitude) * latScale;
  const x2 = (ne.longitude - buildingCenter.longitude) * lngScale;
  const z2 = (ne.latitude - buildingCenter.latitude) * latScale;

  // Estimate Y (height) from pitch and width
  const pitchRad = (pitchDegrees * Math.PI) / 180;
  const rise = Math.abs(z2 - z1) * 0.5 * Math.tan(pitchRad);

  return [
    [x1, 0, z1],
    [x2, 0, z1],
    [x2, rise, z2],
    [x1, rise, z2],
  ];
}

export function convertGoogleToRoofData(googleResponse) {
  const solarPotential = googleResponse.solarPotential;
  const buildingCenter = googleResponse.center;

  if (!solarPotential) {
    throw new Error("Google Solar response missing solarPotential data");
  }

  const segments = solarPotential.roofSegmentStats || [];

  // Convert each roof segment to a plane
  const planes = segments.map((seg, i) => {
    const areaM2 = seg.stats?.areaMeters2 || 0;
    const areaSf = areaM2 * SQ_METERS_TO_SQ_FEET;
    const vertices = boundingBoxToVertices(
      seg.boundingBox,
      seg.center,
      buildingCenter,
      seg.pitchDegrees || 0
    );

    return {
      id: `plane-${i}`,
      vertices,
      area_sf: Math.round(areaSf * 100) / 100,
      slope: seg.pitchDegrees || 0,
      azimuth: seg.azimuthDegrees || 0,
      panel_count: 0,
    };
  });

  const totalAreaSf = planes.reduce((sum, p) => sum + p.area_sf, 0);

  // Estimate measurements from whole roof stats
  const wholeRoof = solarPotential.wholeRoofStats;
  const totalGroundAreaM2 = wholeRoof?.groundAreaMeters2 || 0;
  const totalRoofAreaM2 = wholeRoof?.areaMeters2 || 0;

  // Rough perimeter estimate from ground area (assume rectangular footprint)
  const sideLength = Math.sqrt(totalGroundAreaM2);
  const perimeterFt = sideLength * 4 * METERS_TO_FEET;

  return {
    planes,
    measurements: {
      ridge_length_ft: Math.round(sideLength * METERS_TO_FEET * 100) / 100,
      eave_length_ft: Math.round(sideLength * 2 * METERS_TO_FEET * 100) / 100,
      valley_length_ft: 0,
      hip_length_ft: 0,
      total_perimeter_ft: Math.round(perimeterFt * 100) / 100,
    },
    total_area_sf: Math.round(totalAreaSf * 100) / 100,
    panel_count: planes.length,
    panel_type: "standing-seam",
    seam_width: 18,
    color: "#4B5563",
    // Raw Google data preserved for debugging and future features
    _google_raw: {
      center: buildingCenter,
      imageryDate: googleResponse.imageryDate,
      regionCode: googleResponse.regionCode,
      postalCode: googleResponse.postalCode,
      maxArrayAreaMeters2: solarPotential.maxArrayAreaMeters2,
      wholeRoofStats: wholeRoof,
    },
  };
}
