import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";
import BarcodeScanner from "@/components/BarcodeScanner";
import ScanResultDialog from "@/components/ScanResultDialog";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import MultiSelectActions from "@/components/inventory/MultiSelectActions";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import { useZebraScanner } from "@/hooks/useZebraScanner";
import { useTranslation } from "react-i18next";
import { useTranslatedInventory } from "@/hooks/useTranslatedInventory";
import { InventoryItem } from "@/store/inventoryStore";

const Inventory = () => {
  const { t } = useTranslation();
  const { items } = useInventoryStore();
  const { translateItems } = useTranslatedInventory();
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [scannedBarcodeForAdd, setScannedBarcodeForAdd] = useState<string>("");
  
  // Scan result dialog state
  const [scanResultDialogOpen, setScanResultDialogOpen] = useState(false);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("");
  
  const { 
    isScannerActive, 
    isConnected, 
    connectionStatus, 
    toggleScanner, 
    connectScanner, 
    disconnectScanner, 
    handleBarcodeScan 
  } = useZebraScanner();

  // Get translated items
  const translatedItems = translateItems(items);

  // Handler specifically for adding new items - only sets barcode and opens dialog
  const handleBarcodeForAddItem = (barcode: string) => {
    console.log("Barcode scanned for new item:", barcode);
    setScannedBarcodeForAdd(barcode);
    if (!isAddDialogOpen) {
      setIsAddDialogOpen(true);
    }
  };

  // Handler for scan results - shows popup with item details or not found message
  const handleScanResult = (item: InventoryItem | null, scannedBarcode: string) => {
    console.log("Scan result:", item ? `Found: ${item.name}` : `Not found: ${scannedBarcode}`);
    setScannedItem(item);
    setLastScannedBarcode(scannedBarcode);
    setScanResultDialogOpen(true);
  };

  // Determine which scan handler to use based on current mode
  const getCurrentScanHandler = () => {
    // If add dialog is open, route scans to the add item handler
    if (isAddDialogOpen) {
      return handleBarcodeForAddItem;
    }
    // Otherwise use the scan result handler to show popup
    return (barcode: string) => {
      handleBarcodeScan(barcode, handleScanResult);
    };
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    const itemNames = selectedItems
      .map(itemId => items.find(item => item.id === itemId)?.name)
      .filter(Boolean)
      .join(', ');
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items: ${itemNames}?`)) {
      selectedItems.forEach(itemId => {
        const itemToDelete = items.find(item => item.id === itemId);
        if (itemToDelete) {
          useInventoryStore.getState().deleteItem(itemId);
        }
      });
      setSelectedItems([]);
      setIsMultiSelectMode(false);
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <InventoryHeader
        isMultiSelectMode={isMultiSelectMode}
        showScanner={showScanner}
        onToggleMultiSelect={toggleMultiSelectMode}
        onToggleScanner={() => setShowScanner(!showScanner)}
        onOpenImportDialog={() => setIsImportDialogOpen(true)}
        onOpenAddDialog={() => setIsAddDialogOpen(true)}
      />

      <MultiSelectActions
        isMultiSelectMode={isMultiSelectMode}
        selectedItems={selectedItems}
        filteredItems={filteredItems}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
      />

      {showScanner && (
        <BarcodeScanner
          onScan={getCurrentScanHandler()}
          isActive={isScannerActive}
          isConnected={isConnected}
          connectionStatus={connectionStatus}
          onToggle={toggleScanner}
          onConnect={connectScanner}
          onDisconnect={disconnectScanner}
        />
      )}

      <InventoryFilters
        items={translatedItems}
        onFilteredItemsChange={setFilteredItems}
      />

      <InventoryGrid
        filteredItems={filteredItems}
        isMultiSelectMode={isMultiSelectMode}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onOpenImportDialog={() => setIsImportDialogOpen(true)}
        onOpenAddDialog={() => setIsAddDialogOpen(true)}
      />

      <AddItemDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setScannedBarcodeForAdd("");
          }
        }}
        scannedBarcode={scannedBarcodeForAdd}
      />
      
      <ImportItemsDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      
      <ScanResultDialog
        open={scanResultDialogOpen}
        onOpenChange={setScanResultDialogOpen}
        item={scannedItem}
        scannedBarcode={lastScannedBarcode}
      />
    </div>
  );
};

export default Inventory;
