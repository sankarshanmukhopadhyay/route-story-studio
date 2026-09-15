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
  const notes = (annotations || []).map((annotation, index) => {
    const explicit = Number.isFinite(annotation.position) ? annotation.position : Number.isFinite(annotation.positionPercent) ? annotation.positionPercent / 100 : 0;
    return {
      type: 'annotation', id: annotation.id || `annotation-${index + 1}`, progress: Math.max(0, Math.min(1, explicit)),
      title: String(annotation.label || annotation.text || ''), body: '', media: null
    };
  });
  return [...moments, ...notes].sort((a, b) => a.progress - b.progress || a.id.localeCompare(b.id));
}
