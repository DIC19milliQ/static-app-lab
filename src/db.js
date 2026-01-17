const DB_NAME = "localdb-studio";
const DB_VERSION = 1;
const STORE_NAME = "records";

export const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

const withStore = async (mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllRecords = () =>
  withStore("readonly", (store) =>
    new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    })
  );

export const upsertRecord = (record) =>
  withStore("readwrite", (store) => store.put(record));

export const deleteRecord = (id) => withStore("readwrite", (store) => store.delete(id));

export const bulkUpsert = (records) =>
  withStore("readwrite", (store) => {
    records.forEach((record) => store.put(record));
  });

export const clearAll = () => withStore("readwrite", (store) => store.clear());
