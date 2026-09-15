import { createStorySession, timelineLabel } from './story-session.js';
import { createPlaybackController } from './playback.js';
import { ingestPhotoWaypoint } from '../media/photo-waypoint.js';

function make(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name === 'className') node.className = value;
    else if (name === 'htmlFor') node.htmlFor = value;
    else node.setAttribute(name, value);
  }
  if (text) node.textContent = text;
  return node;
}

function labelled(text, control) {
  const label = make('label');
  label.append(document.createTextNode(text), control);
  return label;
}

export function createStoryUi({ onChanged, onStatus } = {}) {
  let session = null;
  let player = null;
  let route = null;
  let imagePayloads = {};
  let animationFrame = 0;
  let lastFrame = 0;

  const section = make('section', { className: 'control-group', 'aria-labelledby': 'story-timeline-title' });
  const title = make('h3', { id: 'story-timeline-title' }, 'Timeline and story');
  const timelineStatus = make('p', { id: 'story-timeline-status', className: 'status', role: 'status', 'aria-live': 'polite' }, 'Load a route to author its story.');
  const momentTitle = make('input', { id: 'story-moment-title', maxlength: '200', type: 'text', placeholder: 'Camp, summit, viewpoint…' });
  const momentBody = make('textarea', { id: 'story-moment-body', maxlength: '2000', rows: '3', placeholder: 'Optional narrative note' });
  const progress = make('input', { id: 'story-progress', type: 'range', min: '0', max: '100', value: '50' });
  const progressValue = make('output', { id: 'story-progress-value', for: 'story-progress' }, '50%');
  const addMoment = make('button', { id: 'add-story-moment', type: 'button', className: 'secondary' }, 'Add story moment');
  const photoCaption = make('input', { id: 'story-photo-caption', maxlength: '500', type: 'text', placeholder: 'Accessible photo description' });
  const photo = make('input', { id: 'story-photo', type: 'file', accept: 'image/jpeg,image/png,image/webp' });
  const addPhoto = make('button', { id: 'add-story-photo', type: 'button', className: 'secondary' }, 'Add photo waypoint');
  const clearStory = make('button', { id: 'clear-story', type: 'button', className: 'secondary danger' }, 'Clear story');
  const list = make('ol', { id: 'story-event-list', className: 'annotation-list', 'aria-label': 'Story events' });
  const seek = make('input', { id: 'story-playback-seek', type: 'range', min: '0', max: '100', value: '0', 'aria-label': 'Story playback position' });
  const playbackValue = make('output', { id: 'story-playback-value', for: 'story-playback-seek' }, '0%');
  const play = make('button', { id: 'story-play', type: 'button' }, 'Play');
  const pause = make('button', { id: 'story-pause', type: 'button', className: 'secondary' }, 'Pause');
  const restart = make('button', { id: 'story-restart', type: 'button', className: 'secondary' }, 'Restart');

  const positionLabel = make('label');
  positionLabel.append(document.createTextNode('Position along route '), progressValue, progress);
  const playbackLabel = make('label');
  playbackLabel.append(document.createTextNode('Playback '), playbackValue, seek);
  const momentActions = make('div', { className: 'annotation-actions' });
  momentActions.append(addMoment, clearStory);
  const playbackActions = make('div', { className: 'button-row three' });
  playbackActions.append(play, pause, restart);
  section.append(
    title,
    make('p', { className: 'section-intro' }, 'Add ordered narrative and photo moments. Story media remains local unless you explicitly export a portable story.'),
    timelineStatus,
    labelled('Moment title', momentTitle), labelled('Narrative', momentBody), positionLabel, momentActions,
    labelled('Photo caption / alt text', photoCaption), labelled('Local photograph', photo), addPhoto,
    list,
    playbackLabel, playbackActions
  );

  const annotationSection = document.querySelector('.annotation-controls');
  if (annotationSection) annotationSection.insertAdjacentElement('afterend', section);
  else document.querySelector('#story-controls')?.append(section);

  function announce(message) {
    timelineStatus.textContent = message;
    if (onStatus) onStatus(message);
  }
  function notify() { if (onChanged) onChanged(snapshot()); }
  function stopAnimation() { if (animationFrame) cancelAnimationFrame(animationFrame); animationFrame = 0; lastFrame = 0; }
  function renderPlayer(state = player?.state()) {
    const percent = Math.round((state?.progress || 0) * 100);
    seek.value = String(percent);
    playbackValue.textContent = `${percent}%`;
    play.disabled = !player || state?.status === 'playing';
    pause.disabled = !player || state?.status !== 'playing';
    restart.disabled = !player;
    const active = state?.activeEvent;
    if (active) timelineStatus.textContent = `${timelineLabel(session.timeline)} · ${percent}% · ${active.title || active.kind}`;
  }
  function animate(time) {
    if (!player || player.state().status !== 'playing') return;
    if (!lastFrame) lastFrame = time;
    const state = player.tick(time - lastFrame);
    lastFrame = time;
    renderPlayer(state);
    if (state.status === 'playing') animationFrame = requestAnimationFrame(animate);
    else { animationFrame = 0; lastFrame = 0; }
  }
  function render() {
    const state = snapshot();
    list.replaceChildren(...state.story.events.map((event) => {
      const item = make('li');
      const label = make('span', {}, `${Math.round(event.progress * 100)}% · ${event.kind === 'photo' ? 'Photo' : 'Moment'} · ${event.title || 'Untitled'}`);
      const remove = make('button', { type: 'button', className: 'secondary danger', 'aria-label': `Remove ${event.title || event.kind}` }, 'Remove');
      remove.addEventListener('click', () => {
        if (event.kind === 'photo') delete imagePayloads[event.mediaId];
        session.removeEvent(event.id);
        rebuildPlayer();
        render();
        notify();
      });
      item.append(label, remove);
      return item;
    }));
    timelineStatus.textContent = session ? `${timelineLabel(session.timeline)} · ${state.story.events.length} story event${state.story.events.length === 1 ? '' : 's'}` : 'Load a route to author its story.';
    renderPlayer();
  }
  function rebuildPlayer() {
    stopAnimation();
    if (!session) { player = null; return; }
    player = createPlaybackController({
      timeline: session.timeline,
      events: session.snapshot().story.events,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    });
  }
  function load({ nextRoute, project = null, payloads = {} }) {
    stopAnimation();
    route = nextRoute;
    imagePayloads = { ...payloads };
    session = createStorySession({ route, story: project?.story || { events: [] }, media: project?.media || [] });
    rebuildPlayer();
    render();
  }
  function reset() {
    stopAnimation(); route = null; session = null; player = null; imagePayloads = {}; list.replaceChildren(); timelineStatus.textContent = 'Load a route to author its story.'; renderPlayer(null);
  }
  function snapshot() {
    if (!session) return { story: { events: [] }, media: [], imagePayloads: { ...imagePayloads } };
    const state = session.snapshot();
    return { story: state.story, media: state.media, imagePayloads: { ...imagePayloads } };
  }

  progress.addEventListener('input', () => { progressValue.textContent = `${progress.value}%`; });
  addMoment.addEventListener('click', () => {
    if (!session) return announce('Load a route first.');
    const value = momentTitle.value.trim();
    if (!value) return announce('Enter a moment title first.');
    session.addMoment({ id: `moment-${crypto.randomUUID?.() || Date.now()}`, progress: Number(progress.value) / 100, title: value, body: momentBody.value.trim() });
    momentTitle.value = ''; momentBody.value = ''; rebuildPlayer(); render(); notify();
  });
  addPhoto.addEventListener('click', async () => {
    if (!session) return announce('Load a route first.');
    const [file] = photo.files;
    if (!file) return announce('Choose a photograph first.');
    try {
      addPhoto.disabled = true;
      announce('Preparing photograph locally…');
      const id = `photo-${crypto.randomUUID?.() || Date.now()}`;
      const prepared = await ingestPhotoWaypoint(file, { id, progress: Number(progress.value) / 100, caption: photoCaption.value.trim() });
      session.addPhoto(prepared);
      imagePayloads[prepared.media.id] = prepared.dataUrl;
      photo.value = ''; photoCaption.value = ''; rebuildPlayer(); render(); notify();
      announce('Photo waypoint added locally. Source metadata was not copied.');
    } catch (error) { announce(error instanceof Error ? error.message : 'The photo waypoint could not be added.'); }
    finally { addPhoto.disabled = false; }
  });
  clearStory.addEventListener('click', () => { if (!session) return; session.clear(); imagePayloads = {}; rebuildPlayer(); render(); notify(); });
  seek.addEventListener('input', () => { if (!player) return; stopAnimation(); renderPlayer(player.seek(Number(seek.value) / 100)); });
  play.addEventListener('click', () => { if (!player) return; const state = player.play(); renderPlayer(state); if (state.status === 'playing') animationFrame = requestAnimationFrame(animate); });
  pause.addEventListener('click', () => { if (!player) return; stopAnimation(); renderPlayer(player.pause()); });
  restart.addEventListener('click', () => { if (!player) return; stopAnimation(); renderPlayer(player.restart()); });

  renderPlayer(null);
  return { load, reset, snapshot, section };
}
