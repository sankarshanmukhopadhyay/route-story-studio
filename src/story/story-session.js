import { createStoryEvent, deriveRouteTimeline, normaliseStoryEvents } from '../domain/story-timeline.js';

export function createStorySession({ route, story = { events: [] }, media = [] } = {}) {
  if (!route) throw new Error('A route is required to author a story.');
  let events = normaliseStoryEvents(story.events || []);
  let mediaRecords = Array.isArray(media) ? media.map((item) => ({ ...item })) : [];
  const timeline = deriveRouteTimeline(route);

  function snapshot() { return { story: { events: events.map((event) => ({ ...event })) }, media: mediaRecords.map((item) => ({ ...item })), timeline: { ...timeline } }; }
  function addMoment({ id, progress, title, body = '', timestamp = null }) {
    events = normaliseStoryEvents([...events, createStoryEvent({ id, kind: 'moment', progress, timestamp, title, body })]);
    return snapshot();
  }
  function addPhoto({ media, event }) {
    if (!media?.id || event?.kind !== 'photo' || event.mediaId !== media.id) throw new Error('Photo waypoint media and event must be explicitly linked.');
    if (mediaRecords.some((item) => item.id === media.id)) throw new Error(`Duplicate project media ID: ${media.id}.`);
    mediaRecords = [...mediaRecords, { ...media, localOnly: true }];
    events = normaliseStoryEvents([...events, event]);
    return snapshot();
  }
  function removeEvent(id) {
    const removed = events.find((event) => event.id === id);
    events = events.filter((event) => event.id !== id);
    if (removed?.kind === 'photo' && !events.some((event) => event.mediaId === removed.mediaId)) mediaRecords = mediaRecords.filter((item) => item.id !== removed.mediaId);
    return snapshot();
  }
  function clear() { events = []; mediaRecords = []; return snapshot(); }
  return { timeline: { ...timeline }, snapshot, addMoment, addPhoto, removeEvent, clear };
}

export function timelineLabel(timeline) {
  if (timeline?.mode === 'time') {
    const minutes = Math.round((timeline.durationMs || 0) / 60_000);
    return `Timestamped journey · ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return 'Route progress · timestamps unavailable';
}
