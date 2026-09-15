import { createStoryEvent } from '../domain/story-timeline.js';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS } from './image-security.js';

export const MAX_STORY_IMAGE_EDGE = 2_048;
export const MAX_STORY_IMAGE_BYTES = 2 * 1024 * 1024;

function boundedText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function createPhotoWaypointRecord({ id, progress, caption, name = 'photo', mimeType, width, height, timestamp = null }) {
  const mediaId = boundedText(id, 120);
  const accessibleCaption = boundedText(caption, 500);
  if (!mediaId) throw new Error('Photo waypoint media ID is required.');
  if (!accessibleCaption) throw new Error('Photo waypoints require a caption or accessible description.');
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) throw new Error('Use a JPEG, PNG or WebP image.');
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS) {
    throw new Error('Photo waypoint dimensions are invalid or exceed the image safety limit.');
  }
  const media = {
    id: mediaId,
    kind: 'photo',
    name: boundedText(name, 160) || 'photo',
    mimeType,
    width,
    height,
    localOnly: true
  };
  const event = createStoryEvent({
    id: `event-${mediaId}`,
    kind: 'photo',
    progress,
    timestamp,
    title: accessibleCaption,
    body: '',
    mediaId
  });
  return { media, event };
}

function outputDimensions(width, height) {
  const scale = Math.min(1, MAX_STORY_IMAGE_EDGE / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function canvasBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The story image could not be encoded.')), mimeType, quality);
  });
}

function blobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The story image could not be read.'));
    reader.readAsDataURL(blob);
  });
}

export async function ingestPhotoWaypoint(file, { id, progress, caption, timestamp = null }) {
  if (!(file instanceof Blob)) throw new TypeError('Choose a valid image file.');
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Use a JPEG, PNG or WebP image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('The image exceeds the 5 MB safety limit.');

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
      throw new Error('The image dimensions exceed the 40 megapixel safety limit.');
    }
    const dimensions = outputDimensions(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The browser cannot prepare this story image.');
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    // Decode + canvas re-encode deliberately does not copy source EXIF/XMP/IPTC metadata.
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let encoded = await canvasBlob(canvas, outputType, 0.88);
    if (encoded.size > MAX_STORY_IMAGE_BYTES && outputType === 'image/jpeg') encoded = await canvasBlob(canvas, outputType, 0.72);
    if (encoded.size > MAX_STORY_IMAGE_BYTES) throw new Error('The prepared story image exceeds the 2 MB portability limit.');

    const record = createPhotoWaypointRecord({
      id,
      progress,
      caption,
      name: file.name || 'photo',
      mimeType: encoded.type,
      width: dimensions.width,
      height: dimensions.height,
      timestamp
    });
    return { ...record, dataUrl: await blobDataUrl(encoded) };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
