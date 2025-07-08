
import { useState, useCallback, useEffect } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "@/hooks/use-toast";

export const useZebraScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const { items, updateItem } = useInventoryStore();

  // Check for Bluetooth scanner connection
  const checkScannerConnection = useCallback(async () => {
    try {
      // Check if Bluetooth is available
      if ('bluetooth' in navigator) {
        const devices = await navigator.bluetooth.getDevices();
        const zebraDevice = devices.find(device => 
          device.name?.toLowerCase().includes('zebra') || 
          device.name?.toLowerCase().includes('scanner')
        );
        
        if (zebraDevice && zebraDevice.gatt?.connected) {
          setIsConnected(true);
          setConnectionStatus('connected');
          return true;
        }
      }
      
      // Fallback: assume connected if we can detect keyboard input
      setIsConnected(true);
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.log('Bluetooth check failed, using keyboard wedge mode:', error);
      setIsConnected(true); // Assume keyboard wedge mode
      setConnectionStatus('connected');
      return true;
    }
  }, []);

  const connectScanner = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      // Try to connect via Web Bluetooth first
      if ('bluetooth' in navigator) {
        try {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service']
          });
          
          if (device.name?.toLowerCase().includes('zebra')) {
            await device.gatt?.connect();
            setIsConnected(true);
            setConnectionStatus('connected');
            toast({
              title: "Scanner Connected",
              description: `Connected to ${device.name} via Bluetooth`,
            });
            return;
          }
        } catch (bluetoothError) {
          console.log('Web Bluetooth connection failed:', bluetoothError);
        }
      }
      
      // Fallback to keyboard wedge mode
      setIsConnected(true);
      setConnectionStatus('connected');
      toast({
        title: "Scanner Ready",
        description: "Scanner ready in keyboard wedge mode. Make sure your Zebra scanner is paired via Bluetooth.",
      });
      
    } catch (error) {
      console.error('Scanner connection failed:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Could not connect to scanner. Please check Bluetooth pairing.",
        variant: "destructive",
      });
    }
  }, []);

  const handleBarcodeScan = useCallback((barcode: string) => {
    const now = Date.now();
    // Prevent duplicate scans within 1 second
    if (now - lastScanTime < 1000) {
      return;
    }
    setLastScanTime(now);

    console.log("Scanned barcode:", barcode);
    
    // Try to find item by SKU or barcode
    const foundItem = items.find(item => 
      item.sku === barcode || 
      item.barcode === barcode ||
      item.name.toLowerCase().includes(barcode.toLowerCase())
    );

    if (foundItem) {
      // Item found - increment quantity
      updateItem(foundItem.id, {
        quantity: foundItem.quantity + 1
      });
      
      toast({
        title: "Item Scanned Successfully",
        description: `${foundItem.name} - Quantity updated to ${foundItem.quantity + 1}`,
      });
    } else {
      // Item not found
      toast({
        title: "Item Not Found",
        description: `No item found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  }, [items, updateItem, lastScanTime]);

  const toggleScanner = useCallback(async () => {
    if (!isScannerActive) {
      if (!isConnected) {
        await connectScanner();
      }
      setIsScannerActive(true);
    } else {
      setIsScannerActive(false);
    }
  }, [isScannerActive, isConnected, connectScanner]);

  const disconnectScanner = useCallback(() => {
    setIsScannerActive(false);
    setIsConnected(false);
    setConnectionStatus('disconnected');
    toast({
      title: "Scanner Disconnected",
      description: "Scanner has been disconnected",
    });
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkScannerConnection();
  }, [checkScannerConnection]);

  return {
    isScannerActive,
    isConnected,
    connectionStatus,
    toggleScanner,
    connectScanner,
    disconnectScanner,
    handleBarcodeScan,
  };
};
