import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const parserSource = await readFile('src/gpx/parse-gpx.js', 'utf8');

test('parser rejects XML entity declarations before DOM parsing', () => {
  assert.match(parserSource, /<!DOCTYPE\|<!ENTITY/);
});

test('parser defines bounded file, point and segment limits', () => {
  assert.match(parserSource, /MAX_FILE_BYTES = 8 \* 1024 \* 1024/);
  assert.match(parserSource, /MAX_POINTS = 100_000/);
  assert.match(parserSource, /MAX_SEGMENTS = 2_000/);
});
