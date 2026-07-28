const DATABASE = 'route-story-studio';
const VERSION = 1;
const STORE = 'projects';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local project storage could not be opened.'));
  });
}

function transact(mode, operation) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local project storage operation failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error || new Error('Local project storage transaction failed.'));
  }));
}

export function saveProject(project) { return transact('readwrite', (store) => store.put(project)); }
export function loadProject(id) { return transact('readonly', (store) => store.get(id)); }
export function deleteProject(id) { return transact('readwrite', (store) => store.delete(id)); }
export function listProjects() { return transact('readonly', (store) => store.getAll()).then((items) => items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))); }
