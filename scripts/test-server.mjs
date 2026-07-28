import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const axePath = path.resolve(fileURLToPath(new URL('../node_modules/axe-core/axe.min.js', import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const host = '127.0.0.1';

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gpx', 'application/gpx+xml; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.kml', 'application/vnd.google-earth.kml+xml; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
]);

function send(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

async function serveFile(response, filePath) {
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      send(response, 404, 'Not found');
      return;
    }
    const body = await readFile(filePath);
    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
    send(response, 200, body, contentType);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      send(response, 404, 'Not found');
      return;
    }
    console.error(error);
    send(response, 500, 'Internal server error');
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`);

  // Serve axe-core as a same-origin external script so the production CSP
  // remains enforced during accessibility tests. This endpoint exists only
  // in the local Playwright test server and is not included in dist/.
  if (requestUrl.pathname === '/__test__/axe.min.js') {
    await serveFile(response, axePath);
    return;
  }

  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const candidate = path.resolve(root, relativePath);

  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    send(response, 403, 'Forbidden');
    return;
  }

  await serveFile(response, candidate);
});

server.listen(port, host, () => {
  console.log(`Playwright test server listening on http://${host}:${port}`);
});
