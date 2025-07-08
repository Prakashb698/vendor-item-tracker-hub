
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
  addEventListener?: (event: string, callback: () => void) => void;
}

interface BluetoothRemoteGATT {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
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
  const [scanBuffer, setScanBuffer] = useState<string>("");
  const { items, updateItem } = useInventoryStore();

  // Check for Zebra scanner connection
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
            device.name?.toLowerCase().includes('motorola') ||
            device.name?.toLowerCase().includes('tc') ||
            device.name?.toLowerCase().includes('mc') ||
            device.name?.toLowerCase().includes('ds')
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
          
          // Use specific filters for scanner devices
          const device = await bluetoothNav.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'Zebra' },
              { namePrefix: 'Symbol' },
              { namePrefix: 'Motorola' },
              { namePrefix: 'Scanner' },
              { namePrefix: 'TC' },
              { namePrefix: 'MC' },
              { namePrefix: 'DS' },
              { namePrefix: 'LS' },
              { namePrefix: 'LI' },
              { namePrefix: 'CS' },
              { namePrefix: '2208' },
              { namePrefix: '3608' }
            ],
            optionalServices: [
              'battery_service', 
              'device_information', 
              'human_interface_device',
              '00001812-0000-1000-8000-00805f9b34fb',
              '0000180f-0000-1000-8000-00805f9b34fb'
            ]
          });
          
          console.log('Found device:', device.name, device.id);
          
          if (device.gatt) {
            const server = await device.gatt.connect();
            setIsConnected(true);
            setConnectionStatus('connected');
            setConnectedDevice(device);
            
            // Listen for disconnection
            if (device.addEventListener) {
              device.addEventListener('gattserverdisconnected', () => {
                console.log('Scanner disconnected');
                setIsConnected(false);
                setConnectionStatus('disconnected');
                setConnectedDevice(null);
                setIsScannerActive(false);
              });
            }
            
            toast({
              title: "Scanner Connected",
              description: `Connected to ${device.name || 'Bluetooth Scanner'}. Scanner is now ready for use.`,
            });
            return;
          }
        } catch (bluetoothError) {
          console.log('Web Bluetooth connection failed:', bluetoothError);
          
          if (bluetoothError instanceof Error) {
            if (bluetoothError.name === 'NotFoundError') {
              toast({
                title: "No Scanner Found",
                description: "No scanner found in pairing mode. Make sure your Zebra scanner is discoverable and try again.",
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
                description: "Failed to connect via Bluetooth. Falling back to keyboard wedge mode.",
                variant: "destructive",
              });
            }
          }
        }
      } else {
        toast({
          title: "Bluetooth Not Supported",
          description: "Your browser doesn't support Web Bluetooth. Using keyboard wedge mode instead.",
          variant: "destructive",
        });
      }
      
      // Fallback to keyboard wedge mode
      setIsConnected(true);
      setConnectionStatus('connected');
      toast({
        title: "Scanner Ready (Keyboard Mode)",
        description: "Scanner ready in keyboard wedge mode. Make sure your Zebra scanner is paired via Bluetooth settings and set to keyboard wedge mode.",
      });
      
    } catch (error) {
      console.error('Scanner connection failed:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Could not connect to scanner. Please check Bluetooth pairing and scanner settings.",
        variant: "destructive",
      });
    }
  }, []);

  const handleBarcodeScan = useCallback((barcode: string) => {
    const now = Date.now();
    // Prevent duplicate scans within 1 second
    if (now - lastScanTime < 1000) {
      console.log('Duplicate scan prevented:', barcode);
      return;
    }
    setLastScanTime(now);

    console.log("Processing scanned barcode:", barcode);
    
    // Clean the barcode - remove any extra characters
    const cleanBarcode = barcode.trim();
    
    if (!cleanBarcode) {
      console.log('Empty barcode, skipping');
      return;
    }
    
    // Try to find item by barcode first (exact match), then SKU, then name
    const foundItem = items.find(item => {
      // First try exact barcode match
      if (item.barcode && item.barcode === cleanBarcode) {
        return true;
      }
      // Then try SKU match
      if (item.sku && item.sku === cleanBarcode) {
        return true;
      }
      // Finally try name contains (case insensitive)
      if (item.name && item.name.toLowerCase().includes(cleanBarcode.toLowerCase())) {
        return true;
      }
      return false;
    });

    if (foundItem) {
      // Item found - increment quantity
      updateItem(foundItem.id, {
        quantity: foundItem.quantity + 1
      });
      
      toast({
        title: "Item Scanned Successfully",
        description: `${foundItem.name} - Quantity updated to ${foundItem.quantity + 1}`,
      });
      
      console.log(`Item found and updated: ${foundItem.name}, new quantity: ${foundItem.quantity + 1}`);
    } else {
      // Item not found
      toast({
        title: "Item Not Found",
        description: `No item found with barcode: ${cleanBarcode}`,
        variant: "destructive",
      });
      
      console.log(`No item found for barcode: ${cleanBarcode}`);
    }
  }, [items, updateItem, lastScanTime]);

  // Enhanced keyboard event handling for better barcode scanning
  useEffect(() => {
    if (!isScannerActive || !isConnected) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent handling if user is typing in an input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Handle Enter key - process the accumulated barcode
      if (event.key === 'Enter') {
        event.preventDefault();
        if (scanBuffer.length > 0) {
          console.log('Processing scanned barcode from buffer:', scanBuffer);
          handleBarcodeScan(scanBuffer);
          setScanBuffer(""); // Clear buffer after processing
        }
        return;
      }

      // Handle printable characters (build barcode string)
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        setScanBuffer(prev => prev + event.key);
        
        // Auto-clear buffer after 500ms of inactivity (faster than before)
        setTimeout(() => {
          setScanBuffer(current => {
            if (current.includes(event.key)) {
              return ""; // Clear if this character is still in buffer
            }
            return current;
          });
        }, 500);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isScannerActive, isConnected, scanBuffer, handleBarcodeScan]);

  const toggleScanner = useCallback(async () => {
    if (!isScannerActive) {
      if (!isConnected) {
        await connectScanner();
      }
      setIsScannerActive(true);
      setScanBuffer(""); // Clear buffer when starting
    } else {
      setIsScannerActive(false);
      setScanBuffer(""); // Clear buffer when stopping
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
    setScanBuffer(""); // Clear buffer on disconnect
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
