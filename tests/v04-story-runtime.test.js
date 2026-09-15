import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackController } from '../src/story/playback.js';
import { createStorySequence } from '../src/story/story-sequence.js';
import { createStoryHtml } from '../src/export/export-story-html.js';

const events = [{ id: 'start', kind: 'moment', progress: 0, timestamp: null, title: 'Start', body: '', mediaId: null }, { id: 'end', kind: 'moment', progress: 1, timestamp: null, title: 'End', body: '', mediaId: null }];

test('playback supports play pause seek restart and deterministic completion', () => {
  const player = createPlaybackController({ timeline: { mode: 'progress' }, events, fallbackDurationMs: 1000 });
  assert.equal(player.play().status, 'playing');
  assert.equal(player.tick(500).progress, .5);
  assert.equal(player.pause().status, 'paused');
  assert.equal(player.seek(.75).progress, .75);
  assert.equal(player.play().status, 'playing');
  assert.equal(player.tick(250).status, 'ended');
  assert.equal(player.restart().progress, 0);
});

test('reduced motion completes without animation', () => {
  const player = createPlaybackController({ timeline: { mode: 'progress' }, events, reducedMotion: true });
  const state = player.play();
  assert.equal(state.status, 'ended');
  assert.equal(state.progress, 1);
});

test('rich sequence composes story events and annotations in route order', () => {
  const sequence = createStorySequence({ route: { points: [{}, {}] }, story: { events: [{ id: 'later', progress: .8 }, { id: 'earlier', progress: .2 }] }, annotations: [{ id: 'note', position: .5, label: 'Halfway' }] });
  assert.deepEqual(sequence.map((item) => item.id), ['earlier', 'note', 'later']);
});

test('portable story HTML is escaped and network-free', () => {
  const html = createStoryHtml({ title: '<Trip>', route: { points: [{}, {}] }, story: { events: [{ id: 'x', progress: .5, title: '<script>alert(1)</script>', body: 'A & B' }] }, annotations: [], media: [], provenance: { application: 'Route Story Studio' } });
  assert.match(html, /&lt;Trip&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /A &amp; B/);
  assert.match(html, /default-src 'none'/);
  assert.doesNotMatch(html, /https?:\/\//);
});
