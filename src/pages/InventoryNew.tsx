import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import { InventoryFilters } from "@/components/inventory/InventoryFiltersNew";
import MultiSelectActions from "@/components/inventory/MultiSelectActions";
import BarcodeScanner from "@/components/BarcodeScanner";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";
import ScanResultDialog from "@/components/ScanResultDialog";
import { PrintButton } from "@/components/PrintButton";
import { useZebraScanner } from "@/hooks/useZebraScanner";
import { useTranslatedInventory } from "@/hooks/useTranslatedInventory";
import type { InventoryItem } from "@/store/inventoryStore";
import type { AdvancedFilterOptions } from "@/components/inventory/AdvancedFilters";

const Inventory = () => {
  const { items, categories } = useInventoryStore();
  const { translateItems } = useTranslatedInventory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({
    searchTerm: "",
    category: "",
    priceRange: [0, 1000],
    quantityRange: [0, 100],
    lowStockOnly: false,
    outOfStockOnly: false,
    tags: [],
    dateRange: {}
  });

  const translatedItems = translateItems(items);
  
  const { 
    isScannerActive, 
    isConnected, 
    connectionStatus, 
    toggleScanner, 
    connectScanner, 
    disconnectScanner, 
    handleBarcodeScan 
  } = useZebraScanner();

  // Filter items based on search, category, and advanced filters
  const filteredItems = translatedItems.filter((item) => {
    const searchTermToUse = advancedFilters.searchTerm || searchTerm;
    const categoryToUse = advancedFilters.category || selectedCategory;
    
    const matchesSearch = item.name.toLowerCase().includes(searchTermToUse.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTermToUse.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTermToUse.toLowerCase());
    const matchesCategory = !categoryToUse || item.category === categoryToUse;
    const matchesPrice = item.price >= advancedFilters.priceRange[0] && item.price <= advancedFilters.priceRange[1];
    const matchesQuantity = item.quantity >= advancedFilters.quantityRange[0] && item.quantity <= advancedFilters.quantityRange[1];
    const matchesLowStock = !advancedFilters.lowStockOnly || item.quantity <= item.lowStockThreshold;
    const matchesOutOfStock = !advancedFilters.outOfStockOnly || item.quantity === 0;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesQuantity && matchesLowStock && matchesOutOfStock;
  });

  // Handler specifically for adding new items
  const handleBarcodeForAddItem = (barcode: string) => {
    setScannedBarcode(barcode);
    if (!showAddDialog) {
      setShowAddDialog(true);
    }
  };

  // Handler for scan results
  const handleScanResult = (item: InventoryItem | null, scannedBarcode: string) => {
    setScannedItem(item);
    setScannedBarcode(scannedBarcode);
    setShowScanResult(true);
  };

  // Determine which scan handler to use
  const getCurrentScanHandler = () => {
    if (showAddDialog) {
      return handleBarcodeForAddItem;
    }
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
      setMultiSelectMode(false);
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6" id="printable-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <PrintButton title="Inventory Report" />
      </div>
      
      <InventoryHeader
        onAddItem={() => setShowAddDialog(true)}
        onImportItems={() => setShowImportDialog(true)}
        selectedCount={selectedItems.length}
        multiSelectMode={multiSelectMode}
        onToggleMultiSelect={toggleMultiSelectMode}
      />

      <MultiSelectActions
        isMultiSelectMode={multiSelectMode}
        selectedItems={selectedItems}
        filteredItems={filteredItems}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
      />

      <BarcodeScanner
        onScan={getCurrentScanHandler()}
        isActive={isScannerActive}
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        onToggle={toggleScanner}
        onConnect={connectScanner}
        onDisconnect={disconnectScanner}
      />

      <InventoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
      />

      <InventoryGrid
        filteredItems={filteredItems}
        isMultiSelectMode={multiSelectMode}
        selectedItems={selectedItems}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSelectItem={handleSelectItem}
        onOpenImportDialog={() => setShowImportDialog(true)}
        onOpenAddDialog={() => setShowAddDialog(true)}
      />

      <AddItemDialog 
        open={showAddDialog} 
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setScannedBarcode("");
          }
        }}
        scannedBarcode={scannedBarcode}
      />
      
      <ImportItemsDialog open={showImportDialog} onOpenChange={setShowImportDialog} />
      
      <ScanResultDialog
        open={showScanResult}
        onOpenChange={setShowScanResult}
        item={scannedItem}
        scannedBarcode={scannedBarcode}
      />
    </div>
  );
};

export default Inventory;