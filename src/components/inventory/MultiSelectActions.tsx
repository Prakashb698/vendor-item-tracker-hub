
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InventoryItem } from "@/store/inventoryStore";

interface MultiSelectActionsProps {
  isMultiSelectMode: boolean;
  selectedItems: string[];
  filteredItems: InventoryItem[];
  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

const MultiSelectActions = ({
  isMultiSelectMode,
  selectedItems,
  filteredItems,
  onSelectAll,
  onDeleteSelected,
}: MultiSelectActionsProps) => {
  const { t } = useTranslation();

  if (!isMultiSelectMode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          onClick={onSelectAll}
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          {selectedItems.length === filteredItems.length ? t('inventory.deselectAll') : t('inventory.selectAll')}
        </Button>
        <span className="text-blue-700 font-medium">
          {selectedItems.length} {t('inventory.itemsSelected')}
        </span>
      </div>
      {selectedItems.length > 0 && (
        <Button
          onClick={onDeleteSelected}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t('inventory.deleteSelected')} ({selectedItems.length})
        </Button>
      )}
    </div>
  );
};

export default MultiSelectActions;
