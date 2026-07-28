import test from 'node:test';
import assert from 'node:assert/strict';
import { looksLikeBlockedTilePixels, MAP_PROVIDER, MAX_MAP_TILES, TILE_REQUEST_CONCURRENCY } from '../src/map/map-background.js';
import { readFile } from 'node:fs/promises';

test('map provider uses a Referer-compatible web policy and bounded requests', () => {
  assert.equal(MAP_PROVIDER.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(MAP_PROVIDER.host, 'https://tile.openstreetmap.org');
  assert.equal(MAX_MAP_TILES, 9);
  assert.equal(TILE_REQUEST_CONCURRENCY, 2);
});

test('blocked-tile detector recognises the grey, yellow and dark warning pattern', () => {
  const width = 64; const height = 64; const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const index = (y * width + x) * 4;
    let colour = [205, 205, 205, 255];
    if (x < 8 && y % 16 < 8) colour = [230, 210, 20, 255];
    if (x < 8 && y % 16 >= 8) colour = [25, 25, 25, 255];
    pixels.set(colour, index);
  }
  assert.equal(looksLikeBlockedTilePixels(pixels, width, height), true);
});

test('ordinary map-like pixels are not classified as a blocked notice', () => {
  const width = 64; const height = 64; const pixels = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < pixels.length; index += 4) pixels.set([175, 205, 165, 255], index);
  assert.equal(looksLikeBlockedTilePixels(pixels, width, height), false);
});

test('application declares the map-compatible referrer policy', async () => {
  const html = await readFile('index.html', 'utf8');
  assert.match(html, /(?:name="referrer"[^>]*content="strict-origin-when-cross-origin"|content="strict-origin-when-cross-origin"[^>]*name="referrer")/);
  assert.doesNotMatch(html, /name="referrer" content="no-referrer"/);
});
