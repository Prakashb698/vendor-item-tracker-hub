
import { Button } from "@/components/ui/button";
import { Plus, Scan, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InventoryHeaderProps {
  isMultiSelectMode: boolean;
  showScanner: boolean;
  onToggleMultiSelect: () => void;
  onToggleScanner: () => void;
  onOpenImportDialog: () => void;
  onOpenAddDialog: () => void;
}

const InventoryHeader = ({
  isMultiSelectMode,
  showScanner,
  onToggleMultiSelect,
  onToggleScanner,
  onOpenImportDialog,
  onOpenAddDialog,
}: InventoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('inventory.title')}</h1>
        <p className="text-gray-600">{t('inventory.subtitle')}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onToggleMultiSelect}
          variant="outline"
          className={`border-gray-200 ${isMultiSelectMode ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          {isMultiSelectMode ? t('inventory.cancelSelect') : t('inventory.multiSelect')}
        </Button>
        <Button 
          onClick={onToggleScanner}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Scan className="h-4 w-4 mr-2" />
          {showScanner ? t('inventory.hideScanner') : t('inventory.zebraScanner')}
        </Button>
        <Button 
          onClick={onOpenImportDialog}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('inventory.importItems')}
        </Button>
        <Button 
          onClick={onOpenAddDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addItem')}
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
