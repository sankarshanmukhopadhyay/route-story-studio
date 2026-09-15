import { eventAtOrBefore, playbackProgress } from '../domain/story-timeline.js';

export function createPlaybackController({ timeline, events = [], fallbackDurationMs = 30_000, reducedMotion = false } = {}) {
  let status = 'idle';
  let elapsedMs = 0;
  let progress = 0;
  const durationMs = timeline?.mode === 'time' && timeline.durationMs > 0 ? timeline.durationMs : fallbackDurationMs;
  if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error('Playback duration must be positive.');

  function state() {
    return { status, elapsedMs, progress, durationMs, activeEvent: eventAtOrBefore(events, progress), reducedMotion: Boolean(reducedMotion) };
  }
  function seek(nextProgress) {
    if (!Number.isFinite(nextProgress)) throw new Error('Seek progress must be finite.');
    progress = Math.max(0, Math.min(1, nextProgress));
    elapsedMs = progress * durationMs;
    if (progress >= 1) status = 'ended';
    return state();
  }
  function play() {
    if (reducedMotion) return seek(1);
    if (status === 'ended') seek(0);
    status = 'playing';
    return state();
  }
  function pause() { if (status === 'playing') status = 'paused'; return state(); }
  function restart() { status = 'idle'; return seek(0); }
  function tick(deltaMs) {
    if (status !== 'playing') return state();
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new Error('Playback delta must be a non-negative finite number.');
    elapsedMs = Math.min(durationMs, elapsedMs + deltaMs);
    progress = playbackProgress({ mode: 'progress' }, elapsedMs, durationMs);
    if (progress >= 1) status = 'ended';
    return state();
  }
  return { state, play, pause, restart, seek, tick };
}
