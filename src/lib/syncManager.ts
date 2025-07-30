import { supabase } from '@/integrations/supabase/client';
import { offlineStorage } from './offlineStorage';
import { toast } from 'sonner';

export class SyncManager {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.setupOnlineListener();
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast.info('You are now offline. Changes will be saved locally and synced when online.');
    });
  }

  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    
    try {
      await offlineStorage.init();
      const pendingChanges = await offlineStorage.getPendingChanges();

      if (pendingChanges.length === 0) {
        this.syncInProgress = false;
        return;
      }

      toast.info(`Syncing ${pendingChanges.length} offline changes...`);

      for (const change of pendingChanges) {
        try {
          await this.processChange(change);
        } catch (error) {
          console.error('Failed to sync change:', change, error);
          // Continue with other changes even if one fails
        }
      }

      await offlineStorage.clearPendingChanges();
      toast.success('All changes synced successfully!');

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed. Will retry when connection is stable.');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processChange(change: any): Promise<void> {
    switch (change.table) {
      case 'inventory_items':
        return this.syncInventoryChange(change);
      default:
        console.warn('Unknown table for sync:', change.table);
    }
  }

  private async syncInventoryChange(change: any): Promise<void> {
    const { type, data, itemId } = change;

    switch (type) {
      case 'create':
        await supabase.from('inventory_items').insert(data);
        break;
      case 'update':
        await supabase.from('inventory_items').update(data).eq('id', itemId);
        break;
      case 'delete':
        await supabase.from('inventory_items').delete().eq('id', itemId);
        break;
    }
  }

  async queueChange(change: {
    type: 'create' | 'update' | 'delete';
    table: string;
    data: any;
    itemId?: string;
  }): Promise<void> {
    await offlineStorage.init();
    await offlineStorage.addPendingChange({
      ...change,
      timestamp: Date.now()
    });

    if (this.isOnline) {
      // Try to sync immediately if online
      this.syncWhenOnline();
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const syncManager = new SyncManager();