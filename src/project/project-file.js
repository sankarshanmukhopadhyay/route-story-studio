import { projectFromJson, projectToJson, MAX_PROJECT_BYTES } from './project-model.js';
import { downloadBlob, safeFileStem } from '../export/download.js';

export async function importProjectFile(file) {
  if (!(file instanceof File)) throw new TypeError('A Route Story project file is required.');
  if (file.size > MAX_PROJECT_BYTES) throw new Error('The project exceeds the 12 MB project-file safety limit.');
  if (!file.name.toLowerCase().endsWith('.rssproj')) throw new Error('Choose a .rssproj Route Story project file.');
  return projectFromJson(await file.text());
}

export function exportProjectFile(project) {
  const blob = new Blob([projectToJson(project)], { type: 'application/vnd.route-story-studio.project+json' });
  downloadBlob(blob, `${safeFileStem(project.title)}.rssproj`);
}
