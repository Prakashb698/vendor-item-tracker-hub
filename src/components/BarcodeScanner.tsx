
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, X, Check, Bluetooth, BluetoothConnected, Settings } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onToggle: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const BarcodeScanner = ({ 
  onScan, 
  isActive, 
  isConnected, 
  connectionStatus, 
  onToggle, 
  onConnect, 
  onDisconnect 
}: BarcodeScannerProps) => {
  const [lastScanned, setLastScanned] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !isConnected) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent handling if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Zebra scanners typically send data followed by Enter
      if (event.key === 'Enter' && lastScanned.length > 0) {
        event.preventDefault();
        onScan(lastScanned);
        setScanCount(prev => prev + 1);
        setLastScanned("");
      } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Build up the barcode string
        event.preventDefault();
        setLastScanned(prev => prev + event.key);
      }
    };

    // Clear any partial scans after 2 seconds of inactivity
    const clearTimer = setTimeout(() => {
      setLastScanned("");
    }, 2000);

    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(clearTimer);
    };
  }, [isActive, isConnected, lastScanned, onScan]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Bluetooth className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'connected':
        return <BluetoothConnected className="h-5 w-5 text-green-600" />;
      default:
        return <Bluetooth className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'border-yellow-200 bg-yellow-50/30';
      case 'connected':
        return 'border-green-200 bg-green-50/30';
      default:
        return 'border-gray-200 bg-gray-50/30';
    }
  };

  return (
    <Card className={`border-2 border-dashed ${getConnectionColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getConnectionIcon()}
            Zebra Scanner
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'} 
              className={connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : ''}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            
            {!isConnected && (
              <Button
                onClick={onConnect}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Bluetooth className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
            
            {isConnected && (
              <>
                <Button
                  onClick={onToggle}
                  variant={isActive ? "outline" : "default"}
                  size="sm"
                  className={isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isActive ? <X className="h-4 w-4" /> : <Scan className="h-4 w-4" />}
                  {isActive ? "Stop" : "Start"}
                </Button>
                
                <Button
                  onClick={onDisconnect}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-4">
            <div className="mb-4">
              <Bluetooth className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Scanner Not Connected</p>
              <p className="text-sm text-gray-600">Click "Connect" to pair your Zebra scanner</p>
            </div>
            <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-700">Pairing Instructions:</p>
              <p>• Power on your Zebra scanner</p>
              <p>• Make sure it's in pairing mode (check scanner manual)</p>
              <p>• Or pair it manually via system Bluetooth settings first</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-blue-600">
                <Settings className="h-3 w-3" />
                <span className="text-xs">Scanner should be set to keyboard wedge mode</span>
              </div>
            </div>
          </div>
        ) : isActive ? (
          <div className="text-center py-4">
            <div className="animate-pulse">
              <Scan className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">Scanner Ready</p>
              <p className="text-sm text-gray-600">Scan a barcode with your Zebra scanner</p>
            </div>
            {lastScanned && (
              <div className="mt-4 p-2 bg-yellow-100 rounded text-sm">
                Reading: {lastScanned}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Scanner connected but inactive</p>
            <p className="text-xs text-gray-500 mt-1">
              Click "Start" to begin scanning
            </p>
          </div>
        )}
        
        {scanCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            <span>Scanned {scanCount} item{scanCount !== 1 ? 's' : ''} this session</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
