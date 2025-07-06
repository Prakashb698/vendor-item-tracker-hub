
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Usb, 
  Bluetooth, 
  Wifi, 
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import BluetoothDeviceManager from "./BluetoothDeviceManager";
import WifiDeviceManager from "./WifiDeviceManager";
import UsbDeviceManager from "./UsbDeviceManager";

const ZebraScannerHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showBluetoothManager, setShowBluetoothManager] = useState(false);
  const [showWifiManager, setShowWifiManager] = useState(false);
  const [showUsbManager, setShowUsbManager] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleBluetoothClick = () => {
    setShowBluetoothManager(!showBluetoothManager);
    setShowWifiManager(false);
    setShowUsbManager(false);
  };

  const handleWifiClick = () => {
    setShowWifiManager(!showWifiManager);
    setShowBluetoothManager(false);
    setShowUsbManager(false);
  };

  const handleUsbClick = () => {
    setShowUsbManager(!showUsbManager);
    setShowBluetoothManager(false);
    setShowWifiManager(false);
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Zebra Scanner Setup Guide</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <CardContent className="space-y-4 p-0">
              
              {/* Connection Methods */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Connection Methods
                </h3>
                
                <div className="grid gap-3 md:grid-cols-3">
                  <div 
                    className="flex items-center gap-2 p-3 bg-white rounded border cursor-pointer hover:bg-red-50 transition-colors"
                    onClick={handleUsbClick}
                  >
                    <Usb className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">USB Cable</div>
                      <div className="text-xs text-gray-600">Click to manage</div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center gap-2 p-3 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={handleBluetoothClick}
                  >
                    <Bluetooth className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Bluetooth</div>
                      <div className="text-xs text-gray-600">Click to manage</div>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center gap-2 p-3 bg-white rounded border cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={handleWifiClick}
                  >
                    <Wifi className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Wi-Fi</div>
                      <div className="text-xs text-gray-600">Click to manage</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Managers */}
              {showUsbManager && (
                <div className="space-y-3">
                  <UsbDeviceManager />
                </div>
              )}

              {showBluetoothManager && (
                <div className="space-y-3">
                  <BluetoothDeviceManager />
                </div>
              )}

              {showWifiManager && (
                <div className="space-y-3">
                  <WifiDeviceManager />
                </div>
              )}

              {/* Setup Steps */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection('setup')}
                  className="w-full justify-between p-2 h-auto hover:bg-gray-50"
                >
                  <span className="font-medium">Step-by-Step Setup</span>
                  {activeSection === 'setup' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                
                {activeSection === 'setup' && (
                  <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center">1</Badge>
                      <div>
                        <div className="font-medium">Connect Your Scanner</div>
                        <div className="text-sm text-gray-600">Plug USB cable or pair via Bluetooth</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center">2</Badge>
                      <div>
                        <div className="font-medium">Configure Keyboard Wedge Mode</div>
                        <div className="text-sm text-gray-600">Scan the configuration barcode below</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center">3</Badge>
                      <div>
                        <div className="font-medium">Test the Scanner</div>
                        <div className="text-sm text-gray-600">Activate scanner above and scan any barcode</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration Barcodes */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection('config')}
                  className="w-full justify-between p-2 h-auto hover:bg-gray-50"
                >
                  <span className="font-medium">Configuration Barcodes</span>
                  {activeSection === 'config' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                
                {activeSection === 'config' && (
                  <div className="space-y-4 pl-4 border-l-2 border-green-200">
                    <div className="bg-white p-4 rounded border">
                      <div className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Enable Keyboard Wedge Mode
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded font-mono text-lg tracking-wider">
                        ||||| ||| || ||||| |||| |||||
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Scan this barcode to enable keyboard wedge mode</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border">
                      <div className="font-medium mb-2">Add Enter Suffix</div>
                      <div className="text-center p-4 bg-gray-50 rounded font-mono text-lg tracking-wider">
                        ||| ||||| || ||| ||||| ||||
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Adds Enter key after each scan</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Troubleshooting */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection('troubleshoot')}
                  className="w-full justify-between p-2 h-auto hover:bg-gray-50"
                >
                  <span className="font-medium">Troubleshooting</span>
                  {activeSection === 'troubleshoot' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                
                {activeSection === 'troubleshoot' && (
                  <div className="space-y-3 pl-4 border-l-2 border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                      <div>
                        <div className="font-medium">Scanner not responding?</div>
                        <div className="text-sm text-gray-600">
                          • Check USB connection<br/>
                          • Try a different USB port<br/>
                          • Restart your computer
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                      <div>
                        <div className="font-medium">Scans not appearing?</div>
                        <div className="text-sm text-gray-600">
                          • Ensure keyboard wedge mode is enabled<br/>
                          • Click in this browser window first<br/>
                          • Try scanning the configuration barcodes above
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-1" />
                      <div>
                        <div className="font-medium">Bluetooth connection issues?</div>
                        <div className="text-sm text-gray-600">
                          • Use the Bluetooth manager above<br/>
                          • Ensure scanner is in discoverable mode<br/>
                          • Check battery level
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Quick Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Keep the scanner 6-12 inches from barcodes</li>
                  <li>• Ensure good lighting for better scanning</li>
                  <li>• Clean the scanner lens regularly</li>
                  <li>• Test with different barcode types if having issues</li>
                </ul>
              </div>

            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default ZebraScannerHelp;
