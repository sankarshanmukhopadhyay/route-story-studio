import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/gpx/parse-gpx.js',
  'src/domain/route-statistics.js',
  'src/render/poster-svg.js',
  'PRIVACY.md',
  'SECURITY.md'
];

for (const file of required) await access(file);

const html = await readFile('index.html', 'utf8');
if (!html.includes('src/app.js')) throw new Error('index.html does not load src/app.js');
if (!html.includes('viewport')) throw new Error('index.html is missing the viewport declaration');
console.log(`Project checks passed (${required.length} required files).`);
