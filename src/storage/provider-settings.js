const SESSION_KEY = 'route-story-studio.provider.openrouteservice';
const LOCAL_KEY = 'route-story-studio.provider.openrouteservice.remembered';

function storageAvailable(storage) {
  try { const key = '__rss_storage_test__'; storage.setItem(key, '1'); storage.removeItem(key); return true; } catch { return false; }
}

export function loadProviderSettings() {
  const session = storageAvailable(sessionStorage) ? sessionStorage.getItem(SESSION_KEY) : null;
  const remembered = storageAvailable(localStorage) ? localStorage.getItem(LOCAL_KEY) : null;
  const raw = session || remembered;
  if (!raw) return { providerId: 'openrouteservice', apiKey: '', remember: false };
  try { const parsed = JSON.parse(raw); return { providerId: 'openrouteservice', apiKey: String(parsed.apiKey || ''), remember: Boolean(remembered) }; }
  catch { return { providerId: 'openrouteservice', apiKey: '', remember: false }; }
}

export function saveProviderSettings({ providerId = 'openrouteservice', apiKey, remember = false }) {
  const value = JSON.stringify({ providerId, apiKey: String(apiKey || '') });
  if (storageAvailable(sessionStorage)) sessionStorage.setItem(SESSION_KEY, value);
  if (storageAvailable(localStorage)) {
    if (remember) localStorage.setItem(LOCAL_KEY, value); else localStorage.removeItem(LOCAL_KEY);
  }
}

export function clearProviderSettings() {
  if (storageAvailable(sessionStorage)) sessionStorage.removeItem(SESSION_KEY);
  if (storageAvailable(localStorage)) localStorage.removeItem(LOCAL_KEY);
}
