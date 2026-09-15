const DATABASE = 'route-story-studio';
const VERSION = 2;
const PROJECT_STORE = 'projects';
const MEDIA_STORE = 'story-media';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROJECT_STORE)) database.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(MEDIA_STORE)) database.createObjectStore(MEDIA_STORE, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local project storage could not be opened.'));
  });
}

function transact(storeName, mode, operation) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local project storage operation failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error || new Error('Local project storage transaction failed.'));
  }));
}

export function saveProject(project) { return transact(PROJECT_STORE, 'readwrite', (store) => store.put(project)); }
export function loadProject(id) { return transact(PROJECT_STORE, 'readonly', (store) => store.get(id)); }
export function deleteProject(id) { return transact(PROJECT_STORE, 'readwrite', (store) => store.delete(id)); }
export function listProjects() { return transact(PROJECT_STORE, 'readonly', (store) => store.getAll()).then((items) => items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))); }

function mediaKey(projectId, mediaId) { return `${projectId}:${mediaId}`; }
export function saveStoryMedia(projectId, mediaId, dataUrl) {
  if (!projectId || !mediaId || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) throw new Error('Story media payload is invalid.');
  return transact(MEDIA_STORE, 'readwrite', (store) => store.put({ key: mediaKey(projectId, mediaId), projectId, mediaId, dataUrl }));
}
export function loadStoryMedia(projectId) {
  return transact(MEDIA_STORE, 'readonly', (store) => store.getAll()).then((items) => Object.fromEntries(items.filter((item) => item.projectId === projectId).map((item) => [item.mediaId, item.dataUrl])));
}
export function deleteStoryMedia(projectId, mediaId = null) {
  if (mediaId) return transact(MEDIA_STORE, 'readwrite', (store) => store.delete(mediaKey(projectId, mediaId)));
  return transact(MEDIA_STORE, 'readonly', (store) => store.getAll()).then((items) => Promise.all(items.filter((item) => item.projectId === projectId).map((item) => transact(MEDIA_STORE, 'readwrite', (store) => store.delete(item.key)))));
}
