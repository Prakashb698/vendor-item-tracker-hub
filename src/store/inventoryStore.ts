import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
  location_id?: string; // New field for location tracking
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
  loadUserData: (userId?: string) => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
  setSyncStatus: (status: boolean) => void;
  clearUserData: () => void;
}

// Store for user-specific inventory stores
const userStores = new Map<string, any>();

// Factory function to get or create user-specific store
export const getUserInventoryStore = (userId: string) => {
  if (!userStores.has(userId)) {
    const userStore = create<InventoryStore>()(
      persist(
        (set, get) => ({
          items: [],
          categories: [],
          isOnline: navigator.onLine,
          syncInProgress: false,
          
          addItem: async (itemData) => {
            // For mock authentication, skip Supabase calls
            const uniqueId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const localItem = {
              ...itemData,
              id: uniqueId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set((state) => ({
              items: [...state.items, localItem],
            }));
          },
          
          updateItem: async (id, updates) => {
            // For mock authentication, skip Supabase calls
            set((state) => ({
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, ...updates, updatedAt: new Date() }
                  : item
              ),
            }));
          },
          
          deleteItem: async (id) => {
            // For mock authentication, skip Supabase calls
            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
            }));
          },
          
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

          loadUserData: async (userIdParam?: string) => {
            // For mock authentication, no need to load from Supabase
            // Data is already persisted locally via Zustand persist
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
          name: `inventory-storage-${userId}`,
          version: 1,
        }
      )
    );
    
    userStores.set(userId, userStore);
  }
  
  return userStores.get(userId);
};

// Backward compatibility - default store for anonymous users  
export const useInventoryStore = () => getUserInventoryStore('anonymous')();