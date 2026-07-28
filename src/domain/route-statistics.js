const EARTH_RADIUS_METRES = 6_371_000;
const METRES_PER_MILE = 1609.344;
const METRES_PER_FOOT = 0.3048;

export function haversineDistance(a, b) {
  const toRadians = (value) => value * Math.PI / 180;
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h));
}

export function flattenSegments(segments) {
  return segments.flatMap((segment) => segment.points);
}

export function calculateStatistics(input) {
  const segments = Array.isArray(input?.[0]?.points) ? input : [{ points: input ?? [] }];
  let distanceMetres = 0;
  let elevationGainMetres = 0;
  let elevationLossMetres = 0;
  const timed = [];

  for (const segment of segments) {
    const points = segment.points ?? [];
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      distanceMetres += haversineDistance(previous, current);
      if (Number.isFinite(previous.elevationMetres) && Number.isFinite(current.elevationMetres)) {
        const change = current.elevationMetres - previous.elevationMetres;
        if (change > 0) elevationGainMetres += change;
        if (change < 0) elevationLossMetres += Math.abs(change);
      }
    }
    timed.push(...points.filter((point) => point.timestamp instanceof Date && !Number.isNaN(point.timestamp.valueOf())));
  }

  timed.sort((a, b) => a.timestamp - b.timestamp);
  const durationSeconds = timed.length > 1 ? Math.max(0, (timed.at(-1).timestamp - timed[0].timestamp) / 1000) : null;
  return { distanceMetres, durationSeconds, elevationGainMetres, elevationLossMetres };
}

export function formatDistance(metres, units = 'metric') {
  if (units === 'imperial') {
    const miles = metres / METRES_PER_MILE;
    return miles >= 0.1 ? `${miles.toFixed(miles >= 100 ? 0 : 1)} mi` : `${Math.round(metres / METRES_PER_FOOT)} ft`;
  }
  return metres >= 1000 ? `${(metres / 1000).toFixed(metres >= 100_000 ? 0 : 1)} km` : `${Math.round(metres)} m`;
}

export function formatElevation(metres, units = 'metric') {
  return units === 'imperial' ? `${Math.round(metres / METRES_PER_FOOT)} ft` : `${Math.round(metres)} m`;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'Not recorded';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
}
