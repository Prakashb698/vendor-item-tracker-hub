
import { useState, useCallback, useEffect } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "@/hooks/use-toast";

interface BluetoothNavigator extends Navigator {
  bluetooth?: {
    getDevices(): Promise<BluetoothDevice[]>;
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  };
}

interface RequestDeviceOptions {
  acceptAllDevices?: boolean;
  filters?: { name?: string; namePrefix?: string; services?: string[] }[];
  optionalServices?: string[];
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATT;
}

interface BluetoothRemoteGATT {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
}

interface BluetoothRemoteGATTServer {
  disconnect(): void;
}

export const useZebraScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const { items, updateItem } = useInventoryStore();

  // Check for Bluetooth scanner connection
  const checkScannerConnection = useCallback(async () => {
    try {
      const bluetoothNav = navigator as BluetoothNavigator;
      
      // Check if Web Bluetooth is supported
      if ('bluetooth' in navigator && bluetoothNav.bluetooth) {
        try {
          const devices = await bluetoothNav.bluetooth.getDevices();
          const zebraDevice = devices.find(device => 
            device.name?.toLowerCase().includes('zebra') || 
            device.name?.toLowerCase().includes('scanner') ||
            device.name?.toLowerCase().includes('symbol') ||
            device.name?.toLowerCase().includes('motorola')
          );
          
          if (zebraDevice && zebraDevice.gatt?.connected) {
            setIsConnected(true);
            setConnectionStatus('connected');
            setConnectedDevice(zebraDevice);
            return true;
          }
        } catch (bluetoothError) {
          console.log('Bluetooth device check failed:', bluetoothError);
        }
      }
      
      // Default to disconnected state
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return false;
    } catch (error) {
      console.log('Scanner connection check failed:', error);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return false;
    }
  }, []);

  const connectScanner = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      const bluetoothNav = navigator as BluetoothNavigator;
      
      // Try to connect via Web Bluetooth first
      if ('bluetooth' in navigator && bluetoothNav.bluetooth) {
        try {
          console.log('Attempting Bluetooth connection...');
          
          const device = await bluetoothNav.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'Zebra' },
              { namePrefix: 'Symbol' },
              { namePrefix: 'Motorola' },
              { namePrefix: 'Scanner' }
            ],
            optionalServices: ['battery_service', 'device_information']
          });
          
          console.log('Found device:', device.name);
          
          if (device.gatt) {
            await device.gatt.connect();
            setIsConnected(true);
            setConnectionStatus('connected');
            setConnectedDevice(device);
            toast({
              title: "Scanner Connected",
              description: `Connected to ${device.name || 'Bluetooth Scanner'}`,
            });
            return;
          }
        } catch (bluetoothError) {
          console.log('Web Bluetooth connection failed:', bluetoothError);
          
          // If user cancelled or no device found, show specific message
          if (bluetoothError instanceof Error) {
            if (bluetoothError.name === 'NotFoundError') {
              toast({
                title: "No Scanner Found",
                description: "No Zebra scanner found. Make sure it's in pairing mode and try again.",
                variant: "destructive",
              });
            } else if (bluetoothError.name === 'NotAllowedError') {
              toast({
                title: "Connection Cancelled",
                description: "Bluetooth connection was cancelled.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Bluetooth Connection Failed",
                description: "Try pairing your scanner manually via system Bluetooth settings first.",
                variant: "destructive",
              });
            }
          }
        }
      } else {
        toast({
          title: "Bluetooth Not Supported",
          description: "Your browser doesn't support Web Bluetooth. Make sure your scanner is paired via system settings.",
          variant: "destructive",
        });
      }
      
      // Fallback to keyboard wedge mode
      setIsConnected(true);
      setConnectionStatus('connected');
      toast({
        title: "Scanner Ready",
        description: "Scanner ready in keyboard wedge mode. Make sure your Zebra scanner is paired via Bluetooth settings.",
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
    
    // Try to find item by SKU or name match
    const foundItem = items.find(item => 
      item.sku === barcode || 
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
    if (connectedDevice?.gatt?.connected) {
      connectedDevice.gatt.disconnect();
    }
    setIsScannerActive(false);
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setConnectedDevice(null);
    toast({
      title: "Scanner Disconnected",
      description: "Scanner has been disconnected",
    });
  }, [connectedDevice]);

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
