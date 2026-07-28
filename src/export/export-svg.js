import { downloadBlob, safeFileStem } from './download.js';

export function createSvgBlob(svg) {
  if (typeof svg !== 'string' || !svg.startsWith('<svg')) throw new Error('A valid poster SVG is required.');
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

export function downloadSvg(svg, title, layout) {
  downloadBlob(createSvgBlob(svg), `${safeFileStem(title)}-${layout}.svg`);
}
