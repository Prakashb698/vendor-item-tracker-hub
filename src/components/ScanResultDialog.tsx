
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/store/inventoryStore";
import { Package, MapPin, Building, DollarSign, Hash, Barcode, Calendar, AlertCircle } from "lucide-react";

interface ScanResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  scannedBarcode: string;
}

const ScanResultDialog = ({ open, onOpenChange, item, scannedBarcode }: ScanResultDialogProps) => {
  if (!item) {
    // Item not found
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Item Not Found
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-gray-600 mb-2">
                No item found in inventory with barcode:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {scannedBarcode}
              </code>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Item found - show details
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Package className="h-5 w-5" />
            Item Found
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            {/* Item Name and Category */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <Badge variant="secondary">{item.category}</Badge>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-gray-600 text-sm">{item.description}</p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Price:</span>
                <span>${item.price.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Quantity:</span>
                <span>{item.quantity}</span>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-600" />
                <span className="font-medium">SKU:</span>
                <span className="font-mono text-xs">{item.sku}</span>
              </div>

              {item.barcode && (
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Barcode:</span>
                  <span className="font-mono text-xs">{item.barcode}</span>
                </div>
              )}

              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Location:</span>
                  <span>{item.location}</span>
                </div>
              )}

              {item.vendor && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Vendor:</span>
                  <span>{item.vendor}</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stock Status:</span>
                <Badge 
                  variant={item.quantity <= item.lowStockThreshold ? "destructive" : "default"}
                  className={item.quantity <= item.lowStockThreshold ? "" : "bg-green-500"}
                >
                  {item.quantity <= item.lowStockThreshold ? "Low Stock" : "In Stock"}
                </Badge>
              </div>
              {item.quantity <= item.lowStockThreshold && (
                <p className="text-xs text-red-600 mt-1">
                  Below threshold of {item.lowStockThreshold} units
                </p>
              )}
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanResultDialog;
