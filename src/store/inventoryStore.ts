
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  sku: string;
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
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-17'),
        },
      ],
      categories: ['Beverages', 'Food', 'Personal Care', 'Electronics', 'Clothing'],
      
      addItem: (itemData) => set((state) => ({
        items: [
          ...state.items,
          {
            ...itemData,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        ),
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
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
