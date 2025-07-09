
import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";
import BarcodeScanner from "@/components/BarcodeScanner";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import MultiSelectActions from "@/components/inventory/MultiSelectActions";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import { useZebraScanner } from "@/hooks/useZebraScanner";
import { useTranslation } from "react-i18next";
import { useTranslatedInventory } from "@/hooks/useTranslatedInventory";

const Inventory = () => {
  const { t } = useTranslation();
  const { items, categories, deleteItem } = useInventoryStore();
  const { translateItems, translateCategories } = useTranslatedInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [scannedBarcodeForAdd, setScannedBarcodeForAdd] = useState<string>("");
  
  const { 
    isScannerActive, 
    isConnected, 
    connectionStatus, 
    toggleScanner, 
    connectScanner, 
    disconnectScanner, 
    handleBarcodeScan 
  } = useZebraScanner();

  // Get translated items and categories
  const translatedItems = translateItems(items);
  const translatedCategories = translateCategories(categories);

  const filteredItems = translatedItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === translatedCategories[categories.indexOf(selectedCategory)] || 
                           categories[translatedCategories.indexOf(selectedCategory)] === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handler specifically for adding new items - only sets barcode
  const handleBarcodeForAddItem = (barcode: string) => {
    console.log("Barcode scanned for new item:", barcode);
    setScannedBarcodeForAdd(barcode);
    if (!isAddDialogOpen) {
      setIsAddDialogOpen(true);
    }
  };

  // Determine which scan handler to use based on current mode
  const getCurrentScanHandler = () => {
    if (isAddDialogOpen) {
      return handleBarcodeForAddItem;
    }
    return handleBarcodeScan;
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
      .map(id => items.find(item => item.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items: ${itemNames}?`)) {
      selectedItems.forEach(itemId => deleteItem(itemId));
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
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        translatedCategories={translatedCategories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />

      <InventoryGrid
        filteredItems={filteredItems}
        isMultiSelectMode={isMultiSelectMode}
        selectedItems={selectedItems}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
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
    </div>
  );
};

export default Inventory;
