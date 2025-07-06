
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryItem } from './inventoryStore';
import { toast } from '@/hooks/use-toast';

export interface QueueItem {
  id: string;
  inventoryItem: InventoryItem;
  quantity: number;
  addedAt: Date;
}

interface PurchaseQueueStore {
  items: QueueItem[];
  totalItems: number;
  totalValue: number;
  addItem: (inventoryItem: InventoryItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearQueue: () => void;
}

export const usePurchaseQueueStore = create<PurchaseQueueStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalValue: 0,
      
      addItem: (inventoryItem, quantity = 1) => set((state) => {
        console.log('Adding item to purchase queue:', inventoryItem.name);
        
        const existingItem = state.items.find(item => item.inventoryItem.id === inventoryItem.id);
        
        let newItems;
        if (existingItem) {
          newItems = state.items.map(item =>
            item.inventoryItem.id === inventoryItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newQueueItem: QueueItem = {
            id: `queue-${Date.now()}-${inventoryItem.id}`,
            inventoryItem,
            quantity,
            addedAt: new Date(),
          };
          newItems = [...state.items, newQueueItem];
        }
        
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = newItems.reduce((sum, item) => sum + (item.inventoryItem.price * item.quantity), 0);
        
        // Show success toast
        console.log('Showing toast for:', inventoryItem.name);
        toast({
          title: "Item added successfully!",
          description: `${inventoryItem.name} has been added to your purchase queue.`,
        });
        
        return { items: newItems, totalItems, totalValue };
      }),
      
      removeItem: (itemId) => set((state) => {
        const newItems = state.items.filter(item => item.id !== itemId);
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = newItems.reduce((sum, item) => sum + (item.inventoryItem.price * item.quantity), 0);
        
        return { items: newItems, totalItems, totalValue };
      }),
      
      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          const newItems = state.items.filter(item => item.id !== itemId);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalValue = newItems.reduce((sum, item) => sum + (item.inventoryItem.price * item.quantity), 0);
          
          return { items: newItems, totalItems, totalValue };
        }
        
        const newItems = state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = newItems.reduce((sum, item) => sum + (item.inventoryItem.price * item.quantity), 0);
        
        return { items: newItems, totalItems, totalValue };
      }),
      
      clearQueue: () => set({ items: [], totalItems: 0, totalValue: 0 }),
    }),
    {
      name: 'purchase-queue-storage',
    }
  )
);
