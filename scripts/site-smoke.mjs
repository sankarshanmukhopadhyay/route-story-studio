import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', 'dist'], { stdio: 'ignore' });

async function fetchWhenReady(path, attempts = 20) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await fetch(`${origin}${path}`); }
    catch (error) { lastError = error; await wait(150); }
  }
  throw lastError;
}

try {
  const response = await fetchWhenReady('/');
  if (!response.ok) throw new Error(`Built site returned HTTP ${response.status}.`);
  const html = await response.text();
  for (const expected of ['Route Story Studio', 'Use sample route', 'Download PNG']) if (!html.includes(expected)) throw new Error(`Built site is missing: ${expected}`);
  const docs = await fetchWhenReady('/docs/index.html');
  if (!docs.ok) throw new Error(`Documentation home returned HTTP ${docs.status}.`);
  const docsHtml = await docs.text();
  for (const expected of ['Help and guided journey', 'class="shell"', 'aria-label="Documentation"']) if (!docsHtml.includes(expected)) throw new Error(`Documentation home is missing: ${expected}`);
  const sample = await fetchWhenReady('/public/samples/sample-route.gpx');
  if (!sample.ok || !(await sample.text()).includes('<gpx')) throw new Error('Sample GPX is not available from the built site.');
  console.log('Built-site HTTP smoke test passed, including documentation home.');
} finally {
  server.kill('SIGTERM');
}
