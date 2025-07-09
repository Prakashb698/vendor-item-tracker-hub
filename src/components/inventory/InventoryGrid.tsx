
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InventoryItem } from "@/store/inventoryStore";
import InventoryItemCard from "@/components/InventoryItemCard";

interface InventoryGridProps {
  filteredItems: InventoryItem[];
  isMultiSelectMode: boolean;
  selectedItems: string[];
  searchTerm: string;
  selectedCategory: string;
  onSelectItem: (itemId: string) => void;
  onOpenImportDialog: () => void;
  onOpenAddDialog: () => void;
}

const InventoryGrid = ({
  filteredItems,
  isMultiSelectMode,
  selectedItems,
  searchTerm,
  selectedCategory,
  onSelectItem,
  onOpenImportDialog,
  onOpenAddDialog,
}: InventoryGridProps) => {
  const { t } = useTranslation();

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('inventory.noItemsFound')}</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm || selectedCategory !== "all" 
            ? t('inventory.noItemsDescription')
            : t('inventory.getStartedDescription')
          }
        </p>
        {!searchTerm && selectedCategory === "all" && (
          <div className="flex justify-center gap-2">
            <Button 
              onClick={onOpenImportDialog}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('inventory.importFromExcel')}
            </Button>
            <Button 
              onClick={onOpenAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('inventory.addFirstItem')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <InventoryItemCard 
          key={item.id} 
          item={item} 
          isMultiSelectMode={isMultiSelectMode}
          isSelected={selectedItems.includes(item.id)}
          onSelect={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
};

export default InventoryGrid;
