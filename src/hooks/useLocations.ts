import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessLocation {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useLocations = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('business_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (locationData: Omit<BusinessLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('business_locations')
        .insert({
          ...locationData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      await loadLocations();
      return data;
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  };

  const updateLocation = async (id: string, updates: Partial<BusinessLocation>) => {
    try {
      const { error } = await supabase
        .from('business_locations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('business_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  };

  const setDefaultLocation = async (id: string) => {
    try {
      // First, remove default from all locations
      await supabase
        .from('business_locations')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected location as default
      await supabase
        .from('business_locations')
        .update({ is_default: true })
        .eq('id', id);

      await loadLocations();
    } catch (error) {
      console.error('Error setting default location:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadLocations();
  }, [user]);

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    setDefaultLocation,
    loadLocations
  };
};