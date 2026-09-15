import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhotoWaypointRecord, MAX_STORY_IMAGE_BYTES, MAX_STORY_IMAGE_EDGE } from '../src/media/photo-waypoint.js';

test('photo waypoint record creates linked local media and canonical event', () => {
  const { media, event } = createPhotoWaypointRecord({
    id: 'ridge-view',
    progress: 0.42,
    caption: 'View from the ridge',
    name: 'IMG_1234.JPG',
    mimeType: 'image/jpeg',
    width: 1600,
    height: 900
  });
  assert.deepEqual(media, {
    id: 'ridge-view', kind: 'photo', name: 'IMG_1234.JPG', mimeType: 'image/jpeg', width: 1600, height: 900, localOnly: true
  });
  assert.equal(event.kind, 'photo');
  assert.equal(event.mediaId, media.id);
  assert.equal(event.progress, 0.42);
  assert.equal(event.title, 'View from the ridge');
});

test('photo waypoint record fails closed on inaccessible or unsafe input', () => {
  assert.throws(() => createPhotoWaypointRecord({ id: 'photo', progress: 0.5, caption: '', mimeType: 'image/jpeg', width: 100, height: 100 }), /caption or accessible description/);
  assert.throws(() => createPhotoWaypointRecord({ id: 'photo', progress: 0.5, caption: 'Photo', mimeType: 'image/gif', width: 100, height: 100 }), /JPEG, PNG or WebP/);
  assert.throws(() => createPhotoWaypointRecord({ id: 'photo', progress: -0.1, caption: 'Photo', mimeType: 'image/jpeg', width: 100, height: 100 }), /between 0 and 1/);
  assert.throws(() => createPhotoWaypointRecord({ id: 'photo', progress: 0.5, caption: 'Photo', mimeType: 'image/jpeg', width: 100000, height: 100000 }), /safety limit/);
});

test('story image portability limits remain explicit', () => {
  assert.equal(MAX_STORY_IMAGE_EDGE, 2048);
  assert.equal(MAX_STORY_IMAGE_BYTES, 2 * 1024 * 1024);
});
