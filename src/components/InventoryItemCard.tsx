
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Package, AlertTriangle, MapPin, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { InventoryItem, useDeleteInventoryItem } from "@/hooks/useInventoryItems";
import { usePurchaseQueueStore } from "@/store/purchaseQueueStore";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import EditItemDialog from "./EditItemDialog";

interface InventoryItemCardProps {
  item: InventoryItem;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const InventoryItemCard = ({ item, isMultiSelectMode = false, isSelected = false, onSelect }: InventoryItemCardProps) => {
  const { user } = useAuth();
  const deleteItemMutation = useDeleteInventoryItem();
  const { addItem } = usePurchaseQueueStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const isLowStock = item.quantity <= item.low_stock_threshold;
  const stockStatus = isLowStock ? 'low' : item.quantity <= item.low_stock_threshold * 2 ? 'medium' : 'high';

  const getStockColor = () => {
    switch (stockStatus) {
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleAddToQueue = () => {
    // Convert the Supabase item to the format expected by the purchase queue
    const queueItem = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      price: Number(item.price),
      lowStockThreshold: item.low_stock_threshold,
      sku: item.sku,
      location: item.location || '',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
    addItem(queueItem, 1);
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
                {item.barcode && (
                  <p className="text-sm text-gray-500">Barcode: {item.barcode}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{item.location || 'No location'}</span>
                </div>
              </div>
            </div>
            
            {!isMultiSelectMode && (
              <>
                {user?.role === 'admin' ? (
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
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToQueue}
                    disabled={item.quantity === 0}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                  </Button>
                )}
              </>
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
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock Level</span>
              {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`${getStockColor()} border`}>
                {item.quantity} units
              </Badge>
              <span className="text-xs text-gray-500">
                Min: {item.low_stock_threshold}
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
              {item.quantity === 0 ? 'Out of Stock' : 'Add to Queue'}
            </Button>
          )}

          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Last updated: {new Date(item.updated_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === 'admin' && (
        <EditItemDialog 
          item={item}
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
        />
      )}
    </>
  );
};

export default InventoryItemCard;
