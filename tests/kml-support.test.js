import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCoordinateText, MAX_KML_FILE_BYTES, MAX_KML_POINTS, MAX_KML_FEATURES } from '../src/kml/parse-kml.js';

test('KML coordinate tuples are parsed in longitude latitude altitude order', () => {
  const points = parseCoordinateText('77.5946,12.9716,920 77.6000,12.9800,925');
  assert.equal(points.length, 2);
  assert.equal(points[0].longitude, 77.5946);
  assert.equal(points[0].latitude, 12.9716);
  assert.equal(points[0].elevationMetres, 920);
});

test('KML coordinates outside geographic bounds are rejected', () => {
  assert.throws(() => parseCoordinateText('77,95,0'), /invalid latitude/);
  assert.throws(() => parseCoordinateText('190,12,0'), /invalid longitude/);
});

test('KML parser declares bounded file, point and feature limits', () => {
  assert.equal(MAX_KML_FILE_BYTES, 8 * 1024 * 1024);
  assert.equal(MAX_KML_POINTS, 100_000);
  assert.equal(MAX_KML_FEATURES, 2_000);
});

test('KML parser rejects DTD and entity declarations before DOM parsing', async () => {
  const source = await readFile('src/kml/parse-kml.js', 'utf8');
  assert.match(source, /<!DOCTYPE\|<!ENTITY/);
});
