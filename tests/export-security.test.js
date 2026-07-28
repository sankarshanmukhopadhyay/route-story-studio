import test from 'node:test';
import assert from 'node:assert/strict';
import { safeFileStem } from '../src/export/download.js';
import { exportDimensions, MAX_EXPORT_PIXELS } from '../src/export/export-png.js';
import { samplePoints, MAX_RENDER_POINTS } from '../src/render/poster-svg.js';
import { LAYOUT_PRESETS } from '../src/render/layout-presets.js';

test('safe filenames remove path and punctuation content', () => {
  assert.equal(safeFileStem('../../My Route: 2026?'), 'my-route-2026');
  assert.equal(safeFileStem(''), 'route-story');
});

test('PNG dimensions are deterministic and bounded', () => {
  assert.deepEqual(exportDimensions(LAYOUT_PRESETS.portrait, 2), { width: 2160, height: 2700, scale: 2 });
  assert.ok(2160 * 2700 < MAX_EXPORT_PIXELS);
});

test('route rendering samples oversized point sets', () => {
  const points = Array.from({ length: MAX_RENDER_POINTS + 500 }, (_, index) => ({ latitude: index, longitude: index }));
  const sampled = samplePoints(points, MAX_RENDER_POINTS);
  assert.equal(sampled.length, MAX_RENDER_POINTS);
  assert.equal(sampled[0], points[0]);
  assert.equal(sampled.at(-1), points.at(-1));
});
