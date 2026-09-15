import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorySequence } from '../src/story/story-sequence.js';

test('existing poster annotations retain their positionPercent in rich story order', () => {
  const sequence = createStorySequence({
    route: { points: [{}, {}] },
    story: { events: [
      { id: 'late', progress: 0.8, title: 'Late' },
      { id: 'early', progress: 0.2, title: 'Early' }
    ] },
    annotations: [{ id: 'poster-note', positionPercent: 50, label: 'Existing annotation' }],
    media: []
  });
  assert.deepEqual(sequence.map((item) => item.id), ['early', 'poster-note', 'late']);
  assert.equal(sequence[1].progress, 0.5);
});
