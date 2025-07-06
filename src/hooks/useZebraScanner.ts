
import { useState, useCallback } from "react";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { toast } from "@/hooks/use-toast";

export const useZebraScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  const { data: items = [] } = useInventoryItems();

  const handleBarcodeScan = useCallback((barcode: string) => {
    console.log("Scanned barcode:", barcode);
    setLastScannedBarcode(barcode);
    
    // Try to find item by barcode first, then by SKU
    const foundItem = items.find(item => 
      item.barcode === barcode || 
      item.sku === barcode
    );

    if (foundItem) {
      toast({
        title: "Item Found",
        description: `Found: ${foundItem.name} (Barcode: ${foundItem.barcode || foundItem.sku})`,
      });
      
      // Return the found item for further processing
      return foundItem;
    } else {
      toast({
        title: "Item Not Found",
        description: `No item found with barcode: ${barcode}`,
        variant: "destructive",
      });
      return null;
    }
  }, [items]);

  const toggleScanner = useCallback(() => {
    setIsScannerActive(prev => !prev);
  }, []);

  return {
    isScannerActive,
    toggleScanner,
    handleBarcodeScan,
    lastScannedBarcode,
    setLastScannedBarcode,
  };
};
