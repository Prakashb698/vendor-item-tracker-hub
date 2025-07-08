
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
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Fetching categories for user:', user.id);
      
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched successfully:', data?.length || 0);
      return data as InventoryCategory[];
    },
    enabled: !!user?.id,
  });
};

export const useAddInventoryCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Adding category:', name, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({
          name,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }
      
      console.log('Category added successfully:', data);
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
      console.error('Category addition failed:', error);
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInventoryCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting category:', id);
      
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
      
      console.log('Category deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Category deletion failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    },
  });
};
