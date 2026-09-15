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
const story = { events: [
  { id: 'finish', kind: 'note', progress: 1, title: 'Finish', body: 'Done' },
  { id: 'photo-1', kind: 'photo', progress: 0.5, title: 'View', mediaId: 'local-photo-1' }
] };

test('project JSON round trip preserves route timestamps, composition and story semantics', () => {
  const project = createProject({ route, composition, story, id: 'project-test' });
  const restored = projectFromJson(projectToJson(project));
  assert.equal(restored.schemaVersion, '2.1');
  assert.equal(restored.composition.layout, 'portrait');
  assert.ok(restored.route.segments[0].points[0].timestamp instanceof Date);
  assert.equal(restored.route.points.length, 2);
  assert.deepEqual(restored.story.events.map(({ id, mediaId }) => ({ id, mediaId })), [
    { id: 'photo-1', mediaId: 'local-photo-1' },
    { id: 'finish', mediaId: null }
  ]);
  assert.equal(projectToJson(project).includes('data:image/'), false);
});

test('project update retains identity and advances composition and story', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  const updated = updateProject(project, { route, composition: { ...composition, layout: 'square' }, story, title: 'Updated' });
  assert.equal(updated.id, 'project-test');
  assert.equal(updated.title, 'Updated');
  assert.equal(updated.composition.layout, 'square');
  assert.equal(updated.story.events.length, 2);
});

test('legacy 2.0 projects migrate to an explicit empty story without changing route data', () => {
  const legacy = createProject({ route, composition, id: 'legacy' });
  legacy.schemaVersion = '2.0';
  delete legacy.story;
  const restored = validateProject(legacy);
  assert.equal(restored.schemaVersion, '2.1');
  assert.deepEqual(restored.story, { events: [] });
  assert.equal(restored.route.points.length, 2);
});

test('invalid persisted story state fails closed', () => {
  const project = createProject({ route, composition, id: 'invalid-story' });
  project.story = { events: [
    { id: 'duplicate', kind: 'note', progress: 0.25 },
    { id: 'duplicate', kind: 'note', progress: 0.75 }
  ] };
  assert.throws(() => validateProject(project), /Duplicate story event ID/);

  project.story = { events: [{ id: 'photo', kind: 'photo', progress: 0.5 }] };
  assert.throws(() => validateProject(project), /require a media reference/);
});

test('unsupported project schema is rejected', () => {
  assert.throws(() => validateProject({ schemaVersion: '99.0' }), /not supported/);
});
