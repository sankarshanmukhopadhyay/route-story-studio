const SESSION_KEY = 'route-story-studio.provider.openrouteservice';
const LOCAL_KEY = 'route-story-studio.provider.openrouteservice.remembered';

function storageAvailable(storage) {
  try { const key = '__rss_storage_test__'; storage.setItem(key, '1'); storage.removeItem(key); return true; } catch { return false; }
}

export function loadProviderSettings() {
  const session = storageAvailable(sessionStorage) ? sessionStorage.getItem(SESSION_KEY) : null;
  const remembered = storageAvailable(localStorage) ? localStorage.getItem(LOCAL_KEY) : null;

  const defaultSettings = { providerId: 'openrouteservice', apiKey: '', remember: false };
  if (!session && !remembered) return defaultSettings;

  try {
    const sessionParsed = session ? JSON.parse(session) : null;
    const rememberedParsed = remembered ? JSON.parse(remembered) : null;
    const providerId = String((sessionParsed && sessionParsed.providerId) || (rememberedParsed && rememberedParsed.providerId) || 'openrouteservice');
    const parsedApiKey = String((sessionParsed && sessionParsed.apiKey) || '');
    return { providerId, apiKey: parsedApiKey, remember: Boolean(remembered) };
  } catch {
    return defaultSettings;
  }
}

export function saveProviderSettings({ providerId = 'openrouteservice', apiKey, remember = false }) {
  const sessionValue = JSON.stringify({ providerId, apiKey: String(apiKey || '') });
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
