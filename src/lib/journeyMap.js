/**
 * journeyMap
 * The shared JourneyContext `progress` (0-1) covers the entire current
 * journey-track. Phase 2 splits that single number into two named
 * segments used across Experience/CameraRig/ScrollCaptions:
 *
 *  - [0, HERO_END]      hero pinned + city establishing/approach shot
 *  - [HERO_END, 1]      the skyscraper construction narrative
 *
 * buildingLocal() re-normalizes the second segment to its own 0-1 range
 * so buildingConfig.STAGES percentages (foundation/structure/floors/...)
 * apply directly, regardless of how long the overall track is.
 */

export const HERO_END = 0.08;

export function buildingLocal(progress) {
  return Math.min(1, Math.max(0, (progress - HERO_END) / (1 - HERO_END)));
}
