import { createStorySequence } from '../story/story-sequence.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function createStoryHtml(project, { imagePayloads = {} } = {}) {
  const sequence = createStorySequence(project);
  const title = escapeHtml(project.title || project.route?.title || 'Route story');
  const items = sequence.map((item) => {
    const media = item.media && imagePayloads[item.media.id] ? `<img src="${escapeHtml(imagePayloads[item.media.id])}" alt="${escapeHtml(item.title)}" loading="lazy">` : '';
    return `<article data-progress="${item.progress}">${media}<h2>${escapeHtml(item.title)}</h2>${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}<p><small>${Math.round(item.progress * 100)}% of route${item.timestamp ? ` · ${escapeHtml(item.timestamp)}` : ''}</small></p></article>`;
  }).join('');
  const provenance = escapeHtml(`${project.provenance?.application || 'Route Story Studio'} · local-first portable story`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${title}</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:52rem;margin:auto;padding:2rem}article{border-block-start:1px solid #aaa;padding-block:1.5rem}img{display:block;max-width:100%;height:auto;margin-block-end:1rem}footer{margin-block-start:3rem}</style></head><body><main><h1>${title}</h1>${items || '<p>No story moments have been added.</p>'}</main><footer><small>${provenance}</small></footer></body></html>`;
}

export function downloadStoryHtml(project, options = {}) {
  const html = createStoryHtml(project, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(project.title || 'route-story').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'route-story'}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
