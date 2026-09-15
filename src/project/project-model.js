import { normaliseStoryEvents } from '../domain/story-timeline.js';

export const PROJECT_SCHEMA_VERSION = '2.1';
export const LEGACY_PROJECT_SCHEMA_VERSION = '2.0';
export const MAX_PROJECT_BYTES = 12 * 1024 * 1024;
export const MAX_PROJECT_POINTS = 100_000;
export const MAX_PROJECT_ANNOTATIONS = 500;

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

function normaliseStory(story) {
  if (story === undefined || story === null) return { events: [] };
  if (!story || typeof story !== 'object' || Array.isArray(story)) throw new Error('The project story state is invalid.');
  return { events: normaliseStoryEvents(story.events ?? []) };
}

function migrateProject(project) {
  if (project.schemaVersion === LEGACY_PROJECT_SCHEMA_VERSION) {
    return { ...project, schemaVersion: PROJECT_SCHEMA_VERSION, story: { events: [] } };
  }
  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION) throw new Error(`Project schema ${project.schemaVersion || 'unknown'} is not supported.`);
  return project;
}

export function createProject({ route, composition, story = { events: [] }, id = `project-${crypto.randomUUID?.() || Date.now().toString(36)}`, title = route.title }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id,
    title: String(title || 'Untitled route story').slice(0, 200),
    createdAt: now,
    updatedAt: now,
    route: serialiseRoute(route),
    composition: { ...composition },
    story: normaliseStory(story),
    media: [],
    annotations: [],
    provenance: { application: 'Route Story Studio', applicationVersion: '0.4.0-development', localFirst: true }
  };
}

export function updateProject(project, { route, composition, story = project.story, title = project.title }) {
  return { ...project, schemaVersion: PROJECT_SCHEMA_VERSION, title: String(title || 'Untitled route story').slice(0, 200), updatedAt: new Date().toISOString(), route: serialiseRoute(route), composition: { ...composition }, story: normaliseStory(story) };
}

export function validateProject(input) {
  if (!input || typeof input !== 'object') throw new Error('The project file is not valid JSON project data.');
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
  if (!Array.isArray(project.media)) throw new Error('The project media collection is invalid.');
  const story = normaliseStory(project.story);
  return { ...project, story, route: restoreRoute(project.route) };
}

export function projectToJson(project) {
  const validated = validateProject(project);
  const json = JSON.stringify({ ...validated, route: serialiseRoute(validated.route) }, null, 2);
  if (new Blob([json]).size > MAX_PROJECT_BYTES) throw new Error('The project exceeds the 12 MB project-file safety limit.');
  return json;
}

export function projectFromJson(json) {
  if (typeof json !== 'string') throw new TypeError('Project content must be text.');
  if (new Blob([json]).size > MAX_PROJECT_BYTES) throw new Error('The project exceeds the 12 MB project-file safety limit.');
  return validateProject(JSON.parse(json));
}
