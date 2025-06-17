
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { InventoryItem, useInventoryStore } from "@/store/inventoryStore";
import { useState } from "react";
import EditItemDialog from "./EditItemDialog";

interface InventoryItemCardProps {
  item: InventoryItem;
}

const InventoryItemCard = ({ item }: InventoryItemCardProps) => {
  const { deleteItem } = useInventoryStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(item.id);
    }
  };

  return (
    <>
      <Card className={`bg-white border transition-all duration-200 hover:shadow-lg ${isLowStock ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLowStock ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Package className={`h-6 w-6 ${isLowStock ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              </div>
            </div>
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
                Min: {item.lowStockThreshold}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Last updated: {new Date(item.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditItemDialog 
        item={item}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </>
  );
};

export default InventoryItemCard;
