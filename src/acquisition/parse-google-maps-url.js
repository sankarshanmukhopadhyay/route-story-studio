import { createRouteIntent, parseLocation } from './route-intent.js';
import { isShortMapLink, validateMapUrl } from '../security/safe-url.js';

const KNOWN_QUERY_PARAMS = new Set(['api','origin','destination','waypoints','travelmode','dir_action','entry','g_ep','hl','authuser']);

function decodePathToken(value) { return decodeURIComponent(String(value || '').replace(/\+/g, ' ')).trim(); }
function parseDirectionsPath(url) {
  const marker = '/maps/dir/';
  const index = url.pathname.indexOf(marker);
  if (index < 0) return [];
  return url.pathname.slice(index + marker.length).split('/').map(decodePathToken).filter(Boolean).filter((token) => !token.startsWith('@'));
}
function parseWaypointQuery(value) { return value ? String(value).split('|').map(parseLocation).filter(Boolean) : []; }

export function parseGoogleMapsUrl(value) {
  const url = validateMapUrl(value);
  if (isShortMapLink(url)) {
    return createRouteIntent({ source: { type: 'google-short-link', originalUrl: url.href }, warnings: ['This short link must be expanded before route locations can be reviewed.'] });
  }
  const warnings = [];
  const unresolvedParameters = [...url.searchParams.keys()].filter((name) => !KNOWN_QUERY_PARAMS.has(name));
  let origin = parseLocation(url.searchParams.get('origin'));
  let destination = parseLocation(url.searchParams.get('destination'));
  let waypoints = parseWaypointQuery(url.searchParams.get('waypoints'));
  const pathLocations = parseDirectionsPath(url);
  if (!origin && pathLocations.length >= 1) origin = parseLocation(pathLocations[0]);
  if (!destination && pathLocations.length >= 2) destination = parseLocation(pathLocations.at(-1));
  if (!waypoints.length && pathLocations.length > 2) waypoints = pathLocations.slice(1, -1).map(parseLocation).filter(Boolean);
  if (!origin || !destination) warnings.push('The link does not expose both an origin and destination in a supported form.');
  if (unresolvedParameters.length) warnings.push('Some URL parameters are retained as unsupported metadata and will not influence routing.');
  return createRouteIntent({ source: { type: 'google-maps-url', originalUrl: url.href }, origin, destination, waypoints, travelMode: url.searchParams.get('travelmode'), warnings, unresolvedParameters });
}
