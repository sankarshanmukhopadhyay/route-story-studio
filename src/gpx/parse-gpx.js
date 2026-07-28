export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_POINTS = 100_000;
export const MAX_SEGMENTS = 2_000;
export const MAX_METADATA_LENGTH = 500;

function localElements(root, name) {
  return [...root.getElementsByTagNameNS('*', name)];
}

function childText(node, name) {
  const child = [...node.children].find((element) => element.localName === name);
  return child?.textContent?.trim() ?? '';
}

function boundedText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, MAX_METADATA_LENGTH);
}

function firstText(root, name) {
  return boundedText(localElements(root, name)[0]?.textContent);
}

function countPointTags(xmlText) {
  return (xmlText.match(/<(?:[\w.-]+:)?(?:trkpt|rtept)\b/gi) ?? []).length;
}

function countSegmentTags(xmlText) {
  return (xmlText.match(/<(?:[\w.-]+:)?(?:trkseg|rte)\b/gi) ?? []).length;
}

function preflightXml(xmlText) {
  if (typeof xmlText !== 'string') throw new TypeError('GPX content must be text.');
  if (new Blob([xmlText]).size > MAX_FILE_BYTES) throw new Error('The GPX content exceeds the 8 MB safety limit.');
  if (/<!DOCTYPE|<!ENTITY/i.test(xmlText)) throw new Error('Document type and entity declarations are not supported.');
  const pointCount = countPointTags(xmlText);
  if (pointCount > MAX_POINTS) throw new Error(`The route contains more than ${MAX_POINTS.toLocaleString()} points.`);
  if (countSegmentTags(xmlText) > MAX_SEGMENTS) throw new Error(`The GPX file contains more than ${MAX_SEGMENTS.toLocaleString()} segments or routes.`);
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
  if (file.size > MAX_FILE_BYTES) throw new Error('The GPX file exceeds the 8 MB safety limit.');
  return parseGpx(await file.text(), file.name);
}

export function parseGpx(xmlText, sourceName = 'route.gpx') {
  preflightXml(xmlText);
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The file is not valid GPX/XML.');
  const root = document.documentElement;
  if (root.localName.toLowerCase() !== 'gpx') throw new Error('The document does not contain a GPX root element.');

  const version = boundedText(root.getAttribute('version'), 'unknown');
  const segmentNodes = localElements(root, 'trkseg');
  const routeNodes = localElements(root, 'rte');
  if (segmentNodes.length + routeNodes.length > MAX_SEGMENTS) throw new Error('The GPX structure exceeds the segment safety limit.');

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
    title: firstText(root, 'name') || boundedText(sourceName.replace(/\.gpx$/i, ''), 'Untitled route'),
    sourceType,
    segments,
    points,
    waypoints: [],
    source: { type: 'gpx', name: boundedText(sourceName, 'route.gpx'), version },
    provenance: { geometrySource: sourceType, warnings }
  };
}
