
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, Loader2, Check, AlertCircle, RefreshCw, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  device?: BluetoothDevice;
}

const BluetoothDeviceManager = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDeviceInfo[]>([]);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Check if Web Bluetooth API is supported
    if ('bluetooth' in navigator) {
      setIsBluetoothSupported(true);
      console.log('Web Bluetooth API is supported');
    } else {
      console.log('Web Bluetooth API is not supported');
    }
  }, []);

  const scanForDevices = async () => {
    if (!isBluetoothSupported) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API. Try using Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      console.log('Starting Bluetooth device scan for Zebra scanners...');
      
      // Enhanced filters specifically for Zebra scanners and barcode scanners
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          // Zebra Technologies filters
          { namePrefix: "Zebra" },
          { namePrefix: "zebra" },
          { namePrefix: "ZEBRA" },
          { namePrefix: "DS" }, // Common Zebra scanner prefix
          { namePrefix: "LI" }, // Common Zebra scanner prefix
          { namePrefix: "MT" }, // Mobile Terminal prefix
          { namePrefix: "TC" }, // Touch Computer prefix
          { namePrefix: "Symbol" }, // Symbol Technologies (now Zebra)
          
          // Generic HID and barcode scanner filters
          { namePrefix: "Scanner" },
          { namePrefix: "Barcode" },
          { namePrefix: "HID" },
          { namePrefix: "Keyboard" }, // Many scanners appear as keyboards
          
          // Common manufacturer filters
          { namePrefix: "Honeywell" },
          { namePrefix: "Datalogic" },
          { namePrefix: "CODE" },
          
          // Service-based filters for HID devices
          { services: ['00001812-0000-1000-8000-00805f9b34fb'] }, // HID Service
          { services: ['0000180f-0000-1000-8000-00805f9b34fb'] }, // Battery Service
        ],
        optionalServices: [
          // HID Services
          '00001812-0000-1000-8000-00805f9b34fb', // HID Service
          '00001813-0000-1000-8000-00805f9b34fb', // Scan Parameters Service
          
          // Standard services
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information Service
          '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
          '00001801-0000-1000-8000-00805f9b34fb', // Generic Attribute
          
          // Additional services that scanners might use
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Custom service used by some scanners
        ]
      });

      console.log('Found Bluetooth device:', device.name, 'ID:', device.id);

      // Check if device already exists in the list
      const existingDeviceIndex = devices.findIndex(d => d.id === device.id);
      
      const newDevice: BluetoothDeviceInfo = {
        id: device.id,
        name: device.name || 'Unknown Scanner',
        connected: false,
        device: device
      };

      if (existingDeviceIndex >= 0) {
        // Update existing device
        setDevices(prev => 
          prev.map((d, index) => 
            index === existingDeviceIndex ? { ...newDevice, connected: d.connected } : d
          )
        );
        toast({
          title: "Device Updated",
          description: `Updated: ${device.name || 'Unknown Scanner'}`,
        });
      } else {
        // Add new device
        setDevices(prev => [...prev, newDevice]);
        toast({
          title: "Scanner Found! 🎉",
          description: `Found: ${device.name || 'Unknown Scanner'}`,
        });
      }

      // Add disconnect listener
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected:', device.name);
        setDevices(prev => 
          prev.map(d => 
            d.id === device.id ? { ...d, connected: false } : d
          )
        );
        setConnectedDeviceId(null);
        toast({
          title: "Scanner Disconnected",
          description: `${device.name || 'Unknown Scanner'} was disconnected`,
          variant: "destructive",
        });
      });

    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      
      if (error.name === 'NotFoundError') {
        toast({
          title: "No Scanner Selected",
          description: "Please select your Zebra scanner from the browser popup. If you don't see it, try putting your scanner in pairing mode.",
          variant: "destructive",
        });
      } else if (error.name === 'NotAllowedError') {
        toast({
          title: "Permission Denied",
          description: "Bluetooth access was denied. Please allow Bluetooth permissions and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan Failed",
          description: `Failed to find scanner: ${error.message}. Make sure your scanner is in pairing mode.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceInfo: BluetoothDeviceInfo) => {
    if (!deviceInfo.device) {
      toast({
        title: "Connection Failed",
        description: "Device information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Connecting to device:', deviceInfo.name);

      // Show connecting toast
      toast({
        title: "Connecting...",
        description: `Connecting to ${deviceInfo.name}`,
      });

      // Connect to GATT server
      const server = await deviceInfo.device.gatt?.connect();
      
      if (server?.connected) {
        // Disconnect all other devices first
        devices.forEach(async (d) => {
          if (d.id !== deviceInfo.id && d.connected && d.device?.gatt?.connected) {
            try {
              d.device.gatt.disconnect();
            } catch (err) {
              console.log('Error disconnecting other device:', err);
            }
          }
        });

        // Update device states
        setDevices(prev => 
          prev.map(d => ({
            ...d,
            connected: d.id === deviceInfo.id
          }))
        );
        
        setConnectedDeviceId(deviceInfo.id);
        
        toast({
          title: "Connected Successfully! 🎉",
          description: `${deviceInfo.name} is now connected and ready to use`,
          duration: 5000,
        });

        console.log('Successfully connected to:', deviceInfo.name);
      } else {
        throw new Error('Failed to establish GATT connection');
      }
      
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${deviceInfo.name}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const disconnectDevice = async (deviceInfo: BluetoothDeviceInfo) => {
    try {
      if (deviceInfo.device?.gatt?.connected) {
        deviceInfo.device.gatt.disconnect();
      }
      
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceInfo.id 
            ? { ...d, connected: false }
            : d
        )
      );
      
      setConnectedDeviceId(null);
      
      toast({
        title: "Disconnected",
        description: `${deviceInfo.name} has been disconnected`,
      });

      console.log('Disconnected from:', deviceInfo.name);
      
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: `Error disconnecting device: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const clearDeviceList = () => {
    // Disconnect all connected devices first
    devices.forEach(device => {
      if (device.connected && device.device?.gatt?.connected) {
        try {
          device.device.gatt.disconnect();
        } catch (err) {
          console.log('Error disconnecting device during clear:', err);
        }
      }
    });
    
    setDevices([]);
    setConnectedDeviceId(null);
    toast({
      title: "Device List Cleared",
      description: "All devices have been removed from the list",
    });
  };

  if (!isBluetoothSupported) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Bluetooth not supported in this browser. Use Chrome or Edge for best results.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bluetooth className="h-5 w-5 text-blue-600" />
          Bluetooth Scanner Manager
          {connectedDeviceId && (
            <Badge className="bg-green-500 text-white">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <div>
              <strong>Scanner Setup Instructions:</strong>
              <ol className="mt-1 space-y-1 text-xs list-decimal list-inside">
                <li>Put your Zebra scanner in <strong>pairing/discoverable mode</strong></li>
                <li>Click "Scan for Scanners" below</li>
                <li>Select your scanner from the browser popup (look for "Zebra", "DS", "Scanner", or "HID")</li>
                <li>Click "Connect" to establish connection</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {devices.length > 0 
              ? `Found ${devices.length} scanner${devices.length > 1 ? 's' : ''}`
              : "No scanners found yet"
            }
          </p>
          <div className="flex gap-2">
            {devices.length > 0 && (
              <Button
                onClick={clearDeviceList}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear List
              </Button>
            )}
            <Button
              onClick={scanForDevices}
              disabled={isScanning}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan for Scanners
                </>
              )}
            </Button>
          </div>
        </div>

        {devices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Available Scanners:</h4>
            {devices.map((device) => (
              <div 
                key={device.id}
                className={`flex items-center justify-between p-3 bg-white rounded border ${
                  device.connected ? 'border-green-300 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bluetooth className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-gray-500">
                      ID: {device.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={device.connected ? "default" : "secondary"}
                    className={device.connected ? "bg-green-500" : ""}
                  >
                    {device.connected ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      "Not Connected"
                    )}
                  </Badge>
                  
                  <Button
                    onClick={() => device.connected ? disconnectDevice(device) : connectToDevice(device)}
                    size="sm"
                    variant={device.connected ? "outline" : "default"}
                    className={device.connected 
                      ? "text-red-600 border-red-200 hover:bg-red-50" 
                      : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {device.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {devices.length === 0 && !isScanning && (
          <div className="text-center py-4 text-gray-500">
            <Bluetooth className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No scanners found. Make sure your scanner is in pairing mode and click "Scan for Scanners".</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
          <strong>⚠️ Important Notes:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Your scanner must be in <strong>pairing/discoverable mode</strong> to be detected</li>
            <li>• Look for device names like "Zebra", "DS2278", "Scanner", "HID Device", or similar</li>
            <li>• If your scanner doesn't appear, try:</li>
            <li>&nbsp;&nbsp;- Turning Bluetooth off/on on your computer</li>
            <li>&nbsp;&nbsp;- Restarting your scanner</li>
            <li>&nbsp;&nbsp;- Using a different browser (Chrome/Edge work best)</li>
            <li>• Some scanners may require specific pairing procedures - check your manual</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BluetoothDeviceManager;
