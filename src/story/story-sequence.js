import { normaliseStoryEvents } from '../domain/story-timeline.js';

export function createStorySequence({ route, story = { events: [] }, annotations = [], media = [] } = {}) {
  if (!route) throw new Error('A route is required to create a story sequence.');
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const moments = normaliseStoryEvents(story.events || []).map((event) => ({
    type: event.kind,
    id: event.id,
    progress: event.progress,
    timestamp: event.timestamp,
    title: event.title,
    body: event.body,
    media: event.mediaId ? mediaById.get(event.mediaId) || null : null
  }));
  const notes = (annotations || []).map((annotation, index) => ({
    type: 'annotation', id: annotation.id || `annotation-${index + 1}`, progress: Number.isFinite(annotation.position) ? Math.max(0, Math.min(1, annotation.position)) : 0,
    title: String(annotation.label || annotation.text || ''), body: '', media: null
  }));
  return [...moments, ...notes].sort((a, b) => a.progress - b.progress || a.id.localeCompare(b.id));
}
