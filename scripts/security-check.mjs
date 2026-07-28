import { readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const parser = await readFile('src/gpx/parse-gpx.js', 'utf8');
const kmlParser = await readFile('src/kml/parse-kml.js', 'utf8');
const projectModel = await readFile('src/project/project-model.js', 'utf8');
const autoMerge = await readFile('.github/workflows/dependabot-auto-merge.yml', 'utf8');
const mapLoader = await readFile('src/map/map-background.js', 'utf8');
const safeUrl = await readFile('src/security/safe-url.js', 'utf8');

const requirements = [
  [html.includes('Content-Security-Policy'), 'Content Security Policy is missing.'],
  [html.includes('strict-origin-when-cross-origin'), 'Map-compatible Referrer-Policy is missing.'],
  [parser.includes('MAX_FILE_BYTES'), 'File-size boundary is missing.'],
  [parser.includes('MAX_POINTS'), 'Point-count boundary is missing.'],
  [parser.includes('MAX_SEGMENTS'), 'Segment-count boundary is missing.'],
  [parser.includes('<!DOCTYPE|<!ENTITY'), 'GPX XML entity hardening is missing.'],
  [kmlParser.includes('<!DOCTYPE|<!ENTITY'), 'KML XML entity hardening is missing.'],
  [kmlParser.includes('MAX_KML_POINTS'), 'KML point-count boundary is missing.'],
  [projectModel.includes('MAX_PROJECT_BYTES'), 'Project-file size boundary is missing.'],
  [projectModel.includes('MAX_PROJECT_POINTS'), 'Project route-point boundary is missing.'],
  [autoMerge.includes("github.actor == 'dependabot[bot]'"), 'Dependabot actor restriction is missing.'],
  [!autoMerge.includes('actions/checkout'), 'Auto-merge workflow must not check out pull-request code.'],
  [mapLoader.includes("cache: 'default'"), 'Map requests must preserve browser caching.'],
  [mapLoader.includes('TILE_REQUEST_CONCURRENCY = 2'), 'Map request concurrency boundary is missing.'],
  [mapLoader.includes('looksLikeBlockedTilePixels'), 'Blocked-tile detection is missing.'],
  [mapLoader.includes("referrerPolicy: MAP_PROVIDER.referrerPolicy"), 'Map requests must send the configured referrer policy.'],
  [safeUrl.includes('ALLOWED_MAP_HOSTS'), 'Map-link host allowlist is missing.'],
  [safeUrl.includes("url.protocol !== 'https:'"), 'Map-link HTTPS boundary is missing.'],
  [safeUrl.includes('MAX_MAP_LINK_LENGTH'), 'Map-link length boundary is missing.']
];
for (const [condition, message] of requirements) if (!condition) throw new Error(message);
console.log(`Security checks passed (${requirements.length} controls).`);
