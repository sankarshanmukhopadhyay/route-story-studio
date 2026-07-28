import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const files = (await readdir('docs')).filter((name) => name.endsWith('.html'));
const errors = [];
const required = ['route-acquisition.html','routing-providers.html','exporting-generated-routes.html','map-backgrounds.html','expanding-short-links.html','resolver-deployment.html','interoperability.html','elevation-metrics.html'];
for (const name of required) if (!files.includes(name)) errors.push(`missing required guide ${name}`);
for (const file of files) {
  const path = resolve('docs', file);
  const html = await readFile(path, 'utf8');
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|#|mailto:)/.test(href)) continue;
    const target = resolve(dirname(path), href.split('#')[0]);
    try { await access(target); } catch { errors.push(`${file}: broken link ${href}`); }
  }
  if (!html.includes('<nav class="nav"') || !html.includes('class="next"')) errors.push(`${file}: missing documentation navigation`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Documentation checks passed for ${files.length} pages.`);
