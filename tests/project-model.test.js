import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, projectFromJson, projectToJson, updateProject, validateProject } from '../src/project/project-model.js';

const route = {
  schemaVersion: '1.0', id: 'route-test', title: 'Test route', sourceType: 'recorded-track',
  segments: [{ id: 'segment-1', points: [
    { latitude: 51.5, longitude: -0.1, elevationMetres: 15, timestamp: new Date('2026-01-01T00:00:00Z') },
    { latitude: 51.51, longitude: -0.11, elevationMetres: 20, timestamp: new Date('2026-01-01T00:05:00Z') }
  ] }],
  points: [], waypoints: [], source: { type: 'gpx', name: 'test.gpx', version: '1.1' },
  provenance: { geometrySource: 'recorded-track', warnings: [] }
};
route.points = route.segments[0].points;
const composition = { title: 'Test story', layout: 'portrait', units: 'metric' };

test('project JSON round trip preserves route timestamps and composition', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  const restored = projectFromJson(projectToJson(project));
  assert.equal(restored.schemaVersion, '2.0');
  assert.equal(restored.composition.layout, 'portrait');
  assert.ok(restored.route.segments[0].points[0].timestamp instanceof Date);
  assert.equal(restored.route.points.length, 2);
});

test('project update retains identity and advances composition', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  const updated = updateProject(project, { route, composition: { ...composition, layout: 'square' }, title: 'Updated' });
  assert.equal(updated.id, 'project-test');
  assert.equal(updated.title, 'Updated');
  assert.equal(updated.composition.layout, 'square');
});

test('unsupported project schema is rejected', () => {
  assert.throws(() => validateProject({ schemaVersion: '99.0' }), /not supported/);
});
