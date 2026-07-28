import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStatistics, formatDistance, formatDuration, haversineDistance } from '../src/domain/route-statistics.js';

test('calculates a plausible distance between Kolkata and Howrah reference points', () => {
  const distance = haversineDistance(
    { latitude: 22.5726, longitude: 88.3639 },
    { latitude: 22.5958, longitude: 88.2636 }
  );
  assert.ok(distance > 10_000 && distance < 12_000);
});

test('calculates duration and elevation changes', () => {
  const points = [
    { latitude: 22.5, longitude: 88.3, elevationMetres: 10, timestamp: new Date('2026-01-01T00:00:00Z') },
    { latitude: 22.51, longitude: 88.31, elevationMetres: 35, timestamp: new Date('2026-01-01T01:30:00Z') },
    { latitude: 22.52, longitude: 88.32, elevationMetres: 20, timestamp: new Date('2026-01-01T02:00:00Z') }
  ];
  const result = calculateStatistics(points);
  assert.equal(result.durationSeconds, 7200);
  assert.equal(result.elevationGainMetres, 25);
  assert.equal(result.elevationLossMetres, 15);
  assert.ok(result.distanceMetres > 0);
});

test('formats route statistics for display', () => {
  assert.equal(formatDistance(12_450), '12.4 km');
  assert.equal(formatDuration(93_600), '1d 2h');
  assert.equal(formatDuration(null), 'Not recorded');
});
