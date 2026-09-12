/**
 * Native IndexedDB draft persistence utility.
 * Allows saving complete form states including text fields, amenities arrays,
 * and binary File objects (Images & PDF documents) directly in browser storage.
 */

export interface PropertyDraftData {
  formData: Record<string, any>;
  amenities: string[];
  images: File[];
  documents: Record<string, File>;
  updatedAt: number;
}

const DB_NAME = 'CPM_FormDraftsDB';
const STORE_NAME = 'drafts';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveDraftToIndexedDB(
  draftKey: string,
  data: Omit<PropertyDraftData, 'updatedAt'>
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const payload: PropertyDraftData = {
        ...data,
        updatedAt: Date.now(),
      };

      const request = store.put(payload, draftKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.warn('Failed to save draft to IndexedDB:', error);
  }
}

export async function loadDraftFromIndexedDB(
  draftKey: string
): Promise<PropertyDraftData | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(draftKey);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.warn('Failed to load draft from IndexedDB:', error);
    return null;
  }
}

export async function clearDraftFromIndexedDB(draftKey: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(draftKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.warn('Failed to clear draft from IndexedDB:', error);
  }
}
