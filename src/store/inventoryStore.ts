import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineStorage } from '@/lib/offlineStorage';
import { syncManager } from '@/lib/syncManager';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  sku: string;
  location: string;
  vendor: string;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryStore {
  items: InventoryItem[];
  categories: string[];
  isOnline: boolean;
  syncInProgress: boolean;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  loadOfflineData: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
  setSyncStatus: (status: boolean) => void;
  clearUserData: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [], // Start with empty array for new accounts
      categories: [], // Start with empty categories for new accounts
      isOnline: navigator.onLine,
      syncInProgress: false,
      
      addItem: (itemData) => set((state) => {
        const uniqueId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
          ...itemData,
          id: uniqueId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Queue for sync if offline or online
        syncManager.queueChange({
          type: 'create',
          table: 'inventory_items',
          data: newItem
        });

        return {
          items: [...state.items, newItem],
        };
      }),
      
      updateItem: (id, updates) => set((state) => {
        const updatedItems = state.items.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        );

        // Queue for sync if offline or online
        const updatedItem = updatedItems.find(item => item.id === id);
        if (updatedItem) {
          syncManager.queueChange({
            type: 'update',
            table: 'inventory_items',
            data: updates,
            itemId: id
          });
        }

        return { items: updatedItems };
      }),
      
      deleteItem: (id) => set((state) => {
        // Queue for sync if offline or online
        syncManager.queueChange({
          type: 'delete',
          table: 'inventory_items',
          data: {},
          itemId: id
        });

        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }),
      
      addCategory: (category) => set((state) => ({
        categories: state.categories.includes(category)
          ? state.categories
          : [...state.categories, category],
      })),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter((cat) => cat !== category),
        items: state.items.map((item) =>
          item.category === category
            ? { ...item, category: 'Uncategorized' }
            : item
        ),
      })),

      loadOfflineData: async () => {
        try {
          await offlineStorage.init();
          // In a real app, you'd load from IndexedDB here
          // For now, we'll keep the existing data structure
        } catch (error) {
          console.error('Failed to load offline data:', error);
        }
      },

      setOnlineStatus: (status) => set({ isOnline: status }),
      setSyncStatus: (status) => set({ syncInProgress: status }),
      
      clearUserData: () => set({
        items: [],
        categories: [],
        isOnline: navigator.onLine,
        syncInProgress: false,
      }),
    }),
    {
      name: 'inventory-storage',
      version: 2, // Increment version to clear old data
    }
  )
);
