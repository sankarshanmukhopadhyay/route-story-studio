import { formatDistance, formatDuration } from '../domain/route-statistics.js';

const WIDTH = 1080;
const HEIGHT = 1350;

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]);
}

function normaliseRoute(points, box) {
  const lats = points.map((point) => point.latitude);
  const lons = points.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const lonSpan = Math.max(maxLon - minLon, 0.000001);
  const latSpan = Math.max(maxLat - minLat, 0.000001);
  const scale = Math.min(box.width / lonSpan, box.height / latSpan);
  const drawnWidth = lonSpan * scale;
  const drawnHeight = latSpan * scale;
  const offsetX = box.x + (box.width - drawnWidth) / 2;
  const offsetY = box.y + (box.height - drawnHeight) / 2;
  return points.map((point) => ({
    x: offsetX + (point.longitude - minLon) * scale,
    y: offsetY + (maxLat - point.latitude) * scale
  }));
}

function routePath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function elevationPath(points, box) {
  const values = points.map((point) => point.elevationMetres).filter(Number.isFinite);
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const elevationPoints = points.filter((point) => Number.isFinite(point.elevationMetres));
  return elevationPoints.map((point, index) => {
    const x = box.x + (index / Math.max(elevationPoints.length - 1, 1)) * box.width;
    const y = box.y + box.height - ((point.elevationMetres - min) / span) * box.height;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export function createPosterSvg({ route, statistics, title, subtitle, lineWidth = 7, showElevation = true, showDuration = true }) {
  const mapped = normaliseRoute(route.points, { x: 90, y: 150, width: 900, height: 550 });
  const elevation = elevationPath(route.points, { x: 90, y: 940, width: 900, height: 110 });
  const stats = [
    { value: formatDistance(statistics.distanceMetres), label: 'DISTANCE' },
    { value: `${Math.round(statistics.elevationGainMetres)} m`, label: 'ELEVATION GAIN' },
    ...(showDuration ? [{ value: formatDuration(statistics.durationSeconds), label: 'DURATION' }] : [])
  ];
  const columns = stats.length;
  const statMarkup = stats.map((stat, index) => {
    const x = 90 + index * (900 / columns);
    return `<g transform="translate(${x} 0)"><text y="1165" class="stat-value">${escapeXml(stat.value)}</text><text y="1200" class="stat-label">${escapeXml(stat.label)}</text></g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Route poster for ${escapeXml(title)}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#203128"/><stop offset="1" stop-color="#0b0f0c"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <style>
    text { font-family: Inter, Arial, sans-serif; fill: #f5f1e8; }
    .eyebrow { font-size: 19px; font-weight: 700; letter-spacing: 5px; fill: #86c8aa; }
    .title { font-size: 72px; font-weight: 800; letter-spacing: -2px; }
    .subtitle { font-size: 28px; fill: #bbc5bd; }
    .stat-value { font-size: 38px; font-weight: 800; }
    .stat-label { font-size: 15px; font-weight: 700; letter-spacing: 3px; fill: #bbc5bd; }
  </style>
  <rect width="1080" height="1350" fill="url(#background)"/>
  <circle cx="910" cy="160" r="220" fill="#ef8f4c" opacity=".08"/>
  <text x="90" y="90" class="eyebrow">ROUTE STORY</text>
  <path d="${routePath(mapped)}" fill="none" stroke="#f7f3e9" stroke-width="${Number(lineWidth)}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
  <circle cx="${mapped[0].x}" cy="${mapped[0].y}" r="12" fill="#7bc4a4" stroke="#0d120f" stroke-width="5"/>
  <circle cx="${mapped.at(-1).x}" cy="${mapped.at(-1).y}" r="12" fill="#ef8f4c" stroke="#0d120f" stroke-width="5"/>
  <text x="90" y="810" class="title">${escapeXml(title)}</text>
  <text x="90" y="860" class="subtitle">${escapeXml(subtitle || route.source.name)}</text>
  ${showElevation && elevation ? `<path d="${elevation}" fill="none" stroke="#f7f3e9" stroke-width="5" stroke-linecap="round" opacity=".88"/><text x="90" y="920" class="eyebrow">ELEVATION PROFILE</text>` : ''}
  ${statMarkup}
  <line x1="90" x2="990" y1="1260" y2="1260" stroke="#425149"/>
  <text x="90" y="1300" class="subtitle" font-size="18">Created locally with Route Story Studio</text>
</svg>`;
}
