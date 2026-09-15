import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryEvent, deriveRouteTimeline, eventAtOrBefore, normaliseStoryEvents, playbackProgress } from '../src/domain/story-timeline.js';

test('story events validate progress, photo references and deterministic ordering', () => {
  assert.throws(() => createStoryEvent({ id: 'bad', progress: 1.1 }), /between 0 and 1/);
  assert.throws(() => createStoryEvent({ id: 'photo', kind: 'photo', progress: 0.5 }), /media reference/);
  const events = normaliseStoryEvents([
    { id: 'b', progress: 0.5, title: 'Second' },
    { id: 'a', progress: 0.5, title: 'First' },
    { id: 'start', progress: 0 }
  ]);
  assert.deepEqual(events.map((event) => event.id), ['start', 'a', 'b']);
  assert.throws(() => normaliseStoryEvents([{ id: 'same', progress: 0 }, { id: 'same', progress: 1 }]), /Duplicate/);
});

test('timeline derives temporal semantics only when the complete route is timestamped', () => {
  const timeline = deriveRouteTimeline({ points: [
    { timestamp: new Date('2026-01-01T00:00:00Z') },
    { timestamp: new Date('2026-01-01T00:01:00Z') }
  ] });
  assert.equal(timeline.mode, 'time');
  assert.equal(timeline.durationMs, 60_000);
  assert.equal(playbackProgress(timeline, 30_000), 0.5);

  const fallback = deriveRouteTimeline({ points: [{ timestamp: null }, { timestamp: null }] });
  assert.equal(fallback.mode, 'progress');
  assert.equal(playbackProgress(fallback, 15_000), 0.5);
});

test('seek resolves the last deterministic event at or before progress', () => {
  const events = [
    { id: 'finish', progress: 1 },
    { id: 'middle', progress: 0.5 },
    { id: 'start', progress: 0 }
  ];
  assert.equal(eventAtOrBefore(events, 0.75).id, 'middle');
  assert.equal(eventAtOrBefore(events, -1), null);
  assert.equal(eventAtOrBefore(events, 2).id, 'finish');
});
