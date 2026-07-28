export const MAX_KML_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_KML_POINTS = 100_000;
export const MAX_KML_FEATURES = 2_000;
const MAX_METADATA_LENGTH = 500;

function bounded(value, fallback = '') {
  return String(value || fallback).trim().slice(0, MAX_METADATA_LENGTH);
}

function elements(root, name) {
  return [...root.getElementsByTagNameNS('*', name)];
}

function firstChildText(node, name) {
  const child = [...node.children].find((item) => item.localName === name);
  return child?.textContent?.trim() ?? '';
}

export function parseCoordinateText(text) {
  const points = [];
  for (const token of String(text || '').trim().split(/\s+/)) {
    if (!token) continue;
    const [longitudeValue, latitudeValue, elevationValue] = token.split(',');
    const longitude = Number(longitudeValue);
    const latitude = Number(latitudeValue);
    const elevationMetres = elevationValue === undefined ? null : Number(elevationValue);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error('KML contains an invalid latitude.');
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('KML contains an invalid longitude.');
    points.push({ latitude, longitude, elevationMetres: Number.isFinite(elevationMetres) ? elevationMetres : null, timestamp: null });
  }
  return points;
}

function parseGxCoordinate(text) {
  const [longitudeValue, latitudeValue, elevationValue] = String(text || '').trim().split(/\s+/);
  const longitude = Number(longitudeValue);
  const latitude = Number(latitudeValue);
  const elevationMetres = elevationValue === undefined ? null : Number(elevationValue);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error('KML gx:Track contains an invalid latitude.');
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('KML gx:Track contains an invalid longitude.');
  return { latitude, longitude, elevationMetres: Number.isFinite(elevationMetres) ? elevationMetres : null, timestamp: null };
}

function preflight(text) {
  if (typeof text !== 'string') throw new TypeError('KML content must be text.');
  if (new Blob([text]).size > MAX_KML_FILE_BYTES) throw new Error('The KML content exceeds the 8 MB safety limit.');
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('Document type and entity declarations are not supported.');
  const gxPoints = (text.match(/<(?:[\w.-]+:)?coord\b/gi) ?? []).length;
  const tuplePoints = (text.match(/[-+]?\d+(?:\.\d+)?,\s*[-+]?\d+(?:\.\d+)?(?:,\s*[-+]?\d+(?:\.\d+)?)?/g) ?? []).length;
  const points = gxPoints + tuplePoints;
  if (points > MAX_KML_POINTS) throw new Error(`The KML structure exceeds the ${MAX_KML_POINTS.toLocaleString()} point safety limit.`);
  const features = (text.match(/<(?:[\w.-]+:)?(?:Placemark|LineString|Track)\b/gi) ?? []).length;
  if (features > MAX_KML_FEATURES) throw new Error(`The KML file contains more than ${MAX_KML_FEATURES.toLocaleString()} features.`);
}

export async function parseKmlFile(file) {
  if (!(file instanceof File)) throw new TypeError('A KML file is required.');
  if (file.size > MAX_KML_FILE_BYTES) throw new Error('The KML file exceeds the 8 MB safety limit.');
  return parseKml(await file.text(), file.name);
}

export function parseKml(xmlText, sourceName = 'route.kml') {
  preflight(xmlText);
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The file is not valid KML/XML.');
  const root = document.documentElement;
  if (root.localName.toLowerCase() !== 'kml') throw new Error('The document does not contain a KML root element.');

  const segments = [];
  for (const line of elements(root, 'LineString')) {
    const coordinates = elements(line, 'coordinates')[0]?.textContent ?? '';
    const points = parseCoordinateText(coordinates);
    if (points.length) segments.push({ id: `segment-${segments.length + 1}`, points });
  }

  for (const track of elements(root, 'Track')) {
    const coordinates = elements(track, 'coord').map((node) => parseGxCoordinate(node.textContent));
    const times = elements(track, 'when');
    coordinates.forEach((point, index) => {
      const value = times[index]?.textContent?.trim();
      const timestamp = value ? new Date(value) : null;
      point.timestamp = timestamp && !Number.isNaN(timestamp.valueOf()) ? timestamp : null;
    });
    if (coordinates.length) segments.push({ id: `segment-${segments.length + 1}`, points: coordinates });
  }

  const points = segments.flatMap((segment) => segment.points);
  if (points.length < 2) throw new Error('The KML file must contain a LineString or gx:Track with at least two points.');
  if (points.length > MAX_KML_POINTS) throw new Error(`The route contains more than ${MAX_KML_POINTS.toLocaleString()} points.`);

  const waypoints = [];
  for (const placemark of elements(root, 'Placemark')) {
    const pointNode = elements(placemark, 'Point')[0];
    if (!pointNode) continue;
    const coordinateNode = elements(pointNode, 'coordinates')[0];
    const [point] = parseCoordinateText(coordinateNode?.textContent ?? '');
    if (point) waypoints.push({ id: `waypoint-${waypoints.length + 1}`, name: bounded(firstChildText(placemark, 'name')), latitude: point.latitude, longitude: point.longitude });
  }

  const hasRecordedTrack = elements(root, 'Track').length > 0;
  const warnings = [];
  if (!points.some((point) => Number.isFinite(point.elevationMetres))) warnings.push('No elevation values were found.');
  if (!points.some((point) => point.timestamp instanceof Date)) warnings.push('No valid timestamps were found.');
  if (segments.length > 1) warnings.push(`${segments.length} route segments were preserved.`);
  if (waypoints.length) warnings.push(`${waypoints.length} KML point placemark${waypoints.length === 1 ? '' : 's'} retained as waypoints.`);

  return {
    schemaVersion: '1.0',
    id: `route-${Date.now().toString(36)}`,
    title: bounded(elements(root, 'name')[0]?.textContent) || bounded(sourceName.replace(/\.kml$/i, ''), 'Untitled route'),
    sourceType: hasRecordedTrack ? 'recorded-track' : 'planned-route',
    segments,
    points,
    waypoints,
    source: { type: 'kml', name: bounded(sourceName, 'route.kml'), version: '2.2-compatible' },
    provenance: { geometrySource: hasRecordedTrack ? 'recorded-track' : 'planned-route', warnings }
  };
}
