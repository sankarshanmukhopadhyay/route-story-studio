import { parseGpxFile, parseGpx } from './gpx/parse-gpx.js';
import { calculateStatistics, formatDistance } from './domain/route-statistics.js';
import { createPosterSvg } from './render/poster-svg.js';
import { LAYOUT_PRESETS } from './render/layout-presets.js';

const $ = (selector) => document.querySelector(selector);
const elements = { file: $('#gpx-file'), dropZone: $('#drop-zone'), status: $('#file-status'), controls: $('#story-controls'), title: $('#story-title'), subtitle: $('#story-subtitle'), lineWidth: $('#line-width'), showElevation: $('#show-elevation'), showDuration: $('#show-duration'), showMarkers: $('#show-markers'), layout: $('#layout'), units: $('#units'), routeColour: $('#route-colour'), backgroundColour: $('#background-colour'), textColour: $('#text-colour'), download: $('#download-svg'), reset: $('#reset'), sample: $('#load-sample'), preview: $('#poster-preview'), provenance: $('#route-provenance'), summary: $('#route-summary'), summaryType: $('#summary-type'), summaryPoints: $('#summary-points'), summarySegments: $('#summary-segments'), summaryDistance: $('#summary-distance'), warnings: $('#import-warnings') };
let route = null; let statistics = null; let currentSvg = '';

function renderSummary() {
  const count = route.points.length;
  elements.summary.hidden = false; elements.summaryType.textContent = route.sourceType === 'planned-route' ? 'Planned route' : 'Recorded track'; elements.summaryPoints.textContent = count.toLocaleString(); elements.summarySegments.textContent = route.segments.length.toLocaleString(); elements.summaryDistance.textContent = formatDistance(statistics.distanceMetres, elements.units.value);
  elements.warnings.innerHTML = route.provenance.warnings.map((warning) => `<li>${warning}</li>`).join(''); elements.warnings.hidden = route.provenance.warnings.length === 0;
}
function render() {
  if (!route) return;
  currentSvg = createPosterSvg({ route, statistics, title: elements.title.value.trim() || route.title, subtitle: elements.subtitle.value.trim(), lineWidth: elements.lineWidth.value, showElevation: elements.showElevation.checked, showDuration: elements.showDuration.checked, showMarkers: elements.showMarkers.checked, layout: elements.layout.value, units: elements.units.value, routeColor: elements.routeColour.value, backgroundColor: elements.backgroundColour.value, textColor: elements.textColour.value });
  elements.preview.innerHTML = currentSvg; elements.preview.style.aspectRatio = LAYOUT_PRESETS[elements.layout.value].ratio; renderSummary();
}
function applyRoute(nextRoute, label) {
  route = nextRoute; statistics = calculateStatistics(route.segments); elements.controls.disabled = false; elements.title.value = route.title || 'My route story'; elements.status.textContent = `${label}: ${route.points.length.toLocaleString()} points loaded.`; elements.provenance.textContent = route.sourceType === 'planned-route' ? 'Planned GPX route' : 'Recorded GPX track'; render();
}
async function loadFile(file) { try { elements.status.textContent = `Reading ${file.name}…`; applyRoute(await parseGpxFile(file), file.name); } catch (error) { fail(error); } }
function fail(error) { route = null; statistics = null; currentSvg = ''; elements.controls.disabled = true; elements.summary.hidden = true; elements.preview.innerHTML = '<div class="empty-state"><p>Route could not be loaded.</p><span>Review the import message and try another GPX file.</span></div>'; elements.status.textContent = error instanceof Error ? error.message : 'The route could not be loaded.'; elements.provenance.textContent = 'Import failed'; }
function reset() { route = null; statistics = null; currentSvg = ''; elements.file.value = ''; elements.controls.disabled = true; elements.summary.hidden = true; elements.status.textContent = 'No route loaded.'; elements.provenance.textContent = 'Awaiting source'; elements.preview.style.aspectRatio = '4 / 5'; elements.preview.innerHTML = '<div class="empty-state"><p>Your route poster will appear here.</p><span>Import a GPX track or use the sample route.</span></div>'; }

elements.file.addEventListener('change', () => { const [file] = elements.file.files; if (file) loadFile(file); });
elements.dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); elements.file.click(); } });
for (const name of ['dragenter','dragover']) elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.add('dragging'); });
for (const name of ['dragleave','drop']) elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.remove('dragging'); });
elements.dropZone.addEventListener('drop', (event) => { const [file] = event.dataTransfer.files; if (file) loadFile(file); });
for (const control of [elements.title,elements.subtitle,elements.lineWidth,elements.showElevation,elements.showDuration,elements.showMarkers,elements.layout,elements.units,elements.routeColour,elements.backgroundColour,elements.textColour]) control.addEventListener('input', render);
elements.sample.addEventListener('click', async () => { try { elements.status.textContent = 'Loading sample route…'; const response = await fetch('public/samples/sample-route.gpx'); if (!response.ok) throw new Error('The sample route could not be loaded.'); applyRoute(parseGpx(await response.text(), 'sample-route.gpx'), 'Sample route'); } catch (error) { fail(error); } });
elements.reset.addEventListener('click', reset);
elements.download.addEventListener('click', () => { if (!currentSvg) return; const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); const safe = (elements.title.value || 'route-story').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase(); link.href = url; link.download = `${safe || 'route-story'}-${elements.layout.value}.svg`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
