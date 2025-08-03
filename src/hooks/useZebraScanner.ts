
import { useState, useCallback, useEffect } from "react";
import { useUserInventory } from "@/hooks/useUserInventory";
import { toast } from "@/hooks/use-toast";

interface BluetoothNavigator extends Navigator {
  bluetooth?: {
    getDevices?(): Promise<BluetoothDevice[]>;
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    getAvailability?(): Promise<boolean>;
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
  const { items } = useUserInventory();

  // Check if Web Bluetooth is supported
  const isWebBluetoothSupported = useCallback(() => {
    const bluetoothNav = navigator as BluetoothNavigator;
    return 'bluetooth' in navigator && bluetoothNav.bluetooth;
  }, []);

  // Check for Zebra scanner connection
  const checkScannerConnection = useCallback(async () => {
    try {
      const bluetoothNav = navigator as BluetoothNavigator;
      
      // Check if Web Bluetooth is supported
      if (isWebBluetoothSupported() && bluetoothNav.bluetooth) {
        try {
          // Check if getDevices method exists before calling it
          if (bluetoothNav.bluetooth.getDevices) {
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
          } else {
            console.log('getDevices method not available, using keyboard wedge mode');
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
  }, [isWebBluetoothSupported]);

  const connectScanner = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      const bluetoothNav = navigator as BluetoothNavigator;
      
      // Try to connect via Web Bluetooth first if supported
      if (isWebBluetoothSupported() && bluetoothNav.bluetooth) {
        try {
          console.log('Attempting Bluetooth connection...');
          
          // First check if Bluetooth is available
          if (bluetoothNav.bluetooth.getAvailability) {
            const isAvailable = await bluetoothNav.bluetooth.getAvailability();
            if (!isAvailable) {
              throw new Error('Bluetooth not available');
            }
          }
          
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
            await device.gatt.connect();
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
        description: "Scanner ready in keyboard wedge mode. Make sure your Zebra scanner is paired via system Bluetooth settings and set to keyboard wedge mode.",
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
  }, [isWebBluetoothSupported]);

  const handleBarcodeScan = useCallback((barcode: string, onScanResult?: (item: any | null, scannedBarcode: string) => void) => {
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

    // If onScanResult callback is provided, use it instead of the default behavior
    if (onScanResult) {
      onScanResult(foundItem || null, cleanBarcode);
      return;
    }

    // Default behavior (legacy - for backward compatibility)
    if (foundItem) {
      toast({
        title: "Item Found",
        description: `${foundItem.name} - Found in inventory`,
      });
      
      console.log(`Item found: ${foundItem.name}`);
    } else {
      toast({
        title: "Item Not Found",
        description: `No item found with barcode: ${cleanBarcode}`,
        variant: "destructive",
      });
      
      console.log(`No item found for barcode: ${cleanBarcode}`);
    }
  }, [items, lastScanTime]);

  // Enhanced keyboard event handling for better barcode scanning
  useEffect(() => {
    if (!isScannerActive || !isConnected) return;

    let bufferTimer: NodeJS.Timeout;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle barcode scanning when NOT in form inputs
      const target = event.target as HTMLElement;
      const isFormInput = target instanceof HTMLInputElement || 
                         target instanceof HTMLTextAreaElement ||
                         target instanceof HTMLSelectElement;
      
      // Skip if user is typing in form fields
      if (isFormInput) {
        // Check if this is specifically a barcode input field
        const isBarcodeField = target.id === 'barcode' || 
                              (target instanceof HTMLInputElement && 
                               (target.placeholder?.toLowerCase().includes('barcode') ||
                                target.placeholder?.toLowerCase().includes('scan')));
        
        if (!isBarcodeField) {
          return; // Don't interfere with other form inputs
        }
      }

      // Handle Enter key - process the accumulated barcode
      if (event.key === 'Enter') {
        event.preventDefault();
        if (scanBuffer.length > 0) {
          console.log('Processing scanned barcode from buffer:', scanBuffer);
          handleBarcodeScan(scanBuffer);
          setScanBuffer("");
          if (bufferTimer) clearTimeout(bufferTimer);
        }
        return;
      }

      // Handle printable characters (build barcode string) - only when not in form inputs
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !isFormInput) {
        event.preventDefault();
        setScanBuffer(prev => prev + event.key);
        
        // Clear buffer timer and set new one
        if (bufferTimer) clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => {
          setScanBuffer("");
        }, 1000); // Clear buffer after 1 second of inactivity
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (bufferTimer) clearTimeout(bufferTimer);
    };
  }, [isScannerActive, isConnected, scanBuffer, handleBarcodeScan]);

  const toggleScanner = useCallback(async () => {
    if (!isScannerActive) {
      if (!isConnected) {
        await connectScanner();
      }
      setIsScannerActive(true);
      setScanBuffer("");
    } else {
      setIsScannerActive(false);
      setScanBuffer("");
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
    setScanBuffer("");
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
