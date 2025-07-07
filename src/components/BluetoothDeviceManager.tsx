
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
      console.log('Starting Bluetooth device scan...');
      
      // Request Bluetooth device with better filters for scanners
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'generic_access',
          'generic_attribute',
          'device_information',
          'battery_service',
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information Service
          '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
          '00001801-0000-1000-8000-00805f9b34fb'  // Generic Attribute
        ]
      });

      console.log('Found Bluetooth device:', device.name, 'ID:', device.id);

      // Check if device already exists in the list
      const existingDeviceIndex = devices.findIndex(d => d.id === device.id);
      
      const newDevice: BluetoothDeviceInfo = {
        id: device.id,
        name: device.name || 'Unknown Device',
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
          description: `Updated: ${device.name || 'Unknown Device'}`,
        });
      } else {
        // Add new device
        setDevices(prev => [...prev, newDevice]);
        toast({
          title: "Device Found",
          description: `Found: ${device.name || 'Unknown Device'}`,
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
          title: "Device Disconnected",
          description: `${device.name || 'Unknown Device'} was disconnected`,
          variant: "destructive",
        });
      });

    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      
      if (error.name === 'NotFoundError') {
        toast({
          title: "No Device Selected",
          description: "Please select a Bluetooth device from the browser popup to continue",
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
          description: `Failed to scan for Bluetooth devices: ${error.message}`,
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
          Bluetooth Device Manager
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
              <strong>How to connect:</strong>
              <ol className="mt-1 space-y-1 text-xs list-decimal list-inside">
                <li>Click "Scan for Devices" below</li>
                <li>Select your scanner from the browser popup</li>
                <li>Click "Connect" next to the device</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {devices.length > 0 
              ? `Found ${devices.length} device${devices.length > 1 ? 's' : ''}`
              : "No devices found yet"
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
                  Scan for Devices
                </>
              )}
            </Button>
          </div>
        </div>

        {devices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Available Devices:</h4>
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
            <p className="text-sm">No devices found. Click "Scan for Devices" to search.</p>
          </div>
        )}

        <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
          <strong>Troubleshooting Tips:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Make sure your Zebra scanner is in pairing/discoverable mode</li>
            <li>• Keep the scanner close to your computer during pairing</li>
            <li>• If the browser popup appears, select your scanner from the list</li>
            <li>• Try turning Bluetooth off and on if devices don't appear</li>
            <li>• Some scanners may appear with generic names like "HID Device"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BluetoothDeviceManager;
