
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
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: 'item-1',
          name: 'Premium Coffee Beans',
          description: 'High-quality arabica coffee beans from local farms',
          category: 'Beverages',
          quantity: 25,
          price: 15.99,
          lowStockThreshold: 10,
          sku: 'COF-001',
          location: 'A1-S2',
          vendor: 'Local Farms Co.',
          barcode: '123456789012',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'item-2',
          name: 'Organic Honey',
          description: 'Pure organic honey from local beekeepers',
          category: 'Food',
          quantity: 5,
          price: 12.50,
          lowStockThreshold: 8,
          sku: 'HON-001',
          location: 'B2-S1',
          vendor: 'Bee Natural Inc.',
          barcode: '234567890123',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
        },
        {
          id: 'item-3',
          name: 'Handmade Soap',
          description: 'Natural handmade soap with essential oils',
          category: 'Personal Care',
          quantity: 45,
          price: 8.99,
          lowStockThreshold: 15,
          sku: 'SOAP-001',
          location: 'C1-S3',
          vendor: 'Artisan Soaps Ltd.',
          barcode: '345678901234',
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-17'),
        },
      ],
      categories: ['Beverages', 'Food', 'Personal Care', 'Electronics', 'Clothing'],
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
    }),
    {
      name: 'inventory-storage',
    }
  )
);
