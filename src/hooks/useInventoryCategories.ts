
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InventoryCategory {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export const useInventoryCategories = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-categories', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Use the same mock UUID logic
      let userId = user.id;
      if (userId === '1') {
        userId = '00000000-0000-0000-0000-000000000001';
        console.log('Using mock UUID for categories:', userId);
      }
      
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data as InventoryCategory[];
    },
    enabled: !!user,
  });
};

export const useAddInventoryCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Use the same mock UUID logic
      let userId = user.id;
      if (userId === '1') {
        userId = '00000000-0000-0000-0000-000000000001';
        console.log('Adding category with mock UUID:', userId);
      }
      
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({
          name,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: "Category Added",
        description: "Category has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
      console.error('Error adding category:', error);
    },
  });
};

export const useDeleteInventoryCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
      console.error('Error deleting category:', error);
    },
  });
};
