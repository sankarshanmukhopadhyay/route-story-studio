import { isShortMapLink, validateMapUrl } from '../security/safe-url.js';
export const MAX_REDIRECTS = 5;
export const MAX_RESOLUTION_RESPONSE_BYTES = 32_768;
export const SHORT_LINK_GATEWAY_STORAGE_KEY = 'route-story-short-link-gateway';

export function describeShortLinkResolution(value) {
  const url = validateMapUrl(value);
  if (!isShortMapLink(url)) return { supported:false, reason:'The link is already a full Google Maps URL.' };
  return { supported:true, requiresGateway:true, host:url.hostname, reason:'Expansion uses a constrained resolver that follows approved Google Maps redirects only.' };
}

export function validateGatewayEndpoint(value) {
  const raw = String(value || '').trim();
  if (!raw) throw new Error('Configure the short-link resolver endpoint first.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('The resolver endpoint must use HTTPS.');
  if (url.username || url.password) throw new Error('Resolver URLs may not contain credentials.');
  return url.href;
}

export function validateResolution(value) {
  if (!value || value.status !== 'resolved') throw new Error('The resolver returned an invalid result.');
  const finalUrl = validateMapUrl(value.finalUrl);
  if (isShortMapLink(finalUrl)) throw new Error('The resolver did not reach a full Google Maps URL.');
  const redirectCount = Number(value.redirectCount);
  if (!Number.isInteger(redirectCount) || redirectCount < 0 || redirectCount > MAX_REDIRECTS) throw new Error('The resolver returned an invalid redirect count.');
  return { status:'resolved', sourceUrl:validateMapUrl(value.sourceUrl).href, finalUrl:finalUrl.href, finalHost:finalUrl.hostname, redirectCount, resolvedAt:String(value.resolvedAt || new Date().toISOString()) };
}

export async function resolveGoogleMapsShortLink(value, { endpoint, signal, fetchImpl = fetch } = {}) {
  const source = validateMapUrl(value);
  if (!isShortMapLink(source)) throw new Error('This is not a supported Google Maps short link.');
  const gateway = validateGatewayEndpoint(endpoint);
  const response = await fetchImpl(gateway, { method:'POST', credentials:'omit', referrerPolicy:'strict-origin-when-cross-origin', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ url:source.href }), signal });
  if (!response.ok) { let message=`Short-link expansion failed (${response.status}).`; try { const data=await response.json(); if(data?.error) message=data.error; } catch {} throw new Error(message); }
  const length = Number(response.headers.get('content-length') || 0);
  if (length > MAX_RESOLUTION_RESPONSE_BYTES) throw new Error('The resolver response exceeded the safety limit.');
  return validateResolution(await response.json());
}
