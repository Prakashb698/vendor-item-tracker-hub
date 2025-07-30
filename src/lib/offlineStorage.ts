import { InventoryItem } from '@/store/inventoryStore';

// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'SwiffPassDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create inventory store
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // Create pending changes store
        if (!db.objectStoreNames.contains('pendingChanges')) {
          const changesStore = db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
          changesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create sync metadata store
        if (!db.objectStoreNames.contains('syncMetadata')) {
          db.createObjectStore('syncMetadata', { keyPath: 'key' });
        }
      };
    });
  }

  async saveInventoryItems(items: InventoryItem[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['inventory'], 'readwrite');
    const store = transaction.objectStore('inventory');

    for (const item of items) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readonly');
      const store = transaction.objectStore('inventory');
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addPendingChange(change: {
    type: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    itemId?: string;
    timestamp: number;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      const request = store.add(change);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingChanges(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingChanges'], 'readonly');
      const store = transaction.objectStore('pendingChanges');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingChanges(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncMetadata(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncMetadata'], 'readonly');
      const store = transaction.objectStore('syncMetadata');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async setSyncMetadata(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncMetadata'], 'readwrite');
      const store = transaction.objectStore('syncMetadata');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();