const MODES = new Set(['driving', 'walking', 'bicycling', 'cycling', 'transit']);

export function normaliseTravelMode(value) {
  const mode = String(value || '').toLowerCase();
  if (!mode) return undefined;
  if (mode === 'cycling') return 'bicycling';
  return MODES.has(mode) ? mode : undefined;
}

export function parseLocation(rawValue) {
  const raw = decodeURIComponent(String(rawValue || '').replace(/\+/g, ' ')).trim();
  if (!raw) return null;
  const coordinateMatch = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/.exec(raw);
  if (coordinateMatch) {
    const latitude = Number(coordinateMatch[1]);
    const longitude = Number(coordinateMatch[2]);
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new Error(`Invalid route coordinate: ${raw}`);
    return { rawValue: raw, coordinates: { latitude, longitude }, label: raw, resolutionStatus: 'coordinates' };
  }
  return { rawValue: raw, label: raw.slice(0, 240), resolutionStatus: 'named-place' };
}

export function createRouteIntent({ source, origin, destination, waypoints = [], travelMode, warnings = [], unresolvedParameters = [] }) {
  if (!source?.type) throw new Error('Route intent source is required.');
  return {
    schemaVersion: '1.0',
    id: crypto.randomUUID(),
    source: { ...source, importedAt: source.importedAt || new Date().toISOString() },
    origin: origin || undefined,
    destination: destination || undefined,
    waypoints: waypoints.filter(Boolean).slice(0, 25),
    travelMode: normaliseTravelMode(travelMode),
    avoidances: [],
    unresolvedParameters: unresolvedParameters.slice(0, 50),
    warnings: warnings.slice(0, 50),
  };
}
