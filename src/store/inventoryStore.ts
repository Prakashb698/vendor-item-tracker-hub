
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logTransaction } from '@/utils/transactionLogger';

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
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryStore {
  items: InventoryItem[];
  categories: string[];
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  adjustStock: (id: string, newQuantity: number, notes?: string) => void;
  recordSale: (id: string, quantitySold: number, unitPrice?: number, referenceNumber?: string) => void;
  recordPurchase: (id: string, quantityPurchased: number, unitPrice?: number, referenceNumber?: string) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: '1',
          name: 'Premium Coffee Beans',
          description: 'High-quality arabica coffee beans from local farms',
          category: 'Beverages',
          quantity: 25,
          price: 15.99,
          lowStockThreshold: 10,
          sku: 'COF-001',
          location: 'A1-S2',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'Organic Honey',
          description: 'Pure organic honey from local beekeepers',
          category: 'Food',
          quantity: 5,
          price: 12.50,
          lowStockThreshold: 8,
          sku: 'HON-001',
          location: 'B2-S1',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
        },
        {
          id: '3',
          name: 'Handmade Soap',
          description: 'Natural handmade soap with essential oils',
          category: 'Personal Care',
          quantity: 45,
          price: 8.99,
          lowStockThreshold: 15,
          sku: 'SOAP-001',
          location: 'C1-S3',
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-17'),
        },
      ],
      categories: ['Beverages', 'Food', 'Personal Care', 'Electronics', 'Clothing'],
      
      addItem: (itemData) => set((state) => {
        const newItem = {
          ...itemData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Log transaction for new item
        logTransaction({
          itemId: newItem.id,
          type: 'stock_in',
          quantity: newItem.quantity,
          previousQuantity: 0,
          newQuantity: newItem.quantity,
          unitPrice: newItem.price,
          notes: `New item added: ${newItem.name}`
        });

        return {
          items: [...state.items, newItem],
        };
      }),
      
      updateItem: (id, updates) => set((state) => {
        const oldItem = state.items.find(item => item.id === id);
        if (!oldItem) return state;

        const newItem = { ...oldItem, ...updates, updatedAt: new Date() };
        
        // Log transaction if quantity changed
        if (updates.quantity !== undefined && updates.quantity !== oldItem.quantity) {
          const quantityChange = updates.quantity - oldItem.quantity;
          logTransaction({
            itemId: id,
            type: 'adjustment',
            quantity: quantityChange,
            previousQuantity: oldItem.quantity,
            newQuantity: updates.quantity,
            unitPrice: newItem.price,
            notes: `Item updated: quantity adjusted`
          });
        }

        return {
          items: state.items.map((item) =>
            item.id === id ? newItem : item
          ),
        };
      }),
      
      deleteItem: (id) => set((state) => {
        const item = state.items.find(item => item.id === id);
        if (item && item.quantity > 0) {
          // Log transaction for removing remaining stock
          logTransaction({
            itemId: id,
            type: 'adjustment',
            quantity: -item.quantity,
            previousQuantity: item.quantity,
            newQuantity: 0,
            notes: `Item deleted: ${item.name}`
          });
        }

        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }),

      adjustStock: (id, newQuantity, notes) => {
        const state = get();
        const item = state.items.find(item => item.id === id);
        if (!item) return;

        const quantityChange = newQuantity - item.quantity;
        
        // Log the stock adjustment
        logTransaction({
          itemId: id,
          type: 'adjustment',
          quantity: quantityChange,
          previousQuantity: item.quantity,
          newQuantity: newQuantity,
          unitPrice: item.price,
          notes: notes || 'Stock adjustment'
        });

        // Update the item
        state.updateItem(id, { quantity: newQuantity });
      },

      recordSale: (id, quantitySold, unitPrice, referenceNumber) => {
        const state = get();
        const item = state.items.find(item => item.id === id);
        if (!item || item.quantity < quantitySold) return;

        const newQuantity = item.quantity - quantitySold;
        
        // Log the sale transaction
        logTransaction({
          itemId: id,
          type: 'sale',
          quantity: -quantitySold,
          previousQuantity: item.quantity,
          newQuantity: newQuantity,
          unitPrice: unitPrice || item.price,
          referenceNumber: referenceNumber,
          notes: `Sale: ${quantitySold} units sold`
        });

        // Update the item quantity
        state.updateItem(id, { quantity: newQuantity });
      },

      recordPurchase: (id, quantityPurchased, unitPrice, referenceNumber) => {
        const state = get();
        const item = state.items.find(item => item.id === id);
        if (!item) return;

        const newQuantity = item.quantity + quantityPurchased;
        
        // Log the purchase transaction
        logTransaction({
          itemId: id,
          type: 'purchase',
          quantity: quantityPurchased,
          previousQuantity: item.quantity,
          newQuantity: newQuantity,
          unitPrice: unitPrice || item.price,
          referenceNumber: referenceNumber,
          notes: `Purchase: ${quantityPurchased} units received`
        });

        // Update the item quantity
        state.updateItem(id, { quantity: newQuantity });
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
    }),
    {
      name: 'inventory-storage',
    }
  )
);
