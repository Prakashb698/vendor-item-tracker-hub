import { getUserInventoryStore } from '@/store/inventoryStore';
import { useAuth } from '@/contexts/AuthContext';

export const useUserInventory = () => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  const store = getUserInventoryStore(userId);
  return store();
};