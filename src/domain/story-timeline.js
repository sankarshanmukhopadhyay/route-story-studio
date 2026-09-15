export const MAX_STORY_EVENTS = 500;
export const STORY_EVENT_KINDS = Object.freeze(['moment', 'photo', 'note']);

function text(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isoTimestamp(value) {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('Story event timestamp is invalid.');
  return date.toISOString();
}

export function createStoryEvent({ id, kind = 'moment', progress, timestamp = null, title = '', body = '', mediaId = null }) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Story event progress must be between 0 and 1.');
  if (!STORY_EVENT_KINDS.includes(kind)) throw new Error(`Unsupported story event kind: ${kind}.`);
  const eventId = text(id, 120);
  if (!eventId) throw new Error('Story event ID is required.');
  const event = {
    id: eventId,
    kind,
    progress,
    timestamp: isoTimestamp(timestamp),
    title: text(title, 200),
    body: text(body, 2_000),
    mediaId: mediaId ? text(mediaId, 120) : null
  };
  if (kind === 'photo' && !event.mediaId) throw new Error('Photo story events require a media reference.');
  return event;
}

export function normaliseStoryEvents(events = []) {
  if (!Array.isArray(events) || events.length > MAX_STORY_EVENTS) throw new Error('Story event collection is invalid or too large.');
  const seen = new Set();
  const normalised = events.map((event) => {
    const value = createStoryEvent(event);
    if (seen.has(value.id)) throw new Error(`Duplicate story event ID: ${value.id}.`);
    seen.add(value.id);
    return value;
  });
  return normalised.sort((a, b) => a.progress - b.progress || (a.timestamp || '').localeCompare(b.timestamp || '') || a.id.localeCompare(b.id));
}

function routePoints(route) {
  const points = Array.isArray(route?.points) ? route.points : (route?.segments || []).flatMap((segment) => segment.points || []);
  if (points.length < 2) throw new Error('A story timeline requires at least two route points.');
  return points;
}

export function deriveRouteTimeline(route) {
  const points = routePoints(route);
  const timed = points.every((point) => point.timestamp && Number.isFinite(new Date(point.timestamp).getTime()));
  const start = timed ? new Date(points[0].timestamp).getTime() : null;
  const end = timed ? new Date(points[points.length - 1].timestamp).getTime() : null;
  const temporal = timed && end >= start;
  return {
    mode: temporal ? 'time' : 'progress',
    startTime: temporal ? new Date(start).toISOString() : null,
    endTime: temporal ? new Date(end).toISOString() : null,
    durationMs: temporal ? end - start : null,
    pointCount: points.length
  };
}

export function playbackProgress(timeline, elapsedMs, durationMs = 30_000) {
  const total = timeline?.mode === 'time' && Number.isFinite(timeline.durationMs) && timeline.durationMs > 0
    ? timeline.durationMs
    : durationMs;
  if (!Number.isFinite(total) || total <= 0) throw new Error('Playback duration must be positive.');
  if (!Number.isFinite(elapsedMs)) throw new Error('Playback elapsed time must be finite.');
  return Math.max(0, Math.min(1, elapsedMs / total));
}

export function eventAtOrBefore(events, progress) {
  if (!Number.isFinite(progress)) throw new Error('Seek progress must be finite.');
  const bounded = Math.max(0, Math.min(1, progress));
  return normaliseStoryEvents(events).filter((event) => event.progress <= bounded).at(-1) || null;
}
