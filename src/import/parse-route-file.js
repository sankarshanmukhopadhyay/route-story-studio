import { parseGpxFile } from '../gpx/parse-gpx.js';
import { parseKmlFile } from '../kml/parse-kml.js';

export const SUPPORTED_ROUTE_EXTENSIONS = ['.gpx', '.kml'];

export function routeFileType(file) {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.gpx')) return 'gpx';
  if (name.endsWith('.kml')) return 'kml';
  const type = String(file?.type || '').toLowerCase();
  if (type.includes('kml')) return 'kml';
  if (type.includes('gpx')) return 'gpx';
  throw new Error('Choose a supported GPX or KML route file.');
}

export async function parseRouteFile(file) {
  return routeFileType(file) === 'kml' ? parseKmlFile(file) : parseGpxFile(file);
}
