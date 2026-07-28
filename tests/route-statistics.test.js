import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStatistics, elevationMetricLabel, formatDistance, formatDuration, haversineDistance } from '../src/domain/route-statistics.js';

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
  assert.equal(result.minimumElevationMetres, 10);
  assert.equal(result.maximumElevationMetres, 35);
  assert.equal(result.elevationRangeMetres, 25);
  assert.equal(result.netElevationChangeMetres, 10);
  assert.ok(result.distanceMetres > 0);
});

test('formats route statistics for display', () => {
  assert.equal(formatDistance(12_450), '12.4 km');
  assert.equal(formatDuration(93_600), '1d 2h');
  assert.equal(formatDuration(null), 'Not recorded');
});

test('does not connect separate route segments when calculating distance', () => {
  const segments = [
    { points: [{ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0.01 }] },
    { points: [{ latitude: 10, longitude: 10 }, { latitude: 10, longitude: 10.01 }] }
  ];
  const result = calculateStatistics(segments);
  assert.ok(result.distanceMetres > 2_000 && result.distanceMetres < 2_300);
});

test('formats imperial route distance', () => {
  assert.equal(formatDistance(1609.344, 'imperial'), '1.0 mi');
});


test('uses simpler climb wording in the summary', () => {
  assert.equal(elevationMetricLabel({ sourceType: 'planned-route' }), 'TOTAL CLIMB');
  assert.equal(elevationMetricLabel({ sourceType: 'recorded-track' }), 'TOTAL CLIMB');
});
