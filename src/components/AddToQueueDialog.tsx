import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { InventoryItem } from '@/store/inventoryStore';
import { Badge } from '@/components/ui/badge';

interface AddToQueueDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
}

const AddToQueueDialog = ({ item, open, onOpenChange, onConfirm }: AddToQueueDialogProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= (item?.quantity || 0)) {
      setQuantity(numValue);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (item?.quantity || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1); // Reset quantity for next time
    onOpenChange(false);
  };

  const handleCancel = () => {
    setQuantity(1); // Reset quantity
    onOpenChange(false);
  };

  if (!item) return null;

  const totalPrice = item.price * quantity;
  const isLowStock = item.quantity <= item.lowStockThreshold;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Add to Purchase Queue
          </DialogTitle>
          <DialogDescription>
            Select the quantity you want to add to your purchase queue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLowStock ? 'bg-red-100' : 'bg-blue-100'}`}>
              <Package className={`h-6 w-6 ${isLowStock ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                <span className="text-lg font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Available Stock</p>
              <p className="text-xs text-gray-600">Maximum you can order</p>
            </div>
            <Badge className={`${isLowStock ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'} border`}>
              {item.quantity} units
            </Badge>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity to Order
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                min="1"
                max={item.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={quantity >= item.quantity}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Enter a quantity between 1 and {item.quantity}
            </p>
          </div>

          {/* Total Price */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Total Price</p>
              <p className="text-xs text-gray-600">{quantity} × ${item.price.toFixed(2)}</p>
            </div>
            <span className="text-xl font-bold text-green-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToQueueDialog;