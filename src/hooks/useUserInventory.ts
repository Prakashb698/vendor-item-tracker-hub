import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { inventoryItemSchema, sanitizeString, sanitizeNumber } from '@/lib/validationSchemas';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  vendor: string;
  sku: string;
  barcode: string;
  location: string;
  low_stock_threshold: number;
  lowStockThreshold: number; // Alias for compatibility
  user_id: string;
  created_at: string;
  updated_at: string;
  createdAt: Date; // Alias for compatibility
  updatedAt: Date; // Alias for compatibility
}

export const useUserInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load items from Supabase
  const loadItems = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Add compatibility aliases
      const itemsWithAliases = (data || []).map(item => ({
        ...item,
        description: item.description || '',
        vendor: item.vendor || '',
        barcode: item.barcode || '',
        location: item.location || '',
        lowStockThreshold: item.low_stock_threshold,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
      setItems(itemsWithAliases);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories from Supabase
  const loadCategories = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('name')
        .eq('user_id', user.id);

      if (error) throw error;
      setCategories(data?.map(cat => cat.name) || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Add item with validation
  const addItem = async (item: any) => {
    if (!user?.id) return;

    try {
      // Validate and sanitize input
      const sanitizedItem = {
        ...item,
        name: sanitizeString(item.name),
        description: item.description ? sanitizeString(item.description) : '',
        quantity: sanitizeNumber(item.quantity),
        price: sanitizeNumber(item.price),
        category: sanitizeString(item.category),
        vendor: item.vendor ? sanitizeString(item.vendor) : '',
        sku: sanitizeString(item.sku),
        barcode: item.barcode ? sanitizeString(item.barcode) : '',
        location: item.location ? sanitizeString(item.location) : '',
        low_stock_threshold: sanitizeNumber(item.lowStockThreshold || item.low_stock_threshold || 0)
      };

      const validation = inventoryItemSchema.safeParse(sanitizedItem);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...sanitizedItem,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      const itemWithAliases = {
        ...data,
        description: data.description || '',
        location: data.location || '',
        lowStockThreshold: data.low_stock_threshold,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      setItems(prev => [itemWithAliases, ...prev]);
      return itemWithAliases;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  // Update item with validation
  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user?.id) return;

    try {
      // Sanitize updates if they exist
      const sanitizedUpdates: any = {};
      if (updates.name) sanitizedUpdates.name = sanitizeString(updates.name);
      if (updates.description !== undefined) sanitizedUpdates.description = updates.description ? sanitizeString(updates.description) : null;
      if (updates.quantity !== undefined) sanitizedUpdates.quantity = sanitizeNumber(updates.quantity);
      if (updates.price !== undefined) sanitizedUpdates.price = sanitizeNumber(updates.price);
      if (updates.category) sanitizedUpdates.category = sanitizeString(updates.category);
      if (updates.vendor !== undefined) sanitizedUpdates.vendor = updates.vendor ? sanitizeString(updates.vendor) : null;
      if (updates.sku) sanitizedUpdates.sku = sanitizeString(updates.sku);
      if (updates.barcode !== undefined) sanitizedUpdates.barcode = updates.barcode ? sanitizeString(updates.barcode) : null;
      if (updates.location !== undefined) sanitizedUpdates.location = updates.location ? sanitizeString(updates.location) : null;
      if (updates.low_stock_threshold !== undefined) sanitizedUpdates.low_stock_threshold = sanitizeNumber(updates.low_stock_threshold);
      if (updates.lowStockThreshold !== undefined) sanitizedUpdates.low_stock_threshold = sanitizeNumber(updates.lowStockThreshold);

      const { data, error } = await supabase
        .from('inventory_items')
        .update(sanitizedUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      const itemWithAliases = {
        ...data,
        description: data.description || '',
        location: data.location || '',
        lowStockThreshold: data.low_stock_threshold,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      setItems(prev => prev.map(item => item.id === id ? itemWithAliases : item));
      return itemWithAliases;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  // Add category
  const addCategory = async (name: string) => {
    if (!user?.id) return;

    try {
      const sanitizedName = sanitizeString(name);
      const { error } = await supabase
        .from('inventory_categories')
        .insert({ name: sanitizedName, user_id: user.id });

      if (error) throw error;
      setCategories(prev => [...prev, sanitizedName]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  // Delete category
  const deleteCategory = async (name: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('name', name)
        .eq('user_id', user.id);

      if (error) throw error;
      setCategories(prev => prev.filter(cat => cat !== name));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      loadItems();
      loadCategories();
    } else {
      setItems([]);
      setCategories([]);
    }
  }, [user?.id]);

  return {
    items,
    categories,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    deleteCategory,
    loadItems,
    loadCategories,
    // Mock offline functionality for compatibility
    isOnline: true,
    syncInProgress: false,
    setOnlineStatus: (_status: boolean) => {},
    setSyncStatus: (_status: boolean) => {}
  };
};