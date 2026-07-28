import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html', 'assets/styles.css', 'src/app.js', 'src/gpx/parse-gpx.js',
  'src/render/poster-svg.js', 'src/export/export-png.js', 'src/kml/parse-kml.js', 'src/import/parse-route-file.js',
  'src/project/project-model.js', 'src/project/project-file.js', 'src/storage/indexeddb.js',
  'schemas/route-document.schema.json', 'schemas/route-story-project.schema.json',
  'docs/index.html', 'docs/getting-started.html', 'docs/supported-gpx.html',
  'docs/privacy-model.html', 'docs/security-model.html', 'docs/known-limitations.html',
  'docs/release-checklist.html', 'RELEASE_NOTES.md', 'SBOM.spdx.json'
];
for (const path of required) await access(path);
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (packageJson.version !== '0.1.0') throw new Error('package.json must declare version 0.1.0');
console.log(`Project checks passed: ${required.length} required files; release version ${packageJson.version}.`);
