
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineStorage } from '@/lib/offlineStorage';
import { syncManager } from '@/lib/syncManager';
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
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryStore {
  items: InventoryItem[];
  categories: string[];
  isOnline: boolean;
  syncInProgress: boolean;
  loading: boolean;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  loadUserData: () => Promise<void>;
  loadOfflineData: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
  setSyncStatus: (status: boolean) => void;
  clearData: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      categories: [],
      isOnline: navigator.onLine,
      syncInProgress: false,
      loading: false,
      
      addItem: async (itemData) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const newItem = {
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            quantity: itemData.quantity,
            price: itemData.price,
            low_stock_threshold: itemData.lowStockThreshold,
            sku: itemData.sku,
            location: itemData.location,
            vendor: itemData.vendor,
            barcode: itemData.barcode,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('inventory_items')
            .insert(newItem)
            .select()
            .single();

          if (error) throw error;

          const formattedItem: InventoryItem = {
            id: data.id,
            name: data.name,
            description: data.description || '',
            category: data.category,
            quantity: data.quantity,
            price: Number(data.price),
            lowStockThreshold: data.low_stock_threshold,
            sku: data.sku,
            location: data.location || '',
            vendor: data.vendor || '',
            barcode: data.barcode || '',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          };

          set((state) => ({
            items: [...state.items, formattedItem],
          }));
        } catch (error) {
          console.error('Failed to add item:', error);
          throw error;
        }
      },
      
      updateItem: async (id, updates) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const dbUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          
          // Map frontend fields to database fields
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
          if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
          if (updates.location !== undefined) dbUpdates.location = updates.location;
          if (updates.vendor !== undefined) dbUpdates.vendor = updates.vendor;
          if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;

          const { error } = await supabase
            .from('inventory_items')
            .update(dbUpdates)
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, ...updates, updatedAt: new Date() }
                : item
            ),
          }));
        } catch (error) {
          console.error('Failed to update item:', error);
          throw error;
        }
      },
      
      deleteItem: async (id) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { error } = await supabase
            .from('inventory_items')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete item:', error);
          throw error;
        }
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

      loadUserData: async () => {
        try {
          set({ loading: true });
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ items: [], categories: [], loading: false });
            return;
          }

          // Load inventory items
          const { data: itemsData, error: itemsError } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', user.id);

          if (itemsError) throw itemsError;

          // Load categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('inventory_categories')
            .select('*')
            .eq('user_id', user.id);

          if (categoriesError) throw categoriesError;

          const formattedItems: InventoryItem[] = (itemsData || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            category: item.category,
            quantity: item.quantity,
            price: Number(item.price),
            lowStockThreshold: item.low_stock_threshold,
            sku: item.sku,
            location: item.location || '',
            vendor: item.vendor || '',
            barcode: item.barcode || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          }));

          const categories = (categoriesData || []).map(cat => cat.name);

          set({ 
            items: formattedItems, 
            categories: categories.length > 0 ? categories : ['Beverages', 'Food', 'Personal Care', 'Electronics', 'Clothing'],
            loading: false 
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
          set({ loading: false });
        }
      },

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
      clearData: () => set({ items: [], categories: [] }),
    }),
    {
      name: 'inventory-storage',
    }
  )
);
