import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorySession, timelineLabel } from '../src/story/story-session.js';

const route = { points: [{ timestamp: new Date('2026-01-01T00:00:00Z') }, { timestamp: new Date('2026-01-01T00:10:00Z') }] };

test('authoring session adds and orders narrative moments', () => {
  const session = createStorySession({ route });
  session.addMoment({ id: 'later', progress: .8, title: 'Later' });
  const state = session.addMoment({ id: 'earlier', progress: .2, title: 'Earlier' });
  assert.deepEqual(state.story.events.map((event) => event.id), ['earlier', 'later']);
  assert.equal(timelineLabel(state.timeline), 'Timestamped journey · 10 minutes');
});

test('photo removal revokes unreferenced media metadata', () => {
  const session = createStorySession({ route });
  session.addPhoto({ media: { id: 'photo-1', kind: 'photo', name: 'view.jpg' }, event: { id: 'event-photo-1', kind: 'photo', progress: .5, timestamp: null, title: 'View', body: '', mediaId: 'photo-1' } });
  const state = session.removeEvent('event-photo-1');
  assert.equal(state.story.events.length, 0);
  assert.equal(state.media.length, 0);
});

test('clear removes story and media authority together', () => {
  const session = createStorySession({ route });
  session.addMoment({ id: 'one', progress: .5, title: 'One' });
  const state = session.clear();
  assert.deepEqual(state.story.events, []);
  assert.deepEqual(state.media, []);
});
