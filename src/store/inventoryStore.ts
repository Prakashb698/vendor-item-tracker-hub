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
  loadUserData: () => Promise<void>;
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
      
      addItem: async (itemData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const newItem = {
          ...itemData,
          user_id: user.id,
        };

        const { error } = await supabase
          .from('inventory_items')
          .insert(newItem);

        if (error) throw error;

        // Update local state - data will be synced via real-time subscriptions
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('inventory_items')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
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
      },
      
      deleteItem: async (id) => {
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
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Load inventory items
          const { data: items, error: itemsError } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (itemsError) throw itemsError;

          // Convert database format to store format
          const formattedItems = items?.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            category: item.category,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            lowStockThreshold: item.low_stock_threshold,
            sku: item.sku,
            location: item.location || '',
            vendor: item.vendor || '',
            barcode: item.barcode || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          })) || [];

          // Extract unique categories
          const uniqueCategories = [...new Set(formattedItems.map(item => item.category))];

          set({
            items: formattedItems,
            categories: uniqueCategories,
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
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
      version: 3, // Clear old localStorage data
    }
  )
);
