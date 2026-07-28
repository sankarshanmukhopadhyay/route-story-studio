import { isShortMapLink, validateMapUrl } from '../security/safe-url.js';
export const MAX_REDIRECTS = 5;
export function describeShortLinkResolution(value) {
  const url = validateMapUrl(value);
  if (!isShortMapLink(url)) return { supported: false, reason: 'The link is already a full Google Maps URL.' };
  return { supported: true, requiresGateway: true, host: url.hostname, reason: 'Browser-only expansion depends on redirect and CORS behaviour. A constrained resolver gateway is planned for the provider integration commit.' };
}
