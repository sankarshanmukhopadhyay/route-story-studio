import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGoogleMapsUrl } from '../src/acquisition/parse-google-maps-url.js';
import { validateMapUrl } from '../src/security/safe-url.js';

test('parses official Google Maps directions query parameters', () => {
  const intent = parseGoogleMapsUrl('https://www.google.com/maps/dir/?api=1&origin=28.6139,77.2090&destination=Manali%2C%20India&waypoints=Karnal%2C%20India%7CChandigarh%2C%20India&travelmode=driving');
  assert.equal(intent.origin.resolutionStatus, 'coordinates');
  assert.equal(intent.destination.rawValue, 'Manali, India');
  assert.equal(intent.waypoints.length, 2);
  assert.equal(intent.travelMode, 'driving');
});
test('parses path-based Google Maps directions links', () => {
  const intent = parseGoogleMapsUrl('https://www.google.com/maps/dir/Delhi/Chandigarh/Manali/');
  assert.equal(intent.origin.rawValue, 'Delhi');
  assert.equal(intent.destination.rawValue, 'Manali');
  assert.equal(intent.waypoints[0].rawValue, 'Chandigarh');
});
test('classifies short links without expanding them', () => {
  const intent = parseGoogleMapsUrl('https://maps.app.goo.gl/AbCdEf123');
  assert.equal(intent.source.type, 'google-short-link');
  assert.match(intent.warnings[0], /expanded/);
});
test('rejects non-HTTPS and unapproved hosts', () => {
  assert.throws(() => validateMapUrl('http://www.google.com/maps/dir/A/B'), /HTTPS/);
  assert.throws(() => validateMapUrl('https://example.com/maps/dir/A/B'), /not supported/);
});
test('rejects invalid coordinates', () => {
  assert.throws(() => parseGoogleMapsUrl('https://www.google.com/maps/dir/?api=1&origin=95,77&destination=20,80'), /Invalid route coordinate/);
});
