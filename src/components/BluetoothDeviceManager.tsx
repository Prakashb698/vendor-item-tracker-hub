
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, Loader2, Check, AlertCircle, Refresh } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

const BluetoothDeviceManager = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  useEffect(() => {
    // Check if Web Bluetooth API is supported
    if ('bluetooth' in navigator) {
      setIsBluetoothSupported(true);
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
      // Simulate scanning for demo purposes
      // In real implementation, you would use navigator.bluetooth.requestDevice()
      setTimeout(() => {
        const mockDevices: BluetoothDevice[] = [
          { id: "1", name: "Zebra DS2278", connected: false },
          { id: "2", name: "Zebra LI3678", connected: false },
          { id: "3", name: "Generic Bluetooth Scanner", connected: false },
        ];
        setDevices(mockDevices);
        setIsScanning(false);
        
        toast({
          title: "Scan Complete",
          description: `Found ${mockDevices.length} Bluetooth devices`,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      setIsScanning(false);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for Bluetooth devices",
        variant: "destructive",
      });
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      // Simulate connection process
      toast({
        title: "Connecting...",
        description: `Connecting to ${device.name}`,
      });

      // Simulate connection delay
      setTimeout(() => {
        setDevices(prev => 
          prev.map(d => 
            d.id === device.id 
              ? { ...d, connected: true }
              : { ...d, connected: false } // Disconnect others
          )
        );
        
        toast({
          title: "Connected Successfully! 🎉",
          description: `${device.name} is now connected and ready to use`,
          duration: 5000,
        });
      }, 1500);
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${device.name}`,
        variant: "destructive",
      });
    }
  };

  const disconnectDevice = (device: BluetoothDevice) => {
    setDevices(prev => 
      prev.map(d => 
        d.id === device.id 
          ? { ...d, connected: false }
          : d
      )
    );
    
    toast({
      title: "Disconnected",
      description: `${device.name} has been disconnected`,
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Scan for and connect to Bluetooth devices
          </p>
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
                <Refresh className="h-4 w-4 mr-2" />
                Scan for Devices
              </>
            )}
          </Button>
        </div>

        {devices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Available Devices:</h4>
            {devices.map((device) => (
              <div 
                key={device.id}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div className="flex items-center gap-3">
                  <Bluetooth className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-gray-500">Bluetooth Device</div>
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
                    className={device.connected ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-blue-600 hover:bg-blue-700"}
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
          <strong>Tips:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Make sure your Zebra scanner is in pairing mode</li>
            <li>• Keep the scanner close to your computer during pairing</li>
            <li>• Once connected, test scanning to ensure proper setup</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BluetoothDeviceManager;
