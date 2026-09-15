import { normaliseStoryEvents } from '../domain/story-timeline.js';

export const PROJECT_SCHEMA_VERSION = '3.0';
export const LEGACY_PROJECT_SCHEMA_VERSION = '2.0';
export const MAX_PROJECT_BYTES = 12 * 1024 * 1024;
export const MAX_PROJECT_POINTS = 100_000;
export const MAX_PROJECT_ANNOTATIONS = 500;
export const MAX_PROJECT_MEDIA = 500;

function clonePoint(point) {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    elevationMetres: Number.isFinite(point.elevationMetres) ? point.elevationMetres : null,
    timestamp: point.timestamp instanceof Date ? point.timestamp.toISOString() : point.timestamp || null
  };
}

function serialiseRoute(route) {
  const segments = route.segments.map((segment, index) => ({ id: segment.id || `segment-${index + 1}`, points: segment.points.map(clonePoint) }));
  return { ...route, segments, points: segments.flatMap((segment) => segment.points), provenance: { ...route.provenance, warnings: [...(route.provenance?.warnings || [])] } };
}

function restoreRoute(route) {
  const segments = route.segments.map((segment, index) => ({
    id: segment.id || `segment-${index + 1}`,
    points: segment.points.map((point) => ({ ...point, timestamp: point.timestamp ? new Date(point.timestamp) : null }))
  }));
  return { ...route, segments, points: segments.flatMap((segment) => segment.points) };
}

function normaliseMedia(media = []) {
  if (!Array.isArray(media) || media.length > MAX_PROJECT_MEDIA) throw new Error('The project media collection is invalid or too large.');
  const seen = new Set();
  return media.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('The project contains an invalid media record.');
    const id = String(item.id || '').trim().slice(0, 120);
    if (!id) throw new Error('Project media records require an ID.');
    if (seen.has(id)) throw new Error(`Duplicate project media ID: ${id}.`);
    seen.add(id);
    const kind = String(item.kind || 'photo');
    if (kind !== 'photo') throw new Error(`Unsupported project media kind: ${kind}.`);
    return {
      id,
      kind,
      name: String(item.name || '').trim().slice(0, 160),
      mimeType: item.mimeType ? String(item.mimeType).slice(0, 100) : null,
      width: Number.isInteger(item.width) && item.width > 0 ? item.width : null,
      height: Number.isInteger(item.height) && item.height > 0 ? item.height : null,
      localOnly: true
    };
  });
}

function normaliseStory(story = { events: [] }, media = []) {
  if (!story || typeof story !== 'object') throw new Error('The project story state is invalid.');
  const events = normaliseStoryEvents(story.events || []);
  const mediaIds = new Set(media.map((item) => item.id));
  for (const event of events) {
    if (event.kind === 'photo' && !mediaIds.has(event.mediaId)) throw new Error(`Photo story event ${event.id} references missing project media ${event.mediaId}.`);
  }
  return { events };
}

export function migrateProject(project) {
  if (!project || typeof project !== 'object') throw new Error('The project file is not valid JSON project data.');
  if (project.schemaVersion === PROJECT_SCHEMA_VERSION) return project;
  if (project.schemaVersion === LEGACY_PROJECT_SCHEMA_VERSION) {
    return {
      ...project,
      schemaVersion: PROJECT_SCHEMA_VERSION,
      media: Array.isArray(project.media) ? project.media : [],
      story: { events: [] },
      provenance: { ...project.provenance, migratedFromSchema: LEGACY_PROJECT_SCHEMA_VERSION }
    };
  }
  throw new Error(`Project schema ${project.schemaVersion || 'unknown'} is not supported.`);
}

export function createProject({ route, composition, id = `project-${crypto.randomUUID?.() || Date.now().toString(36)}`, title = route.title }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id,
    title: String(title || 'Untitled route story').slice(0, 200),
    createdAt: now,
    updatedAt: now,
    route: serialiseRoute(route),
    composition: { ...composition },
    media: [],
    story: { events: [] },
    annotations: [],
    provenance: { application: 'Route Story Studio', applicationVersion: '0.4.0-development', localFirst: true }
  };
}

export function updateProject(project, { route, composition, title = project.title, story = project.story, media = project.media }) {
  const normalisedMedia = normaliseMedia(media || []);
  const normalisedStory = normaliseStory(story || { events: [] }, normalisedMedia);
  return {
    ...project,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    title: String(title || 'Untitled route story').slice(0, 200),
    updatedAt: new Date().toISOString(),
    route: serialiseRoute(route),
    composition: { ...composition },
    media: normalisedMedia,
    story: normalisedStory
  };
}

export function validateProject(input) {
  const project = migrateProject(input);
  if (!project.id || !project.route || !project.composition) throw new Error('The project is missing required route or composition data.');
  if (!Array.isArray(project.route.segments) || project.route.segments.length > 2_000) throw new Error('The project route does not contain a valid segment collection.');
  for (const segment of project.route.segments) {
    if (!Array.isArray(segment.points)) throw new Error('A project route segment has no point collection.');
    for (const point of segment.points) {
      if (!Number.isFinite(point.latitude) || point.latitude < -90 || point.latitude > 90 || !Number.isFinite(point.longitude) || point.longitude < -180 || point.longitude > 180) throw new Error('The project contains invalid route coordinates.');
    }
  }
  const pointCount = project.route.segments.reduce((sum, segment) => sum + (Array.isArray(segment.points) ? segment.points.length : 0), 0);
  if (pointCount < 2 || pointCount > MAX_PROJECT_POINTS) throw new Error('The project route is empty or exceeds the point safety limit.');
  if (!Array.isArray(project.annotations) || project.annotations.length > MAX_PROJECT_ANNOTATIONS) throw new Error('The project annotation collection is invalid or too large.');
  const media = normaliseMedia(project.media || []);
  const story = normaliseStory(project.story || { events: [] }, media);
  return { ...project, media, story, route: restoreRoute(project.route) };
}

export function projectToJson(project) {
  const canonical = validateProject(project);
  const serialisable = { ...canonical, route: serialiseRoute(canonical.route) };
  const json = JSON.stringify(serialisable, null, 2);
  if (new Blob([json]).size > MAX_PROJECT_BYTES) throw new Error('The project exceeds the 12 MB project-file safety limit.');
  return json;
}

export function projectFromJson(json) {
  if (typeof json !== 'string') throw new TypeError('Project content must be text.');
  if (new Blob([json]).size > MAX_PROJECT_BYTES) throw new Error('The project exceeds the 12 MB project-file safety limit.');
  return validateProject(JSON.parse(json));
}
