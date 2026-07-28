const SESSION_KEY = 'route-story-studio.provider.openrouteservice';
const LOCAL_KEY = 'route-story-studio.provider.openrouteservice.remembered';
const SECRET_KEY = 'route-story-studio.provider.secret';
const ENC_VERSION = 1;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function storageAvailable(storage) {
  try { const key = '__rss_storage_test__'; storage.setItem(key, '1'); storage.removeItem(key); return true; } catch { return false; }
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBase64(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

function getOrCreateClientSecret() {
  if (!storageAvailable(localStorage)) return randomBase64(32);
  const existing = localStorage.getItem(SECRET_KEY);
  if (existing) return existing;
  const created = randomBase64(32);
  localStorage.setItem(SECRET_KEY, created);
  return created;
}

async function deriveAesKey(secret) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: textEncoder.encode('route-story-studio.provider-settings'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptApiKey(plainText) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(getOrCreateClientSecret());
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(plainText));
  return {
    v: ENC_VERSION,
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(cipherBuffer))
  };
}

async function decryptApiKey(payload) {
  if (!payload || payload.v !== ENC_VERSION || !payload.iv || !payload.data) return '';
  const key = await deriveAesKey(getOrCreateClientSecret());
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data)
  );
  return textDecoder.decode(plainBuffer);
}

export async function loadProviderSettings() {
  const session = storageAvailable(sessionStorage) ? sessionStorage.getItem(SESSION_KEY) : null;
  const remembered = storageAvailable(localStorage) ? localStorage.getItem(LOCAL_KEY) : null;

  const defaultSettings = { providerId: 'openrouteservice', apiKey: '', remember: false };
  if (!session && !remembered) return defaultSettings;

  try {
    const sessionParsed = session ? JSON.parse(session) : null;
    const rememberedParsed = remembered ? JSON.parse(remembered) : null;
    const providerId = String((sessionParsed && sessionParsed.providerId) || (rememberedParsed && rememberedParsed.providerId) || 'openrouteservice');
    const parsedApiKey = sessionParsed && sessionParsed.encryptedApiKey
      ? await decryptApiKey(sessionParsed.encryptedApiKey)
      : String((sessionParsed && sessionParsed.apiKey) || '');
    return { providerId, apiKey: parsedApiKey, remember: Boolean(remembered) };
  } catch {
    return defaultSettings;
  }
}

export async function saveProviderSettings({ providerId = 'openrouteservice', apiKey, remember = false }) {
  const encryptedApiKey = await encryptApiKey(String(apiKey || ''));
  const sessionValue = JSON.stringify({ providerId, encryptedApiKey });
  const rememberedValue = JSON.stringify({ providerId });
  if (storageAvailable(sessionStorage)) sessionStorage.setItem(SESSION_KEY, sessionValue);
  if (storageAvailable(localStorage)) {
    if (remember) localStorage.setItem(LOCAL_KEY, rememberedValue); else localStorage.removeItem(LOCAL_KEY);
  }
}

export function clearProviderSettings() {
  if (storageAvailable(sessionStorage)) sessionStorage.removeItem(SESSION_KEY);
  if (storageAvailable(localStorage)) localStorage.removeItem(LOCAL_KEY);
}
