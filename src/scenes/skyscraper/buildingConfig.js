/**
 * buildingConfig
 * Single source of numeric truth for the Phase 2 skyscraper, so
 * Skeleton/Floors/Facade/Windows/GhostOutline/CameraRig all agree on the
 * same dimensions and construction stage boundaries instead of each
 * hard-coding their own numbers.
 *
 * "reveal" throughout the skyscraper scene is BUILDING_LOCAL progress:
 * 0 = the site is still an empty lot, 1 = the skyscraper is finished.
 * See ConstructionSite.jsx for how this is derived from the shared
 * JourneyContext progress.
 */

export const FLOOR_COUNT = 16;
export const FLOOR_HEIGHT = 1.9;
export const FINAL_HEIGHT = FLOOR_COUNT * FLOOR_HEIGHT; // 30.4
export const FOOTPRINT = 4.6; // building width/depth at the base

// Construction stages as fractions of BUILDING_LOCAL (0-1), following the
// brief's approximate percentages.
export const STAGES = {
  foundation: [0, 0.1],
  structure: [0.1, 0.25],
  floors: [0.25, 0.45],
  facade: [0.45, 0.6],
  windows: [0.6, 0.75],
  systems: [0.75, 0.9],
  completion: [0.9, 1],
};

/** Progress (0-1) within a named stage band, clamped. */
export function bandT(local, [from, to]) {
  if (to <= from) return local >= from ? 1 : 0;
  return Math.min(1, Math.max(0, (local - from) / (to - from)));
}

// The skeleton (corner columns + core + ring beams) finishes rising by
// the end of the "floors" stage — everything after that is skin/detail
// added on top of an already-complete frame, matching the brief's
// foundation -> structure -> floors -> facade -> windows -> systems ->
// completion sequence.
export function skeletonHeightT(local) {
  return Math.min(1, Math.max(0, local / STAGES.floors[1]));
}
