export const DB_NAME = "mt-unipos-offline-db";
export const DB_VERSION = 1;
export const STORE_SALES = "queued_sales"; // Legacy, might not need if using keys
export const STORE_SYNC_KEYS = "pending_sync_keys";
export const STORE_RECEIPTS = "queued_receipts";

// Initialize IndexedDB
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION + 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening DB");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_SALES)) {
        db.createObjectStore(STORE_SALES, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_SYNC_KEYS)) {
        db.createObjectStore(STORE_SYNC_KEYS, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_RECEIPTS)) {
        db.createObjectStore(STORE_RECEIPTS, { keyPath: "id" });
      }
    };
  });
}

// Queue a localStorage key that needs syncing to Supabase
export async function queueSyncKey(key: string) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_SYNC_KEYS], "readwrite");
    const store = transaction.objectStore(STORE_SYNC_KEYS);
    const request = store.put({ key, queuedAt: new Date().toISOString() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Save a sale to the queue
export async function queueOfflineSale(saleId: string, saleData: any) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_SALES], "readwrite");
    const store = transaction.objectStore(STORE_SALES);
    const request = store.put({ id: saleId, data: saleData, queuedAt: new Date().toISOString() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Save a receipt blob to the queue
export async function queueOfflineReceipt(receiptId: string, blob: Blob, filePath: string) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_RECEIPTS], "readwrite");
    const store = transaction.objectStore(STORE_RECEIPTS);
    const request = store.put({ id: receiptId, blob, filePath, queuedAt: new Date().toISOString() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get all queued items from a store
export async function getQueuedItems(storeName: string): Promise<any[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Remove an item from the queue after successful sync
export async function dequeueItem(storeName: string, id: string) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
