export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function readValidatedImage(file) {
  if (!(file instanceof Blob)) throw new TypeError('Choose a valid image file.');
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Use a JPEG, PNG or WebP image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('The image exceeds the 5 MB safety limit.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    const pixels = image.naturalWidth * image.naturalHeight;
    if (!image.naturalWidth || !image.naturalHeight || pixels > MAX_IMAGE_PIXELS) throw new Error('The image dimensions exceed the 40 megapixel safety limit.');
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('The image could not be read.')); reader.readAsDataURL(file); });
    return { kind: 'photo', dataUrl, mimeType: file.type, width: image.naturalWidth, height: image.naturalHeight, name: String(file.name || 'background').slice(0, 160) };
  } finally { URL.revokeObjectURL(url); }
}
