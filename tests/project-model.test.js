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

test('project JSON round trip preserves route timestamps, composition and canonical story state', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  assert.equal(project.schemaVersion, '3.0');
  assert.deepEqual(project.story, { events: [] });
  const withStory = updateProject(project, {
    route,
    composition,
    media: [{ id: 'photo-1', kind: 'photo', name: 'View.jpg', mimeType: 'image/jpeg', width: 1200, height: 800 }],
    story: { events: [
      { id: 'later', progress: 0.75, title: 'Later' },
      { id: 'photo-stop', kind: 'photo', progress: 0.25, mediaId: 'photo-1', title: 'View' }
    ] }
  });
  const restored = projectFromJson(projectToJson(withStory));
  assert.equal(restored.schemaVersion, '3.0');
  assert.equal(restored.composition.layout, 'portrait');
  assert.ok(restored.route.segments[0].points[0].timestamp instanceof Date);
  assert.equal(restored.route.points.length, 2);
  assert.deepEqual(restored.story.events.map((event) => event.id), ['photo-stop', 'later']);
  assert.equal(restored.media[0].localOnly, true);
});

test('project update retains identity and advances composition', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  const updated = updateProject(project, { route, composition: { ...composition, layout: 'square' }, title: 'Updated' });
  assert.equal(updated.id, 'project-test');
  assert.equal(updated.title, 'Updated');
  assert.equal(updated.composition.layout, 'square');
  assert.deepEqual(updated.story, { events: [] });
});

test('schema 2.0 projects migrate without losing existing state', () => {
  const current = createProject({ route, composition, id: 'legacy-project' });
  const legacy = { ...current, schemaVersion: '2.0', annotations: [{ id: 'note-1', text: 'Keep me' }] };
  delete legacy.story;
  const restored = projectFromJson(JSON.stringify(legacy));
  assert.equal(restored.schemaVersion, '3.0');
  assert.deepEqual(restored.story, { events: [] });
  assert.equal(restored.annotations[0].text, 'Keep me');
  assert.equal(restored.composition.layout, 'portrait');
  assert.ok(restored.route.segments[0].points[0].timestamp instanceof Date);
  assert.equal(restored.provenance.migratedFromSchema, '2.0');
});

test('story persistence rejects dangling media references and duplicate identifiers', () => {
  const project = createProject({ route, composition, id: 'project-test' });
  assert.throws(() => updateProject(project, {
    route, composition, story: { events: [{ id: 'photo-stop', kind: 'photo', progress: 0.5, mediaId: 'missing' }] }
  }), /missing project media/);
  assert.throws(() => updateProject(project, {
    route, composition, story: { events: [{ id: 'same', progress: 0 }, { id: 'same', progress: 1 }] }
  }), /Duplicate story event ID/);
  assert.throws(() => updateProject(project, {
    route, composition, media: [{ id: 'same' }, { id: 'same' }]
  }), /Duplicate project media ID/);
});

test('unsupported project schema is rejected', () => {
  assert.throws(() => validateProject({ schemaVersion: '99.0' }), /not supported/);
});
