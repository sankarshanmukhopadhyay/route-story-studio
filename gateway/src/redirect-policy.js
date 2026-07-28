export const SHORT_LINK_INPUT_HOSTS = Object.freeze(['maps.app.goo.gl']);
export const GOOGLE_REDIRECT_HOSTS = Object.freeze(['maps.app.goo.gl','google.com','www.google.com','maps.google.com']);
export const MAX_GATEWAY_REDIRECTS = 5;
export const MAX_GATEWAY_URL_LENGTH = 4096;
export const GATEWAY_TIMEOUT_MS = 8000;

function isPrivateIpv4(hostname) {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!match) return false;
  const octets = match.slice(1).map(Number);
  if (octets.some((v) => v > 255)) return true;
  const [a,b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function validateGatewayUrl(value, { input = false } = {}) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > MAX_GATEWAY_URL_LENGTH) throw new Error('The short-link URL is missing or exceeds the safety limit.');
  let url;
  try { url = new URL(raw); } catch { throw new Error('The short-link URL is invalid.'); }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (url.protocol !== 'https:') throw new Error('Only HTTPS redirects are permitted.');
  if (url.username || url.password) throw new Error('Credential-bearing URLs are not permitted.');
  if (host === 'localhost' || host.endsWith('.local') || isPrivateIpv4(host)) throw new Error('Private-network redirect targets are not permitted.');
  const allowed = input ? SHORT_LINK_INPUT_HOSTS : GOOGLE_REDIRECT_HOSTS;
  if (!allowed.includes(host)) throw new Error(input ? 'Only maps.app.goo.gl short links are accepted.' : 'The redirect left the approved Google Maps host set.');
  return url;
}

export function isRedirectStatus(status) { return [301,302,303,307,308].includes(Number(status)); }
