import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const port = 4173;
const server = spawn('python3', ['-m', 'http.server', String(port), '--directory', 'dist'], { stdio: 'ignore' });
try {
  await wait(600);
  const response = await fetch(`http://127.0.0.1:${port}/`);
  if (!response.ok) throw new Error(`Built site returned HTTP ${response.status}.`);
  const html = await response.text();
  for (const expected of ['Route Story Studio', 'Use sample route', 'Download PNG']) if (!html.includes(expected)) throw new Error(`Built site is missing: ${expected}`);
  const sample = await fetch(`http://127.0.0.1:${port}/public/samples/sample-route.gpx`);
  if (!sample.ok || !(await sample.text()).includes('<gpx')) throw new Error('Sample GPX is not available from the built site.');
  console.log('Built-site HTTP smoke test passed.');
} finally {
  server.kill('SIGTERM');
}
