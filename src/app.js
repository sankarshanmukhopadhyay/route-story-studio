import { parseGpxFile } from './gpx/parse-gpx.js';
import { calculateStatistics } from './domain/route-statistics.js';
import { createPosterSvg } from './render/poster-svg.js';

const elements = {
  file: document.querySelector('#gpx-file'),
  dropZone: document.querySelector('#drop-zone'),
  status: document.querySelector('#file-status'),
  controls: document.querySelector('#story-controls'),
  title: document.querySelector('#story-title'),
  subtitle: document.querySelector('#story-subtitle'),
  lineWidth: document.querySelector('#line-width'),
  showElevation: document.querySelector('#show-elevation'),
  showDuration: document.querySelector('#show-duration'),
  download: document.querySelector('#download-svg'),
  preview: document.querySelector('#poster-preview'),
  provenance: document.querySelector('#route-provenance')
};

let route = null;
let statistics = null;
let currentSvg = '';

function render() {
  if (!route) return;
  currentSvg = createPosterSvg({
    route,
    statistics,
    title: elements.title.value.trim() || route.title,
    subtitle: elements.subtitle.value.trim(),
    lineWidth: elements.lineWidth.value,
    showElevation: elements.showElevation.checked,
    showDuration: elements.showDuration.checked
  });
  elements.preview.innerHTML = currentSvg;
}

async function loadFile(file) {
  try {
    elements.status.textContent = `Reading ${file.name}…`;
    route = await parseGpxFile(file);
    statistics = calculateStatistics(route.points);
    elements.controls.disabled = false;
    elements.title.value = route.title || 'My route story';
    elements.status.textContent = `${file.name}: ${route.points.length.toLocaleString()} points loaded.`;
    elements.provenance.textContent = 'GPX source';
    render();
  } catch (error) {
    route = null;
    statistics = null;
    elements.controls.disabled = true;
    elements.status.textContent = error instanceof Error ? error.message : 'The route could not be loaded.';
    elements.provenance.textContent = 'Import failed';
  }
}

elements.file.addEventListener('change', () => {
  const [file] = elements.file.files;
  if (file) loadFile(file);
});

for (const eventName of ['dragenter', 'dragover']) {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add('dragging');
  });
}
for (const eventName of ['dragleave', 'drop']) {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove('dragging');
  });
}
elements.dropZone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (file) loadFile(file);
});

for (const control of [elements.title, elements.subtitle, elements.lineWidth, elements.showElevation, elements.showDuration]) {
  control.addEventListener('input', render);
}

elements.download.addEventListener('click', () => {
  if (!currentSvg) return;
  const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = (elements.title.value || 'route-story').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  link.href = url;
  link.download = `${safeTitle || 'route-story'}.svg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
