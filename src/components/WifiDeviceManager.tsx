
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WifiDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  signal: number;
  secured: boolean;
}

const WifiDeviceManager = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<WifiDeviceInfo[]>([]);
  const [isWifiSupported, setIsWifiSupported] = useState(false);

  useEffect(() => {
    // Check if the device supports Wi-Fi scanning (limited browser support)
    setIsWifiSupported(true); // Most devices support Wi-Fi
  }, []);

  const scanForDevices = async () => {
    setIsScanning(true);
    
    try {
      console.log('Scanning for Wi-Fi networks...');
      
      // Simulate Wi-Fi network discovery
      setTimeout(() => {
        const mockNetworks: WifiDeviceInfo[] = [
          { id: '1', name: 'ZebraScanner_AB123', connected: false, signal: 85, secured: true },
          { id: '2', name: 'ZebraDevice_XY456', connected: false, signal: 72, secured: true },
          { id: '3', name: 'Scanner_Network', connected: false, signal: 60, secured: false },
        ];
        
        setDevices(mockNetworks);
        setIsScanning(false);
        
        toast({
          title: "Networks Found",
          description: `Found ${mockNetworks.length} Zebra scanner networks`,
        });
      }, 2000);

    } catch (error) {
      console.error('Wi-Fi scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for Wi-Fi networks. Make sure Wi-Fi is enabled.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const connectToNetwork = async (deviceInfo: WifiDeviceInfo) => {
    try {
      toast({
        title: "Connecting...",
        description: `Connecting to ${deviceInfo.name}`,
      });

      console.log('Connecting to Wi-Fi network:', deviceInfo.name);

      // Simulate connection process
      setTimeout(() => {
        setDevices(prev => 
          prev.map(d => 
            d.id === deviceInfo.id 
              ? { ...d, connected: true }
              : { ...d, connected: false }
          )
        );
        
        toast({
          title: "Connected Successfully! 🎉",
          description: `${deviceInfo.name} is now connected and ready to use`,
          duration: 5000,
        });

        console.log('Successfully connected to:', deviceInfo.name);
      }, 1500);
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${deviceInfo.name}. Check network credentials.`,
        variant: "destructive",
      });
    }
  };

  const disconnectNetwork = async (deviceInfo: WifiDeviceInfo) => {
    try {
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceInfo.id 
            ? { ...d, connected: false }
            : d
        )
      );
      
      toast({
        title: "Disconnected",
        description: `${deviceInfo.name} has been disconnected`,
      });

      console.log('Disconnected from:', deviceInfo.name);
      
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: "Error disconnecting from network",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-600" />
          Wi-Fi Device Manager
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Scan for and connect to Zebra scanner Wi-Fi networks
          </p>
          <Button
            onClick={scanForDevices}
            disabled={isScanning}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Networks
              </>
            )}
          </Button>
        </div>

        {devices.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Available Networks:</h4>
            {devices.map((device) => (
              <div 
                key={device.id}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {device.name}
                      {device.secured && <span className="text-xs text-gray-500">🔒</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Signal: {device.signal}% • {device.secured ? 'Secured' : 'Open'}
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
                    onClick={() => device.connected ? disconnectNetwork(device) : connectToNetwork(device)}
                    size="sm"
                    variant={device.connected ? "outline" : "default"}
                    className={device.connected ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
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
            <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No networks found. Click "Scan Networks" to search.</p>
          </div>
        )}

        <div className="bg-green-100 p-3 rounded text-sm text-green-800">
          <strong>Wi-Fi Setup Tips:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Configure your Zebra scanner in Wi-Fi mode first</li>
            <li>• Ensure scanner and computer are on the same network</li>
            <li>• Note the scanner's IP address for configuration</li>
            <li>• Test connectivity after successful connection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WifiDeviceManager;
