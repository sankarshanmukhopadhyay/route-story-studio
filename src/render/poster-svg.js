import { formatDistance, formatDuration, formatElevation } from '../domain/route-statistics.js';
import { LAYOUT_PRESETS } from './layout-presets.js';

function escapeXml(value) { return String(value).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]); }
function allPoints(route) { return route.segments.flatMap((segment) => segment.points); }

function bounds(points) {
  const lats = points.map((p) => p.latitude); const lons = points.map((p) => p.longitude);
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLon: Math.min(...lons), maxLon: Math.max(...lons) };
}
function mapSegments(route, box) {
  const points = allPoints(route); const b = bounds(points);
  const lonSpan = Math.max(b.maxLon - b.minLon, .000001); const latSpan = Math.max(b.maxLat - b.minLat, .000001);
  const scale = Math.min(box.width / lonSpan, box.height / latSpan);
  const offsetX = box.x + (box.width - lonSpan * scale) / 2; const offsetY = box.y + (box.height - latSpan * scale) / 2;
  return route.segments.map((segment) => segment.points.map((p) => ({ x: offsetX + (p.longitude - b.minLon) * scale, y: offsetY + (b.maxLat - p.latitude) * scale })));
}
function path(points) { return points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' '); }
function elevationPath(points, box) {
  const usable = points.filter((p) => Number.isFinite(p.elevationMetres)); if (usable.length < 2) return '';
  const values = usable.map((p) => p.elevationMetres); const min = Math.min(...values); const span = Math.max(Math.max(...values) - min, 1);
  return usable.map((p, i) => `${i ? 'L' : 'M'} ${(box.x + i / (usable.length - 1) * box.width).toFixed(2)} ${(box.y + box.height - (p.elevationMetres - min) / span * box.height).toFixed(2)}`).join(' ');
}

export function createPosterSvg(options) {
  const { route, statistics, title, subtitle, lineWidth = 7, showElevation = true, showDuration = true, showMarkers = true, units = 'metric', layout = 'portrait', routeColor = '#f7f3e9', backgroundColor = '#0b0f0c', textColor = '#f5f1e8' } = options;
  const preset = LAYOUT_PRESETS[layout] ?? LAYOUT_PRESETS.portrait; const landscape = layout === 'landscape';
  const mappedSegments = mapSegments(route, preset.routeBox); const points = allPoints(route);
  const elevationBox = landscape ? { x: 1060, y: 500, width: 450, height: 95 } : { x: 90, y: preset.elevationY, width: 900, height: 100 };
  const elevation = elevationPath(points, elevationBox);
  const stats = [{ value: formatDistance(statistics.distanceMetres, units), label: 'DISTANCE' }, { value: formatElevation(statistics.elevationGainMetres, units), label: 'ELEVATION GAIN' }, ...(showDuration && Number.isFinite(statistics.durationSeconds) ? [{ value: formatDuration(statistics.durationSeconds), label: 'DURATION' }] : [])];
  const statsX = landscape ? 1060 : 90; const statsWidth = landscape ? 450 : 900;
  const statMarkup = stats.map((stat, index) => `<g transform="translate(${statsX + index * statsWidth / stats.length} 0)"><text y="${preset.statsY}" class="stat-value">${escapeXml(stat.value)}</text><text y="${preset.statsY + 35}" class="stat-label">${stat.label}</text></g>`).join('');
  const segmentMarkup = mappedSegments.map((segment) => `<path d="${path(segment)}" fill="none" stroke="${escapeXml(routeColor)}" stroke-width="${Number(lineWidth)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const first = mappedSegments[0][0]; const lastSegment = mappedSegments.at(-1); const last = lastSegment.at(-1);
  const titleX = landscape ? 1060 : 90; const titleSize = landscape ? 62 : 72;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${preset.width} ${preset.height}" role="img" aria-label="Route poster for ${escapeXml(title)}">
<style>text{font-family:Inter,Arial,sans-serif;fill:${escapeXml(textColor)}}.eyebrow{font-size:17px;font-weight:700;letter-spacing:4px;fill:#86c8aa}.title{font-size:${titleSize}px;font-weight:800;letter-spacing:-2px}.subtitle{font-size:25px;opacity:.72}.stat-value{font-size:34px;font-weight:800}.stat-label{font-size:13px;font-weight:700;letter-spacing:2px;opacity:.7}</style>
<rect width="100%" height="100%" fill="${escapeXml(backgroundColor)}"/><circle cx="${preset.width * .88}" cy="${preset.height * .12}" r="${preset.height * .16}" fill="#ef8f4c" opacity=".08"/>
<text x="${titleX}" y="70" class="eyebrow">ROUTE STORY</text>${segmentMarkup}
${showMarkers ? `<circle cx="${first.x}" cy="${first.y}" r="11" fill="#7bc4a4" stroke="#0d120f" stroke-width="4"/><circle cx="${last.x}" cy="${last.y}" r="11" fill="#ef8f4c" stroke="#0d120f" stroke-width="4"/>` : ''}
<text x="${titleX}" y="${preset.titleY}" class="title">${escapeXml(title)}</text><text x="${titleX}" y="${preset.titleY + 48}" class="subtitle">${escapeXml(subtitle || route.source.name)}</text>
${showElevation && elevation ? `<text x="${elevationBox.x}" y="${elevationBox.y - 20}" class="eyebrow">ELEVATION PROFILE</text><path d="${elevation}" fill="none" stroke="${escapeXml(routeColor)}" stroke-width="4" stroke-linecap="round"/>` : ''}${statMarkup}
<text x="${titleX}" y="${preset.height - 45}" class="subtitle" font-size="16">Created locally with Route Story Studio · ${escapeXml(route.sourceType === 'planned-route' ? 'planned route' : 'recorded track')}</text></svg>`;
}
