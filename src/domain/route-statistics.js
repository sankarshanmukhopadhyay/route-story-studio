const EARTH_RADIUS_METRES = 6_371_000;

export function haversineDistance(a, b) {
  const toRadians = (value) => value * Math.PI / 180;
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h));
}

export function calculateStatistics(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { distanceMetres: 0, durationSeconds: null, elevationGainMetres: 0, elevationLossMetres: 0 };
  }

  let distanceMetres = 0;
  let elevationGainMetres = 0;
  let elevationLossMetres = 0;

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

  const timed = points.filter((point) => point.timestamp instanceof Date && !Number.isNaN(point.timestamp.valueOf()));
  const durationSeconds = timed.length > 1
    ? Math.max(0, (timed.at(-1).timestamp - timed[0].timestamp) / 1000)
    : null;

  return { distanceMetres, durationSeconds, elevationGainMetres, elevationLossMetres };
}

export function formatDistance(metres) {
  return metres >= 1000 ? `${(metres / 1000).toFixed(metres >= 100_000 ? 0 : 1)} km` : `${Math.round(metres)} m`;
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
