export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_POINTS = 250_000;

function localElements(root, name) {
  return [...root.getElementsByTagNameNS('*', name)];
}

function childText(node, name) {
  const child = [...node.children].find((element) => element.localName === name);
  return child?.textContent?.trim() ?? '';
}

function firstText(root, name) {
  return localElements(root, name)[0]?.textContent?.trim() ?? '';
}

function parsePoint(node, index) {
  const latitude = Number(node.getAttribute('lat'));
  const longitude = Number(node.getAttribute('lon'));
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error(`Invalid latitude at point ${index + 1}.`);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error(`Invalid longitude at point ${index + 1}.`);
  const elevation = Number.parseFloat(childText(node, 'ele'));
  const timeValue = childText(node, 'time');
  const timestamp = timeValue ? new Date(timeValue) : null;
  return {
    latitude,
    longitude,
    elevationMetres: Number.isFinite(elevation) ? elevation : null,
    timestamp: timestamp && !Number.isNaN(timestamp.valueOf()) ? timestamp : null
  };
}

export async function parseGpxFile(file) {
  if (!(file instanceof File)) throw new TypeError('A GPX file is required.');
  if (file.size > MAX_FILE_BYTES) throw new Error('The GPX file exceeds the 25 MB safety limit.');
  return parseGpx(await file.text(), file.name);
}

export function parseGpx(xmlText, sourceName = 'route.gpx') {
  if (/<!DOCTYPE|<!ENTITY/i.test(xmlText)) throw new Error('Document type and entity declarations are not supported.');
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The file is not valid GPX/XML.');
  const root = document.documentElement;
  if (root.localName.toLowerCase() !== 'gpx') throw new Error('The document does not contain a GPX root element.');

  const version = root.getAttribute('version') || 'unknown';
  const segmentNodes = localElements(root, 'trkseg');
  const routeNodes = localElements(root, 'rte');
  const segments = [];
  let pointIndex = 0;

  for (const segmentNode of segmentNodes) {
    const points = localElements(segmentNode, 'trkpt').map((node) => parsePoint(node, pointIndex++));
    if (points.length) segments.push({ id: `segment-${segments.length + 1}`, points });
  }
  for (const routeNode of routeNodes) {
    const points = localElements(routeNode, 'rtept').map((node) => parsePoint(node, pointIndex++));
    if (points.length) segments.push({ id: `segment-${segments.length + 1}`, points });
  }

  const pointCount = segments.reduce((sum, segment) => sum + segment.points.length, 0);
  if (pointCount < 2) throw new Error('The GPX file must contain at least two track or route points.');
  if (pointCount > MAX_POINTS) throw new Error(`The route contains more than ${MAX_POINTS.toLocaleString()} points.`);

  const points = segments.flatMap((segment) => segment.points);
  const warnings = [];
  if (!points.some((point) => Number.isFinite(point.elevationMetres))) warnings.push('No elevation values were found.');
  if (!points.some((point) => point.timestamp instanceof Date)) warnings.push('No valid timestamps were found.');
  if (version !== '1.0' && version !== '1.1') warnings.push(`GPX version ${version} is not explicitly recognised; compatible elements were imported.`);
  if (segments.length > 1) warnings.push(`${segments.length} route segments were preserved.`);

  const sourceType = segmentNodes.length ? 'recorded-track' : 'planned-route';
  return {
    schemaVersion: '1.0',
    id: `route-${Date.now().toString(36)}`,
    title: firstText(root, 'name') || sourceName.replace(/\.gpx$/i, ''),
    sourceType,
    segments,
    points,
    waypoints: [],
    source: { type: 'gpx', name: sourceName, version },
    provenance: { geometrySource: sourceType, warnings }
  };
}
