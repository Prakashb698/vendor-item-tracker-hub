import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Package, AlertTriangle, MapPin, ShoppingCart as ShoppingCartIcon, Truck, BarChart3 } from "lucide-react";
import { InventoryItem, useInventoryStore } from "@/store/inventoryStore";
import { usePurchaseQueueStore } from "@/store/purchaseQueueStore";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import EditItemDialog from "./EditItemDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import AddToQueueDialog from "./AddToQueueDialog";
import { useTranslation } from "react-i18next";

interface InventoryItemCardProps {
  item: InventoryItem;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const InventoryItemCard = ({ item, isMultiSelectMode = false, isSelected = false, onSelect }: InventoryItemCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { deleteItem } = useInventoryStore();
  const { addItem } = usePurchaseQueueStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
  
  const isLowStock = item.quantity <= item.lowStockThreshold;
  const stockStatus = isLowStock ? 'low' : item.quantity <= item.lowStockThreshold * 2 ? 'medium' : 'high';

  const getStockColor = () => {
    switch (stockStatus) {
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleDelete = () => {
    deleteItem(item.id);
  };

  const handleAddToQueue = () => {
    setIsAddToQueueDialogOpen(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    addItem(item, quantity);
  };

  const cardBorderClass = isMultiSelectMode && isSelected 
    ? 'border-blue-500 bg-blue-50/30' 
    : isLowStock 
      ? 'border-red-200 bg-red-50/30' 
      : 'border-gray-200 hover:border-gray-300';

  return (
    <>
      <Card className={`bg-white border transition-all duration-200 hover:shadow-lg ${cardBorderClass}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isMultiSelectMode && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="mt-1"
                />
              )}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLowStock ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Package className={`h-6 w-6 ${isLowStock ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{item.location}</span>
                </div>
              </div>
            </div>
            
            {!isMultiSelectMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {item.category}
            </Badge>
            <span className="text-lg font-semibold text-gray-900">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Vendor and Barcode info */}
          <div className="space-y-2">
            {item.vendor && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{item.vendor}</span>
              </div>
            )}
            {item.barcode && (
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-mono">{item.barcode}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('inventory.stockLevel')}</span>
              {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`${getStockColor()} border`}>
                {item.quantity} {t('inventory.units')}
              </Badge>
              <span className="text-xs text-gray-500">
                {t('inventory.min')}: {item.lowStockThreshold}
              </span>
            </div>
          </div>

          {user?.role === 'customer' && !isMultiSelectMode && (
            <Button
              onClick={handleAddToQueue}
              disabled={item.quantity === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              {item.quantity === 0 ? t('inventory.outOfStock') : t('inventory.addToQueue')}
            </Button>
          )}

          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {t('inventory.lastUpdated')}: {new Date(item.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditItemDialog 
        item={item}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={item.name}
        onConfirm={handleDelete}
      />
      <AddToQueueDialog
        item={item}
        open={isAddToQueueDialogOpen}
        onOpenChange={setIsAddToQueueDialogOpen}
        onConfirm={handleQuantityConfirm}
      />
    </>
  );
};

export default InventoryItemCard;
