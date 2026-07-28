export const MAP_PROVIDER = Object.freeze({
  id: 'openstreetmap-standard',
  name: 'OpenStreetMap Standard',
  attribution: '© OpenStreetMap contributors',
  privacyUrl: 'https://operations.osmfoundation.org/policies/tiles/',
  blockedTilesUrl: 'https://wiki.openstreetmap.org/wiki/Blocked_tiles',
  reportIssueUrl: 'https://www.openstreetmap.org/fixthemap',
  contactUrl: 'https://github.com/sankarshanmukhopadhyay/route-story-studio/issues',
  host: 'https://tile.openstreetmap.org',
  referrerPolicy: 'strict-origin-when-cross-origin'
});

export const MAX_MAP_TILES = 9;
export const MAX_TILE_BYTES = 1_500_000;
export const TILE_REQUEST_CONCURRENCY = 2;
export const TILE_REQUEST_DELAY_MS = 120;
const TILE_SIZE = 256;

export class MapProviderPolicyError extends Error {
  constructor(message, code = 'MAP_PROVIDER_POLICY') {
    super(message);
    this.name = 'MapProviderPolicyError';
    this.code = code;
  }
}

function lonToTile(lon, z) { return (lon + 180) / 360 * 2 ** z; }
function latToTile(lat, z) { const rad = Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI / 180; return (1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * 2 ** z; }
function tileToLon(x, z) { return x / 2 ** z * 360 - 180; }
function tileToLat(y, z) { return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / 2 ** z))) * 180 / Math.PI; }
function wait(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
function toDataUrl(blob) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('A map tile could not be read.')); reader.readAsDataURL(blob); }); }
function routeBounds(route) { const points = route.segments.flatMap((segment) => segment.points); return points.reduce((bounds, point) => ({ minLat: Math.min(bounds.minLat, point.latitude), maxLat: Math.max(bounds.maxLat, point.latitude), minLon: Math.min(bounds.minLon, point.longitude), maxLon: Math.max(bounds.maxLon, point.longitude) }), { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 }); }

export function fitTileRange(route) {
  const bounds = routeBounds(route);
  const latPad = Math.max((bounds.maxLat - bounds.minLat) * .12, .01);
  const lonPad = Math.max((bounds.maxLon - bounds.minLon) * .12, .01);
  const padded = { minLat: Math.max(-85, bounds.minLat - latPad), maxLat: Math.min(85, bounds.maxLat + latPad), minLon: Math.max(-180, bounds.minLon - lonPad), maxLon: Math.min(180, bounds.maxLon + lonPad) };
  for (let zoom = 16; zoom >= 2; zoom -= 1) {
    const minX = Math.floor(lonToTile(padded.minLon, zoom)); const maxX = Math.floor(lonToTile(padded.maxLon, zoom));
    const minY = Math.floor(latToTile(padded.maxLat, zoom)); const maxY = Math.floor(latToTile(padded.minLat, zoom));
    const count = (maxX - minX + 1) * (maxY - minY + 1);
    if (count <= MAX_MAP_TILES) return { z: zoom, minX, maxX, minY, maxY, count, padded };
  }
  throw new Error('The route cannot be fitted within the map tile safety budget.');
}

export function looksLikeBlockedTilePixels(data, width, height) {
  if (!data || width < 32 || height < 32) return false;
  const leftLimit = Math.max(1, Math.floor(width * .18));
  let leftSamples = 0; let yellow = 0; let dark = 0; let grey = 0; let allSamples = 0;
  const stride = 4;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const index = (y * width + x) * 4; const r = data[index]; const g = data[index + 1]; const b = data[index + 2];
      allSamples += 1;
      if (Math.max(r, g, b) - Math.min(r, g, b) < 16 && r >= 150 && r <= 235) grey += 1;
      if (x < leftLimit) {
        leftSamples += 1;
        if (r > 175 && g > 150 && b < 95) yellow += 1;
        if (r < 75 && g < 75 && b < 75) dark += 1;
      }
    }
  }
  return yellow / leftSamples > .025 && dark / leftSamples > .035 && grey / allSamples > .18;
}

async function decodeTile(blob) {
  const dataUrl = await toDataUrl(blob);
  const image = new Image(); image.src = dataUrl; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth || TILE_SIZE; canvas.height = image.naturalHeight || TILE_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Map tile validation is unavailable in this browser.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  if (looksLikeBlockedTilePixels(pixels.data, canvas.width, canvas.height)) {
    throw new MapProviderPolicyError('OpenStreetMap blocked the tile request. Route Story Studio has stopped the export so the blocked-tile notice is not embedded. Review the map help and try again after the updated site is deployed.', 'BLOCKED_TILE_IMAGE');
  }
  return { dataUrl, image };
}

async function fetchTile(tile, range, controller) {
  const response = await fetch(`${MAP_PROVIDER.host}/${range.z}/${tile.x}/${tile.y}.png`, {
    signal: controller.signal,
    mode: 'cors',
    credentials: 'omit',
    cache: 'default',
    referrerPolicy: MAP_PROVIDER.referrerPolicy
  });
  if (response.status === 403) throw new MapProviderPolicyError('OpenStreetMap rejected this tile request (403). The application will not export the blocked response. Review the map help and retry after the site update.', 'HTTP_403');
  if (!response.ok) throw new Error(`Map tile request failed (${response.status}).`);
  const blob = await response.blob();
  if (!/^image\/png(?:;|$)/i.test(blob.type)) throw new MapProviderPolicyError('The map provider returned an unexpected response instead of a PNG tile.', 'UNEXPECTED_TILE_TYPE');
  if (blob.size > MAX_TILE_BYTES) throw new Error('A map tile exceeded the response-size limit.');
  return { ...tile, ...(await decodeTile(blob)) };
}

async function fetchTilesRespectfully(tiles, range, controller) {
  const loaded = new Array(tiles.length); let cursor = 0;
  async function worker() {
    while (cursor < tiles.length) {
      const index = cursor; cursor += 1;
      if (index > 0) await wait(TILE_REQUEST_DELAY_MS);
      loaded[index] = await fetchTile(tiles[index], range, controller);
    }
  }
  await Promise.all(Array.from({ length: Math.min(TILE_REQUEST_CONCURRENCY, tiles.length) }, () => worker()));
  return loaded;
}

export async function fetchMapMosaic(route, { timeoutMs = 15_000 } = {}) {
  const range = fitTileRange(route); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const tiles = [];
    for (let y = range.minY; y <= range.maxY; y += 1) for (let x = range.minX; x <= range.maxX; x += 1) tiles.push({ x, y });
    if (tiles.length > MAX_MAP_TILES) throw new Error('The map request exceeds the tile safety limit.');
    const loaded = await fetchTilesRespectfully(tiles, range, controller);
    const columns = range.maxX - range.minX + 1; const rows = range.maxY - range.minY + 1;
    const canvas = document.createElement('canvas'); canvas.width = columns * TILE_SIZE; canvas.height = rows * TILE_SIZE;
    const context = canvas.getContext('2d'); if (!context) throw new Error('Map composition is unavailable in this browser.');
    for (const tile of loaded) context.drawImage(tile.image, (tile.x - range.minX) * TILE_SIZE, (tile.y - range.minY) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    return { kind: 'map', mode: 'map', dataUrl: canvas.toDataURL('image/png'), provider: MAP_PROVIDER.id, attribution: MAP_PROVIDER.attribution, policyUrl: MAP_PROVIDER.privacyUrl, zoom: range.z, generatedAt: new Date().toISOString(), geoBounds: { minLon: tileToLon(range.minX, range.z), maxLon: tileToLon(range.maxX + 1, range.z), maxLat: tileToLat(range.minY, range.z), minLat: tileToLat(range.maxY + 1, range.z) } };
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('The map provider did not respond within the safety timeout.');
    throw error;
  } finally { clearTimeout(timer); }
}
