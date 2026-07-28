import { readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const parser = await readFile('src/gpx/parse-gpx.js', 'utf8');
const kmlParser = await readFile('src/kml/parse-kml.js', 'utf8');
const projectModel = await readFile('src/project/project-model.js', 'utf8');
const autoMerge = await readFile('.github/workflows/dependabot-auto-merge.yml', 'utf8');

const requirements = [
  [html.includes('Content-Security-Policy'), 'Content Security Policy is missing.'],
  [html.includes('no-referrer'), 'Referrer policy is missing.'],
  [parser.includes('MAX_FILE_BYTES'), 'File-size boundary is missing.'],
  [parser.includes('MAX_POINTS'), 'Point-count boundary is missing.'],
  [parser.includes('MAX_SEGMENTS'), 'Segment-count boundary is missing.'],
  [parser.includes('<!DOCTYPE|<!ENTITY'), 'GPX XML entity hardening is missing.'],
  [kmlParser.includes('<!DOCTYPE|<!ENTITY'), 'KML XML entity hardening is missing.'],
  [kmlParser.includes('MAX_KML_POINTS'), 'KML point-count boundary is missing.'],
  [projectModel.includes('MAX_PROJECT_BYTES'), 'Project-file size boundary is missing.'],
  [projectModel.includes('MAX_PROJECT_POINTS'), 'Project route-point boundary is missing.'],
  [autoMerge.includes("github.actor == 'dependabot[bot]'"), 'Dependabot actor restriction is missing.'],
  [!autoMerge.includes('actions/checkout'), 'Auto-merge workflow must not check out pull-request code.']
];
for (const [condition, message] of requirements) if (!condition) throw new Error(message);
console.log(`Security checks passed (${requirements.length} controls).`);
