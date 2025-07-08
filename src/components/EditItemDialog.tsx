import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, useUpdateInventoryItem } from "@/hooks/useInventoryItems";
import { useInventoryCategories, useAddInventoryCategory } from "@/hooks/useInventoryCategories";
import { Scan } from "lucide-react";

interface EditItemDialogProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditItemDialog = ({ item, open, onOpenChange }: EditItemDialogProps) => {
  const updateItemMutation = useUpdateInventoryItem();
  const { data: categories = [] } = useInventoryCategories();
  const addCategoryMutation = useAddInventoryCategory();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: "",
    price: "",
    low_stock_threshold: "",
    sku: "",
    barcode: "",
    location: "",
    vendor: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        category: item.category,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        low_stock_threshold: item.low_stock_threshold.toString(),
        sku: item.sku,
        barcode: item.barcode || "",
        location: item.location || "",
        vendor: item.vendor || "",
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.price) {
      return;
    }

    updateItemMutation.mutate({
      id: item.id,
      updates: {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        sku: formData.sku,
        barcode: formData.barcode || null,
        location: formData.location || null,
        vendor: formData.vendor || null,
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Item Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                className="mt-1"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">
                Barcode
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Scan or enter barcode"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                  title="Use Zebra Scanner above to scan barcode"
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category *
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="mt-1"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="mt-1"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="low_stock_threshold" className="text-sm font-medium text-gray-700">
                Low Stock Alert
              </Label>
              <Input
                id="low_stock_threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                placeholder="5"
                className="mt-1"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., A1-S2, Warehouse B"
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="vendor" className="text-sm font-medium text-gray-700">
                Vendor/Supplier
              </Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Enter vendor or supplier name"
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
                SKU
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateItemMutation.isPending}
            >
              {updateItemMutation.isPending ? 'Updating...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
