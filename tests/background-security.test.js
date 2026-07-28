import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, ALLOWED_IMAGE_TYPES } from '../src/media/image-security.js';
import { MAX_MAP_TILES, MAP_PROVIDER } from '../src/map/map-background.js';

test('photo background boundaries are explicit and conservative', () => {
  assert.equal(MAX_IMAGE_BYTES, 5 * 1024 * 1024);
  assert.equal(MAX_IMAGE_PIXELS, 40_000_000);
  assert.deepEqual([...ALLOWED_IMAGE_TYPES], ['image/jpeg','image/png','image/webp']);
});

test('map background has a bounded provider and tile budget', () => {
  assert.equal(MAX_MAP_TILES, 9);
  assert.equal(MAP_PROVIDER.host, 'https://tile.openstreetmap.org');
  assert.match(MAP_PROVIDER.attribution, /OpenStreetMap contributors/);
});
