/**
 * Background Globe Data
 * Mock data for animated globe visualization on home page
 */

export interface BackgroundGlobePoint {
  id: string;
  lat: number;
  lng: number;
  baseSize: number;
  color: string;
  animationOffset: number; // For staggered pulsing
}

export interface AnimatedArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  animationSpeed: number; // 0.5-1.5 multiplier
}

/**
 * 18 globally distributed points representing research locations
 * Colors represent career stages: Cyan, Emerald, Blue, Amber, Violet
 */
export const BACKGROUND_GLOBE_POINTS: BackgroundGlobePoint[] = [
  // North America
  { id: 'na-1', lat: 37.7749, lng: -122.4194, baseSize: 0.25, color: '#22d3ee', animationOffset: 0 }, // San Francisco
  { id: 'na-2', lat: 40.7128, lng: -74.0060, baseSize: 0.3, color: '#3B82F6', animationOffset: 1.2 }, // New York
  { id: 'na-3', lat: 43.6532, lng: -79.3832, baseSize: 0.22, color: '#34d399', animationOffset: 2.4 }, // Toronto

  // South America
  { id: 'sa-1', lat: -23.5505, lng: -46.6333, baseSize: 0.28, color: '#a78bfa', animationOffset: 3.6 }, // São Paulo
  { id: 'sa-2', lat: -34.6037, lng: -58.3816, baseSize: 0.24, color: '#fbbf24', animationOffset: 4.8 }, // Buenos Aires

  // Europe
  { id: 'eu-1', lat: 51.5074, lng: -0.1278, baseSize: 0.32, color: '#3B82F6', animationOffset: 0.8 }, // London
  { id: 'eu-2', lat: 48.8566, lng: 2.3522, baseSize: 0.26, color: '#22d3ee', animationOffset: 1.6 }, // Paris
  { id: 'eu-3', lat: 52.5200, lng: 13.4050, baseSize: 0.25, color: '#34d399', animationOffset: 2.8 }, // Berlin
  { id: 'eu-4', lat: 55.7558, lng: 37.6173, baseSize: 0.27, color: '#a78bfa', animationOffset: 4.0 }, // Moscow

  // Africa
  { id: 'af-1', lat: -1.2921, lng: 36.8219, baseSize: 0.23, color: '#fbbf24', animationOffset: 5.2 }, // Nairobi
  { id: 'af-2', lat: -33.9249, lng: 18.4241, baseSize: 0.24, color: '#22d3ee', animationOffset: 0.4 }, // Cape Town

  // Asia
  { id: 'as-1', lat: 35.6762, lng: 139.6503, baseSize: 0.31, color: '#3B82F6', animationOffset: 1.0 }, // Tokyo
  { id: 'as-2', lat: 1.3521, lng: 103.8198, baseSize: 0.29, color: '#34d399', animationOffset: 2.2 }, // Singapore
  { id: 'as-3', lat: 28.6139, lng: 77.2090, baseSize: 0.26, color: '#a78bfa', animationOffset: 3.4 }, // New Delhi
  { id: 'as-4', lat: 39.9042, lng: 116.4074, baseSize: 0.30, color: '#fbbf24', animationOffset: 4.6 }, // Beijing
  { id: 'as-5', lat: -6.2088, lng: 106.8456, baseSize: 0.24, color: '#22d3ee', animationOffset: 5.8 }, // Jakarta

  // Oceania
  { id: 'oc-1', lat: -33.8688, lng: 151.2093, baseSize: 0.28, color: '#3B82F6', animationOffset: 1.4 }, // Sydney
  { id: 'oc-2', lat: -37.8136, lng: 144.9631, baseSize: 0.25, color: '#34d399', animationOffset: 2.6 }, // Melbourne
];

/**
 * Reduced point set for mobile devices (8 points)
 */
export const MOBILE_GLOBE_POINTS: BackgroundGlobePoint[] = [
  BACKGROUND_GLOBE_POINTS[0], // San Francisco
  BACKGROUND_GLOBE_POINTS[1], // New York
  BACKGROUND_GLOBE_POINTS[5], // London
  BACKGROUND_GLOBE_POINTS[6], // Paris
  BACKGROUND_GLOBE_POINTS[11], // Tokyo
  BACKGROUND_GLOBE_POINTS[12], // Singapore
  BACKGROUND_GLOBE_POINTS[16], // Sydney
  BACKGROUND_GLOBE_POINTS[3], // São Paulo
];

/**
 * Generate random arcs connecting points
 * @param points - Array of globe points
 * @param count - Number of arcs to generate
 * @returns Array of animated arcs
 */
export function generateArcs(
  points: BackgroundGlobePoint[],
  count: number
): AnimatedArc[] {
  const arcs: AnimatedArc[] = [];
  const usedPairs = new Set<string>();

  // Arc colors (matching career stage palette)
  const arcColors = [
    'rgba(59, 130, 246, 0.4)', // Blue
    'rgba(34, 211, 238, 0.4)', // Cyan
    'rgba(52, 211, 153, 0.4)', // Emerald
    'rgba(251, 191, 36, 0.4)', // Amber
    'rgba(167, 139, 250, 0.4)', // Violet
  ];

  let attempts = 0;
  const maxAttempts = count * 10;

  while (arcs.length < count && attempts < maxAttempts) {
    attempts++;

    // Pick two random distinct points
    const startIdx = Math.floor(Math.random() * points.length);
    let endIdx = Math.floor(Math.random() * points.length);

    while (endIdx === startIdx) {
      endIdx = Math.floor(Math.random() * points.length);
    }

    // Create unique pair ID (order independent)
    const pairId = [startIdx, endIdx].sort().join('-');

    if (usedPairs.has(pairId)) {
      continue;
    }

    usedPairs.add(pairId);

    const startPoint = points[startIdx];
    const endPoint = points[endIdx];

    arcs.push({
      id: `arc-${arcs.length}`,
      startLat: startPoint.lat,
      startLng: startPoint.lng,
      endLat: endPoint.lat,
      endLng: endPoint.lng,
      color: arcColors[arcs.length % arcColors.length],
      animationSpeed: 0.5 + Math.random(), // 0.5-1.5 range
    });
  }

  return arcs;
}

/**
 * Ring pulse data for optional glow effects
 */
export interface RingPulse {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
}

/**
 * Generate ring pulses for points
 */
export function generateRingPulses(
  points: BackgroundGlobePoint[]
): RingPulse[] {
  return points.map(point => ({
    lat: point.lat,
    lng: point.lng,
    maxR: 3, // Maximum ring radius in degrees
    propagationSpeed: 2, // Speed of ring expansion
    repeatPeriod: 2000, // 2 seconds between pulses
  }));
}
