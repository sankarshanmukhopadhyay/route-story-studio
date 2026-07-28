const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_POINTS = 250_000;

function text(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() ?? '';
}

export async function parseGpxFile(file) {
  if (!(file instanceof File)) throw new TypeError('A GPX file is required.');
  if (file.size > MAX_FILE_BYTES) throw new Error('The GPX file exceeds the 25 MB safety limit.');
  return parseGpx(await file.text(), file.name);
}

export function parseGpx(xmlText, sourceName = 'route.gpx') {
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The file is not valid GPX/XML.');
  const root = document.documentElement;
  if (root.localName.toLowerCase() !== 'gpx') throw new Error('The document does not contain a GPX root element.');

  const pointNodes = [...document.querySelectorAll('trkpt, rtept')];
  if (pointNodes.length < 2) throw new Error('The GPX file must contain at least two track or route points.');
  if (pointNodes.length > MAX_POINTS) throw new Error(`The route contains more than ${MAX_POINTS.toLocaleString()} points.`);

  const points = pointNodes.map((node, index) => {
    const latitude = Number(node.getAttribute('lat'));
    const longitude = Number(node.getAttribute('lon'));
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error(`Invalid latitude at point ${index + 1}.`);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error(`Invalid longitude at point ${index + 1}.`);
    const elevation = Number.parseFloat(text(node, 'ele'));
    const timeValue = text(node, 'time');
    return {
      latitude,
      longitude,
      elevationMetres: Number.isFinite(elevation) ? elevation : null,
      timestamp: timeValue ? new Date(timeValue) : null
    };
  });

  return {
    schemaVersion: '1.0',
    title: text(document, 'metadata > name') || text(document, 'trk > name') || text(document, 'rte > name') || sourceName.replace(/\.gpx$/i, ''),
    points,
    source: { type: 'gpx', name: sourceName },
    provenance: { geometrySource: 'recorded-or-exported-track', warnings: [] }
  };
}
