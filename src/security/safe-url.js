export const MAX_MAP_LINK_LENGTH = 4_096;
export const ALLOWED_MAP_HOSTS = Object.freeze([
  'www.google.com',
  'google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'goo.gl',
]);

function isPrivateIpv4(hostname) {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!match) return false;
  const octets = match.slice(1).map(Number);
  if (octets.some((value) => value > 255)) return true;
  const [a, b] = octets;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function validateMapUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) throw new Error('Paste a Google Maps directions link.');
  if (raw.length > MAX_MAP_LINK_LENGTH) throw new Error('The map link exceeds the 4,096-character safety limit.');
  let url;
  try { url = new URL(raw); } catch { throw new Error('Enter a complete HTTPS Google Maps link.'); }
  if (url.protocol !== 'https:') throw new Error('Only HTTPS map links are accepted.');
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (isPrivateIpv4(hostname) || hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Private-network and local addresses are not accepted.');
  if (!ALLOWED_MAP_HOSTS.includes(hostname)) throw new Error('This map-link host is not supported.');
  if (url.username || url.password) throw new Error('Links containing embedded credentials are not accepted.');
  return url;
}

export function isShortMapLink(url) {
  return ['maps.app.goo.gl', 'goo.gl'].includes(url.hostname.toLowerCase());
}
