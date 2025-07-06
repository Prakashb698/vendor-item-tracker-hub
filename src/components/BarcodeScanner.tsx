
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ZebraScannerHelp from "./ZebraScannerHelp";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const BarcodeScanner = ({ onScan, isActive, onToggle }: BarcodeScannerProps) => {
  const [lastScanned, setLastScanned] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Zebra scanners typically send data followed by Enter
      if (event.key === 'Enter' && lastScanned.length > 0) {
        onScan(lastScanned);
        setScanCount(prev => prev + 1);
        toast({
          title: "Barcode Scanned",
          description: `Scanned: ${lastScanned}`,
        });
        setLastScanned("");
      } else if (event.key.length === 1) {
        // Build up the barcode string
        setLastScanned(prev => prev + event.key);
      }
    };

    // Clear any partial scans after 1 second of inactivity
    const clearTimer = setTimeout(() => {
      setLastScanned("");
    }, 1000);

    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(clearTimer);
    };
  }, [isActive, lastScanned, onScan]);

  return (
    <div className="space-y-4">
      {/* Help Guide */}
      <ZebraScannerHelp />
      
      {/* Scanner Interface */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="h-5 w-5 text-blue-600" />
              Zebra Scanner
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              <Button
                onClick={onToggle}
                variant={isActive ? "outline" : "default"}
                size="sm"
                className={isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isActive ? <X className="h-4 w-4" /> : <Scan className="h-4 w-4" />}
                {isActive ? "Stop" : "Start"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isActive ? (
            <div className="text-center py-4">
              <div className="animate-pulse">
                <Scan className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">Scanner Ready</p>
                <p className="text-sm text-gray-600">Scan a barcode with your Zebra scanner</p>
              </div>
              {lastScanned && (
                <div className="mt-4 p-2 bg-yellow-100 rounded text-sm">
                  Building scan: {lastScanned}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Click "Start" to activate scanner</p>
              <p className="text-xs text-gray-500 mt-1">
                Make sure your Zebra scanner is connected and configured in keyboard wedge mode
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
    </div>
  );
};

export default BarcodeScanner;
