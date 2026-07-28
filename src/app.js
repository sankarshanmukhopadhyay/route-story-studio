import { parseMapLink } from './acquisition/parse-map-link.js';
import { readValidatedImage } from './media/image-security.js';
import { fetchMapMosaic, MAP_PROVIDER } from './map/map-background.js';
import { parseRouteFile } from './import/parse-route-file.js';
import { parseGpx } from './gpx/parse-gpx.js';
import { calculateStatistics, formatDistance } from './domain/route-statistics.js';
import { createPosterSvg } from './render/poster-svg.js';
import { LAYOUT_PRESETS } from './render/layout-presets.js';
import { downloadSvg } from './export/export-svg.js';
import { downloadPng } from './export/export-png.js';
import { downloadJpeg } from './export/export-jpeg.js';
import { createProject, updateProject, validateProject } from './project/project-model.js';
import { exportProjectFile, importProjectFile } from './project/project-file.js';
import { listProjects, loadProject, saveProject } from './storage/indexeddb.js';

const $ = (selector) => document.querySelector(selector);
const elements = {
  file: $('#route-file'), projectFile: $('#project-file'), dropZone: $('#drop-zone'), status: $('#file-status'), controls: $('#story-controls'),
  title: $('#story-title'), subtitle: $('#story-subtitle'), backgroundMode: $('#background-mode'), backgroundImage: $('#background-image'), backgroundOpacity: $('#background-opacity'), overlayOpacity: $('#overlay-opacity'), mapConsent: $('#map-consent'), mapStatus: $('#map-status'), mapHelp: $('#map-help'), lineWidth: $('#line-width'), showElevation: $('#show-elevation'), showDuration: $('#show-duration'), showMarkers: $('#show-markers'), layout: $('#layout'), units: $('#units'), routeColour: $('#route-colour'), backgroundColour: $('#background-colour'), textColour: $('#text-colour'),
  downloadSvg: $('#download-svg'), downloadPng: $('#download-png'), downloadJpeg: $('#download-jpeg'), pngScale: $('#png-scale'), reset: $('#reset'), sample: $('#load-sample'), preview: $('#poster-preview'), provenance: $('#route-provenance'), summary: $('#route-summary'), summaryType: $('#summary-type'), summaryFormat: $('#summary-format'), summaryPoints: $('#summary-points'), summarySegments: $('#summary-segments'), summaryDistance: $('#summary-distance'), warnings: $('#import-warnings'),
  mapLink: $('#map-link'), reviewMapLink: $('#review-map-link'), mapLinkStatus: $('#map-link-status'), intentReview: $('#route-intent-review'), intentSource: $('#intent-source'), intentOrigin: $('#intent-origin'), intentDestination: $('#intent-destination'), intentWaypoints: $('#intent-waypoints'), intentMode: $('#intent-mode'), intentWarnings: $('#intent-warnings'),
  annotationLabel: $('#annotation-label'), annotationPosition: $('#annotation-position'), addAnnotation: $('#add-annotation'), clearAnnotations: $('#clear-annotations'), annotationStatus: $('#annotation-status'), saveProject: $('#save-project'), openLatest: $('#open-latest-project'), exportProject: $('#export-project'), importProject: $('#import-project')
};
let route = null; let statistics = null; let currentSvg = ''; let currentProject = null; let renderFrame = 0; let operation = 0; let backgroundAsset = null; let mapConsentGranted = false; let mapLoading = false; let annotations = [];

function locationLabel(location) {
  if (!location) return 'Not recovered';
  if (location.coordinates) return `${location.coordinates.latitude.toFixed(5)}, ${location.coordinates.longitude.toFixed(5)}`;
  return location.label || location.rawValue || 'Unresolved';
}
function renderIntentWarnings(warnings) {
  elements.intentWarnings.replaceChildren(...warnings.map((warning) => {
    const item = document.createElement('li'); item.textContent = warning; return item;
  }));
  elements.intentWarnings.hidden = warnings.length === 0;
}
function reviewMapLink() {
  try {
    const intent = parseMapLink(elements.mapLink.value);
    elements.intentReview.hidden = false;
    elements.intentSource.textContent = intent.source.type === 'google-short-link' ? 'Google Maps short link' : 'Google Maps directions URL';
    elements.intentOrigin.textContent = locationLabel(intent.origin);
    elements.intentDestination.textContent = locationLabel(intent.destination);
    elements.intentWaypoints.textContent = intent.waypoints.length ? intent.waypoints.map(locationLabel).join(' → ') : 'None recovered';
    elements.intentMode.textContent = intent.travelMode || 'Not encoded';
    renderIntentWarnings(intent.warnings);
    elements.mapLinkStatus.textContent = intent.source.type === 'google-short-link'
      ? 'Short link recognised. Expansion will be added with the provider gateway increment.'
      : 'Route intent recovered locally. Review it before any future geocoding or routing.';
  } catch (error) {
    elements.intentReview.hidden = true;
    elements.mapLinkStatus.textContent = error instanceof Error ? error.message : 'The map link could not be reviewed.';
  }
}

function compositionState() {
  return { annotations: [...annotations], background: backgroundAsset ? { ...backgroundAsset, mode: elements.backgroundMode.value, opacity: Number(elements.backgroundOpacity.value), overlayOpacity: Number(elements.overlayOpacity.value) } : { mode: elements.backgroundMode.value, opacity: Number(elements.backgroundOpacity.value), overlayOpacity: Number(elements.overlayOpacity.value) }, title: elements.title.value, subtitle: elements.subtitle.value, lineWidth: elements.lineWidth.value, showElevation: elements.showElevation.checked, showDuration: elements.showDuration.checked, showMarkers: elements.showMarkers.checked, layout: elements.layout.value, units: elements.units.value, routeColour: elements.routeColour.value, backgroundColour: elements.backgroundColour.value, textColour: elements.textColour.value };
}
function applyComposition(composition = {}) {
  const values = { background: { mode: 'solid', opacity: 1, overlayOpacity: .18 }, title: route?.title || 'My route story', subtitle: '', lineWidth: '7', showElevation: true, showDuration: true, showMarkers: true, layout: 'portrait', units: 'metric', routeColour: '#f7f3e9', backgroundColour: '#0b0f0c', textColour: '#f5f1e8', ...composition };
  annotations = Array.isArray(values.annotations) ? values.annotations.slice(0, 500) : []; elements.annotationStatus.textContent = annotations.length ? `${annotations.length} annotation${annotations.length===1?'':'s'} added.` : 'No annotations added.'; backgroundAsset = values.background?.dataUrl ? { ...values.background } : null; elements.backgroundMode.value = values.background?.mode || 'solid'; elements.backgroundOpacity.value = values.background?.opacity ?? 1; elements.overlayOpacity.value = values.background?.overlayOpacity ?? .18; updateBackgroundControls(); elements.title.value = values.title; elements.subtitle.value = values.subtitle; elements.lineWidth.value = values.lineWidth; elements.showElevation.checked = values.showElevation; elements.showDuration.checked = values.showDuration; elements.showMarkers.checked = values.showMarkers; elements.layout.value = values.layout; elements.units.value = values.units; elements.routeColour.value = values.routeColour; elements.backgroundColour.value = values.backgroundColour; elements.textColour.value = values.textColour;
}
function renderWarnings(warnings) {
  elements.warnings.replaceChildren(...warnings.map((warning) => { const item = document.createElement('li'); item.textContent = warning; return item; }));
  elements.warnings.hidden = warnings.length === 0;
}
function renderSummary() {
  elements.summary.hidden = false; elements.summaryType.textContent = route.sourceType === 'planned-route' ? 'Planned route' : 'Recorded track'; elements.summaryFormat.textContent = String(route.source?.type || 'route').toUpperCase(); elements.summaryPoints.textContent = route.points.length.toLocaleString(); elements.summarySegments.textContent = route.segments.length.toLocaleString(); elements.summaryDistance.textContent = formatDistance(statistics.distanceMetres, elements.units.value); renderWarnings(route.provenance.warnings);
}
function renderNow() {
  renderFrame = 0; if (!route) return;
  currentSvg = createPosterSvg({ route, statistics, title: elements.title.value.trim() || route.title, subtitle: elements.subtitle.value.trim(), lineWidth: elements.lineWidth.value, showElevation: elements.showElevation.checked, showDuration: elements.showDuration.checked, showMarkers: elements.showMarkers.checked, layout: elements.layout.value, units: elements.units.value, routeColor: elements.routeColour.value, backgroundColor: elements.backgroundColour.value, background: backgroundAsset ? { ...backgroundAsset, mode: elements.backgroundMode.value, opacity: Number(elements.backgroundOpacity.value), overlayOpacity: Number(elements.overlayOpacity.value) } : { mode: elements.backgroundMode.value }, textColor: elements.textColour.value, annotations });
  elements.preview.replaceChildren(); elements.preview.insertAdjacentHTML('afterbegin', currentSvg); elements.preview.style.aspectRatio = LAYOUT_PRESETS[elements.layout.value].ratio; renderSummary();
}
function updateExportAvailability(){const blocked=elements.backgroundMode.value==='map' && (!backgroundAsset || backgroundAsset.mode!=='map' || mapLoading); elements.downloadSvg.disabled=blocked; elements.downloadPng.disabled=blocked; elements.downloadJpeg.disabled=blocked;}
function updateBackgroundControls() { const mode = elements.backgroundMode.value; document.querySelector('#photo-controls').hidden = mode !== 'photo'; const panel=document.querySelector('#map-controls'); panel.hidden = mode !== 'map'; if(mode==='map' && (!backgroundAsset || backgroundAsset.mode!=='map')){ panel.classList.add('attention'); panel.scrollIntoView({behavior:'smooth',block:'center'}); elements.mapConsent.focus({preventScroll:true}); elements.mapStatus.textContent='Map selected, but not loaded. Press “Consent and load map now” before export.'; elements.mapHelp.hidden=true;} updateExportAvailability(); }
async function handlePhoto(file) { try { elements.status.textContent = 'Validating photograph locally…'; backgroundAsset = await readValidatedImage(file); elements.backgroundMode.value = 'photo'; updateBackgroundControls(); elements.status.textContent = 'Photograph added locally.'; scheduleRender(); } catch (error) { elements.status.textContent = error instanceof Error ? error.message : 'The photograph could not be loaded.'; } }
async function handleMapConsent() { if (!route) return; try { mapLoading=true; updateExportAvailability(); mapConsentGranted = true; elements.mapConsent.disabled = true; elements.mapHelp.hidden=true; elements.mapStatus.textContent = `Loading up to 9 tiles from ${MAP_PROVIDER.name}…`; backgroundAsset = await fetchMapMosaic(route); elements.backgroundMode.value = 'map'; elements.mapStatus.textContent = `${MAP_PROVIDER.attribution}. Map imagery cached in this project session.`; elements.status.textContent = 'Map background loaded and aligned to the route.'; document.querySelector('#map-controls').classList.remove('attention'); scheduleRender(); } catch (error) { mapConsentGranted = false; backgroundAsset = null; elements.mapConsent.disabled = false; elements.mapStatus.textContent = error instanceof Error ? error.message : 'Map tiles could not be loaded.'; elements.status.textContent = 'Map background unavailable. No blocked tile was added to the poster.'; elements.mapHelp.hidden=false; scheduleRender(); } finally { mapLoading=false; updateExportAvailability(); } }
function scheduleRender() { if (!renderFrame) renderFrame = window.requestAnimationFrame(renderNow); }
function sourceLabel(nextRoute) { return `${String(nextRoute.source?.type || 'route').toUpperCase()} ${nextRoute.sourceType === 'planned-route' ? 'planned route' : 'recorded track'}`; }
function applyRoute(nextRoute, label, composition = null, project = null) {
  route = nextRoute; statistics = calculateStatistics(route.segments); currentProject = project; elements.controls.disabled = false; applyComposition(composition || { title: route.title || 'My route story' }); elements.status.textContent = `${label}: ${route.points.length.toLocaleString()} points loaded.`; elements.provenance.textContent = sourceLabel(route); scheduleRender();
}
async function loadFile(file) { const token = ++operation; try { elements.status.textContent = `Reading ${file.name}…`; const parsed = await parseRouteFile(file); if (token === operation) applyRoute(parsed, file.name); } catch (error) { if (token === operation) fail(error); } }
function fail(error) { route = null; statistics = null; currentSvg = ''; currentProject = null; elements.controls.disabled = true; elements.summary.hidden = true; elements.preview.innerHTML = '<div class="empty-state"><p>Route could not be loaded.</p><span>Review the import message and try another GPX, KML or project file.</span></div>'; elements.status.textContent = error instanceof Error ? error.message : 'The route could not be loaded.'; elements.provenance.textContent = 'Import failed'; }
function reset() { operation += 1; backgroundAsset = null; annotations=[]; elements.annotationStatus.textContent='No annotations added.'; mapConsentGranted = false; route = null; statistics = null; currentSvg = ''; currentProject = null; elements.file.value = ''; elements.projectFile.value = ''; elements.controls.disabled = true; elements.summary.hidden = true; elements.status.textContent = 'No route loaded.'; elements.provenance.textContent = 'Awaiting source'; elements.preview.style.aspectRatio = '4 / 5'; elements.preview.innerHTML = '<div class="empty-state"><p>Your route poster will appear here.</p><span>Import GPX or KML, open a project, or use the sample route.</span></div>'; }
async function handleJpegExport(){if(!currentSvg)return;elements.downloadJpeg.disabled=true;elements.status.textContent='Rendering JPEG locally…';try{await downloadJpeg(currentSvg,LAYOUT_PRESETS[elements.layout.value],Number(elements.pngScale.value),elements.title.value,elements.layout.value);elements.status.textContent='JPEG download prepared locally.';}catch(error){elements.status.textContent=error instanceof Error?error.message:'JPEG export failed.';}finally{updateExportAvailability();}}
async function handlePngExport() { if (!currentSvg) return; elements.downloadPng.disabled = true; elements.status.textContent = 'Rendering PNG locally…'; try { const scale = Number(elements.pngScale.value); await downloadPng(currentSvg, LAYOUT_PRESETS[elements.layout.value], scale, elements.title.value, elements.layout.value); elements.status.textContent = 'PNG download prepared locally.'; } catch (error) { elements.status.textContent = error instanceof Error ? error.message : 'PNG export failed.'; } finally { elements.downloadPng.disabled = false; } }
function currentProjectSnapshot() { if (!route) throw new Error('Import a route before saving a project.'); return currentProject ? updateProject(currentProject, { route, composition: compositionState(), title: elements.title.value }) : createProject({ route, composition: compositionState(), title: elements.title.value }); }
async function handleSaveProject() { try { currentProject = currentProjectSnapshot(); await saveProject(currentProject); elements.status.textContent = `Project “${currentProject.title}” saved in this browser.`; } catch (error) { elements.status.textContent = error instanceof Error ? error.message : 'The project could not be saved.'; } }
async function handleOpenLatestProject() { try { const [summary] = await listProjects(); if (!summary) throw new Error('No locally saved projects were found in this browser.'); const project = validateProject(await loadProject(summary.id)); applyRoute(project.route, `Project ${project.title}`, project.composition, project); } catch (error) { elements.status.textContent = error instanceof Error ? error.message : 'The project could not be opened.'; } }
function handleExportProject() { try { currentProject = currentProjectSnapshot(); exportProjectFile(currentProject); elements.status.textContent = 'Portable .rssproj file prepared locally.'; } catch (error) { elements.status.textContent = error instanceof Error ? error.message : 'The project could not be exported.'; } }
async function handleImportProject(file) { const token = ++operation; try { elements.status.textContent = `Opening ${file.name}…`; const project = await importProjectFile(file); if (token === operation) applyRoute(project.route, `Project ${project.title}`, project.composition, project); } catch (error) { if (token === operation) fail(error); } }

elements.reviewMapLink.addEventListener('click', reviewMapLink);
elements.mapLink.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); reviewMapLink(); } });

elements.file.addEventListener('change', () => { const [file] = elements.file.files; if (file) loadFile(file); });
elements.projectFile.addEventListener('change', () => { const [file] = elements.projectFile.files; if (file) handleImportProject(file); });
elements.dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); elements.file.click(); } });
for (const name of ['dragenter','dragover']) elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.add('dragging'); });
for (const name of ['dragleave','drop']) elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.remove('dragging'); });
elements.dropZone.addEventListener('drop', (event) => { const [file] = event.dataTransfer.files; if (file?.name.toLowerCase().endsWith('.rssproj')) handleImportProject(file); else if (file) loadFile(file); });
for (const control of [elements.title,elements.backgroundMode,elements.backgroundOpacity,elements.overlayOpacity,elements.subtitle,elements.lineWidth,elements.showElevation,elements.showDuration,elements.showMarkers,elements.layout,elements.units,elements.routeColour,elements.backgroundColour,elements.textColour]) control.addEventListener('input', scheduleRender);
elements.sample.addEventListener('click', async () => { const token = ++operation; try { elements.status.textContent = 'Loading sample route…'; const response = await fetch('public/samples/sample-route.gpx', { cache: 'no-store' }); if (!response.ok) throw new Error('The sample route could not be loaded.'); const text = await response.text(); if (token === operation) applyRoute(parseGpx(text, 'sample-route.gpx'), 'Sample route'); } catch (error) { if (token === operation) fail(error); } });
elements.reset.addEventListener('click', reset);
elements.downloadSvg.addEventListener('click', () => { if (currentSvg) downloadSvg(currentSvg, elements.title.value, elements.layout.value); });
elements.downloadPng.addEventListener('click', handlePngExport);
elements.downloadJpeg.addEventListener('click', handleJpegExport);
elements.addAnnotation.addEventListener('click',()=>{const label=elements.annotationLabel.value.trim();if(!label){elements.annotationStatus.textContent='Enter a label first.';return;}annotations.push({id:`annotation-${Date.now()}`,label,positionPercent:Number(elements.annotationPosition.value)});elements.annotationLabel.value='';elements.annotationStatus.textContent=`${annotations.length} annotation${annotations.length===1?'':'s'} added.`;scheduleRender();});
elements.clearAnnotations.addEventListener('click',()=>{annotations=[];elements.annotationStatus.textContent='No annotations added.';scheduleRender();});
elements.saveProject.addEventListener('click', handleSaveProject);
elements.openLatest.addEventListener('click', handleOpenLatestProject);
elements.exportProject.addEventListener('click', handleExportProject);
elements.importProject.addEventListener('click', () => elements.projectFile.click());

elements.backgroundMode.addEventListener('change', () => { if(elements.backgroundMode.value==='map' && backgroundAsset?.mode!=='map') backgroundAsset=null; updateBackgroundControls(); if (elements.backgroundMode.value === 'solid') backgroundAsset = null; scheduleRender(); });
elements.backgroundImage.addEventListener('change', () => { const [file] = elements.backgroundImage.files; if (file) handlePhoto(file); });
elements.mapConsent.addEventListener('click', handleMapConsent);
updateBackgroundControls();
