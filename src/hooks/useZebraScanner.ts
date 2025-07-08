
import { useState, useCallback } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { toast } from "@/hooks/use-toast";

export const useZebraScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const { items, updateItem } = useInventoryStore();

  const handleBarcodeScan = useCallback((barcode: string) => {
    console.log("Scanned barcode:", barcode);
    
    // Try to find item by SKU or barcode
    const foundItem = items.find(item => 
      item.sku === barcode || 
      item.name.toLowerCase().includes(barcode.toLowerCase())
    );

    if (foundItem) {
      // Item found - you can implement different actions here
      toast({
        title: "Item Found",
        description: `Found: ${foundItem.name} (SKU: ${foundItem.sku})`,
      });
      
      // Example: Increment quantity by 1 (for receiving inventory)
      updateItem(foundItem.id, {
        quantity: foundItem.quantity + 1
      });
      
      toast({
        title: "Quantity Updated",
        description: `${foundItem.name} quantity increased to ${foundItem.quantity + 1}`,
      });
    } else {
      // Item not found
      toast({
        title: "Item Not Found",
        description: `No item found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  }, [items, updateItem]);

  const toggleScanner = useCallback(() => {
    setIsScannerActive(prev => !prev);
  }, []);

  return {
    isScannerActive,
    toggleScanner,
    handleBarcodeScan,
  };
};
