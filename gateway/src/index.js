import { GATEWAY_TIMEOUT_MS, MAX_GATEWAY_REDIRECTS, isRedirectStatus, validateGatewayUrl } from './redirect-policy.js';

const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  'https://sankarshanmukhopadhyay.github.io',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]);

function json(body, status = 200, origin = '') {
  const headers = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'vary':'Origin' };
  if (origin) { headers['access-control-allow-origin'] = origin; headers['access-control-allow-methods'] = 'POST, OPTIONS'; headers['access-control-allow-headers'] = 'content-type'; }
  return new Response(JSON.stringify(body), { status, headers });
}

function allowedOrigins(env) {
  return new Set(String(env?.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(',')).split(',').map((v)=>v.trim()).filter(Boolean));
}

export async function resolveShortLink(sourceValue, { fetchImpl = fetch, timeoutMs = GATEWAY_TIMEOUT_MS } = {}) {
  const source = validateGatewayUrl(sourceValue, { input: true });
  let current = source;
  const redirects = [];
  for (let count = 0; count <= MAX_GATEWAY_REDIRECTS; count += 1) {
    validateGatewayUrl(current.href, { input: count === 0 });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(current.href, { method:'GET', redirect:'manual', credentials:'omit', signal:controller.signal, headers:{ accept:'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1' } });
    } finally { clearTimeout(timer); }
    if (!isRedirectStatus(response.status)) {
      return { status:'resolved', sourceUrl:source.href, finalUrl:current.href, finalHost:current.hostname, redirectCount:redirects.length, redirects, resolvedAt:new Date().toISOString() };
    }
    if (count === MAX_GATEWAY_REDIRECTS) throw new Error('The short link exceeded the redirect limit.');
    const location = response.headers.get('location');
    if (!location) throw new Error('The redirect response did not include a destination.');
    const next = validateGatewayUrl(new URL(location, current).href);
    redirects.push({ fromHost:current.hostname, toHost:next.hostname, status:response.status });
    current = next;
  }
  throw new Error('The short link could not be resolved.');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const origins = allowedOrigins(env);
    if (!origins.has(origin)) return json({ error:'Origin not allowed.' }, 403);
    if (request.method === 'OPTIONS') return json({}, 204, origin);
    if (request.method !== 'POST') return json({ error:'Method not allowed.' }, 405, origin);
    const length = Number(request.headers.get('content-length') || 0);
    if (length > 8192) return json({ error:'Request body too large.' }, 413, origin);
    let body;
    try { body = await request.json(); } catch { return json({ error:'Invalid JSON body.' }, 400, origin); }
    try { return json(await resolveShortLink(body?.url), 200, origin); }
    catch (error) { return json({ error:error instanceof Error ? error.message : 'Resolution failed.' }, 422, origin); }
  }
};
