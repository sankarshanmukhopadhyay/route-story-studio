import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGpx } from '../src/generation/generate-gpx.js';
import { generateKml } from '../src/generation/generate-kml.js';
import { compareResolvedLocations } from '../src/generation/route-comparison.js';

const route = {
  sourceType: 'planned-route',
  title: 'Test & Route',
  segments: [{ points: [
    { latitude: 10, longitude: 20, elevationMetres: 3 },
    { latitude: 10.1, longitude: 20.1, elevationMetres: 4 }
  ] }]
};
const receipt = { receiptId: 'receipt-1' };

test('generated GPX uses planned-route semantics', () => {
  const xml = generateGpx(route, receipt);
  assert.match(xml, /<gpx[^>]+version="1.1"/);
  assert.match(xml, /<rte>/);
  assert.match(xml, /<type>reconstructed-planned-route<\/type>/);
  assert.match(xml, /receipt:receipt-1/);
  assert.doesNotMatch(xml, /<trk>/);
  assert.match(xml, /Test &amp; Route/);
});

test('dense GPX remains explicitly reconstructed', () => {
  const xml = generateGpx(route, receipt, { denseGeometry: true });
  assert.match(xml, /reconstructed-planned-route/);
  assert.match(xml, /<trk>/);
});

test('generated KML is passive planned-route geometry', () => {
  const xml = generateKml(route, receipt);
  assert.match(xml, /<kml xmlns="http:\/\/www.opengis.net\/kml\/2.2">/);
  assert.match(xml, /<LineString>/);
  assert.match(xml, /Receipt: receipt-1/);
  assert.doesNotMatch(xml, /NetworkLink|<script|<iframe/i);
  assert.match(xml, /Test &amp; Route/);
});

test('material displacement is surfaced', () => {
  const warnings = compareResolvedLocations(
    [{ coordinates: { latitude: 0, longitude: 0 } }],
    [{ coordinates: { latitude: 1, longitude: 1 } }]
  );
  assert.equal(warnings.length, 1);
});
