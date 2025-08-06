import { getUserInventoryStore } from '@/store/inventoryStore';
import { useAuth } from '@/contexts/AuthContext';

export const useUserInventory = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  console.log('useUserInventory - Current user:', user);
  console.log('useUserInventory - Using userId:', userId);
  
  const store = getUserInventoryStore(userId);
  return store();
};