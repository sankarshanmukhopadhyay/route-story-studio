import { createSvgBlob } from './export-svg.js';
import { downloadBlob, safeFileStem } from './download.js';

export const MAX_EXPORT_PIXELS = 12_000_000;

export function exportDimensions(preset, scale = 1) {
  const safeScale = scale === 2 ? 2 : 1;
  const width = Math.round(preset.width * safeScale);
  const height = Math.round(preset.height * safeScale);
  if (width * height > MAX_EXPORT_PIXELS) throw new Error('The requested image exceeds the export safety limit.');
  return { width, height, scale: safeScale };
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG generation failed.')), 'image/png');
  });
}

export async function createPngBlob(svg, preset, scale = 1) {
  const { width, height } = exportDimensions(preset, scale);
  const svgUrl = URL.createObjectURL(createSvgBlob(svg));
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('PNG rendering timed out.')), 12_000);
      image.onload = () => { window.clearTimeout(timeout); resolve(); };
      image.onerror = () => { window.clearTimeout(timeout); reject(new Error('The SVG could not be rasterised.')); };
      image.src = svgUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas export is unavailable in this browser.');
    context.drawImage(image, 0, 0, width, height);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadPng(svg, preset, scale, title, layout) {
  const blob = await createPngBlob(svg, preset, scale);
  downloadBlob(blob, `${safeFileStem(title)}-${layout}${scale === 2 ? '-2x' : ''}.png`);
}
