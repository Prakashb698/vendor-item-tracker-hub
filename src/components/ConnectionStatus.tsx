import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useUserInventory } from '@/hooks/useUserInventory';
import { syncManager } from '@/lib/syncManager';

export const ConnectionStatus = () => {
  const { isOnline, syncInProgress, setOnlineStatus, setSyncStatus } = useUserInventory();
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncManager.syncWhenOnline();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    const handleSyncStart = () => {
      setSyncStatus(true);
    };

    const handleSyncEnd = () => {
      setSyncStatus(false);
      setPendingChanges(0);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending changes periodically
    const checkPendingChanges = async () => {
      try {
        const { offlineStorage } = await import('@/lib/offlineStorage');
        await offlineStorage.init();
        const changes = await offlineStorage.getPendingChanges();
        setPendingChanges(changes.length);
      } catch (error) {
        console.error('Failed to check pending changes:', error);
      }
    };

    const interval = setInterval(checkPendingChanges, 5000);
    checkPendingChanges(); // Initial check

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [setOnlineStatus, setSyncStatus]);

  const getStatusColor = () => {
    if (syncInProgress) return 'bg-yellow-500';
    if (isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (syncInProgress) return 'Syncing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const getIcon = () => {
    if (syncInProgress) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (isOnline) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`${getStatusColor()} text-white border-0`}>
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </div>
      </Badge>
      {pendingChanges > 0 && (
        <Badge variant="secondary" className="text-xs">
          {pendingChanges} pending
        </Badge>
      )}
    </div>
  );
};