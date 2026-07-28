import { consumeAcquisitionRequest } from '../acquisition/acquisition-budget.js';

export const OPENROUTESERVICE_PROVIDER = Object.freeze({
  id: 'openrouteservice',
  name: 'openrouteservice',
  baseUrl: 'https://api.openrouteservice.org',
  privacyUrl: 'https://openrouteservice.org/privacy-policy/',
  termsUrl: 'https://openrouteservice.org/terms-of-service/',
  attribution: 'Route geometry by openrouteservice.org | © OpenStreetMap contributors',
  supportedModes: ['driving', 'walking', 'bicycling']
});

export const MAX_GEOCODE_CANDIDATES = 5;
export const MAX_ROUTING_WAYPOINTS = 25;
export const MAX_PROVIDER_RESPONSE_BYTES = 2_000_000;
export const MAX_GENERATED_POINTS = 100_000;

const PROFILE_BY_MODE = Object.freeze({ driving: 'driving-car', walking: 'foot-walking', bicycling: 'cycling-regular', cycling: 'cycling-regular' });

function validateKey(value) {
  const key = String(value || '').trim();
  if (key.length < 20 || key.length > 256 || /\s/.test(key)) throw new Error('Enter a valid openrouteservice API key. It is kept in this browser and is not added to project files.');
  return key;
}
function validCoordinate([longitude, latitude]) {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}
async function readJson(response) {
  const type = response.headers.get('content-type') || '';
  if (!/application\/(?:geo\+)?json/i.test(type)) throw new Error('The provider returned an unexpected response type.');
  const text = await response.text();
  if (new Blob([text]).size > MAX_PROVIDER_RESPONSE_BYTES) throw new Error('The provider response exceeded the 2 MB safety limit.');
  try { return JSON.parse(text); } catch { throw new Error('The provider returned malformed JSON.'); }
}
async function request(url, options, timeoutMs, fetcher = fetch) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, { ...options, signal: controller.signal, credentials: 'omit', referrerPolicy: 'strict-origin-when-cross-origin', cache: 'no-store' });
    if (response.status === 401 || response.status === 403) throw new Error('The routing provider rejected the API key or request permissions.');
    if (response.status === 429) throw new Error('The routing provider rate limit has been reached. Wait before trying again.');
    if (!response.ok) throw new Error(`The routing provider request failed (${response.status}).`);
    return readJson(response);
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The routing provider did not respond within the safety timeout.');
    throw error;
  } finally { clearTimeout(timer); }
}
function candidateFromFeature(feature, index) {
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2 || !validCoordinate(coordinates)) return null;
  const properties = feature.properties || {};
  return {
    id: String(properties.id || properties.gid || `candidate-${index + 1}`).slice(0, 240),
    label: String(properties.label || properties.name || 'Unnamed result').slice(0, 240),
    locality: String(properties.locality || properties.county || properties.region || '').slice(0, 160),
    country: String(properties.country || '').slice(0, 120),
    coordinates: { longitude: Number(coordinates[0]), latitude: Number(coordinates[1]) },
    confidence: Number.isFinite(properties.confidence) ? properties.confidence : null
  };
}

export function createOpenRouteServiceAdapter({ apiKey, fetchImpl } = {}) {
  const key = validateKey(apiKey);
  const fetcher = fetchImpl || fetch;
  return {
    metadata: OPENROUTESERVICE_PROVIDER,
    async geocode(text, { timeoutMs = 10_000 } = {}) {
      const query = String(text || '').trim();
      if (!query || query.length > 240) throw new Error('The place name is empty or exceeds the 240-character limit.');
      consumeAcquisitionRequest('geocoding');
      const url = new URL(`${OPENROUTESERVICE_PROVIDER.baseUrl}/geocode/search`);
      url.searchParams.set('text', query); url.searchParams.set('size', String(MAX_GEOCODE_CANDIDATES));
      const json = await request(url, { headers: { Authorization: key, Accept: 'application/json' } }, timeoutMs, fetcher);
      const candidates = (Array.isArray(json.features) ? json.features : []).map(candidateFromFeature).filter(Boolean).slice(0, MAX_GEOCODE_CANDIDATES);
      if (!candidates.length) throw new Error(`No provider candidates were returned for “${query}”.`);
      return candidates;
    },
    async route(locations, { travelMode = 'driving', timeoutMs = 20_000 } = {}) {
      if (!Array.isArray(locations) || locations.length < 2 || locations.length > MAX_ROUTING_WAYPOINTS + 2) throw new Error('A route requires two locations and supports at most 25 intermediate waypoints.');
      const coordinates = locations.map((location) => [Number(location.coordinates.longitude), Number(location.coordinates.latitude)]);
      if (!coordinates.every(validCoordinate)) throw new Error('One or more confirmed route locations contain invalid coordinates.');
      const profile = PROFILE_BY_MODE[travelMode] || PROFILE_BY_MODE.driving;
      consumeAcquisitionRequest('routing');
      const json = await request(`${OPENROUTESERVICE_PROVIDER.baseUrl}/v2/directions/${profile}/geojson`, {
        method: 'POST', headers: { Authorization: key, Accept: 'application/geo+json, application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ coordinates })
      }, timeoutMs, fetcher);
      const feature = json?.features?.[0]; const line = feature?.geometry;
      if (line?.type !== 'LineString' || !Array.isArray(line.coordinates)) throw new Error('The routing provider did not return LineString route geometry.');
      if (line.coordinates.length < 2 || line.coordinates.length > MAX_GENERATED_POINTS) throw new Error('The generated route is empty or exceeds the 100,000-point safety limit.');
      const points = line.coordinates.map((coordinate) => {
        if (!Array.isArray(coordinate) || !validCoordinate(coordinate)) throw new Error('The routing provider returned invalid route coordinates.');
        return { longitude: Number(coordinate[0]), latitude: Number(coordinate[1]), elevationMetres: Number.isFinite(coordinate[2]) ? Number(coordinate[2]) : null, timestamp: null };
      });
      return { points, summary: feature.properties?.summary || {}, provider: OPENROUTESERVICE_PROVIDER, rawAttribution: json.metadata?.attribution || OPENROUTESERVICE_PROVIDER.attribution };
    }
  };
}
