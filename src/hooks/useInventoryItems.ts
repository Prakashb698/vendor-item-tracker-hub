
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  price: number;
  low_stock_threshold: number;
  sku: string;
  barcode: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useInventoryItems = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-items', user?.id],
    queryFn: async () => {
      console.log('Fetching inventory items for user:', user?.id);
      
      if (!user?.id) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      // Convert user ID to UUID format if it's not already
      let userId = user.id;
      if (userId === '1' || userId === 1 || !userId.includes('-')) {
        // Generate a proper UUID for the user if they don't have one
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          userId = authUser.user.id;
        } else {
          throw new Error('Cannot get authenticated user UUID');
        }
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }
      
      console.log('Successfully fetched inventory items:', data?.length || 0);
      return data as InventoryItem[];
    },
    enabled: !!user?.id,
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      console.log('Adding inventory item for user:', user?.id);
      console.log('Item data:', item);
      
      if (!user?.id) {
        console.error('No authenticated user found for adding item');
        throw new Error('User not authenticated');
      }
      
      // Get the proper UUID from Supabase auth
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        throw new Error('Cannot get authenticated user UUID');
      }
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...item,
          user_id: authUser.user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding inventory item:', error);
        throw error;
      }
      
      console.log('Successfully added inventory item:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Added",
        description: "Item has been added to your inventory.",
      });
    },
    onError: (error) => {
      console.error('Error in useAddInventoryItem:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Updated",
        description: "Item has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
      console.error('Error updating inventory item:', error);
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Deleted",
        description: "Item has been deleted from your inventory.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
      console.error('Error deleting inventory item:', error);
    },
  });
};
