
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddInventoryItem } from "@/hooks/useInventoryItems";
import { useInventoryCategories, useAddInventoryCategory } from "@/hooks/useInventoryCategories";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const addItemMutation = useAddInventoryItem();
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
    location: "",
    vendor: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.price) {
      return;
    }

    addItemMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
      sku: formData.sku || `SKU-${Date.now()}`,
      location: formData.location || null,
      vendor: formData.vendor || null,
    }, {
      onSuccess: () => {
        setFormData({
          name: "",
          description: "",
          category: "",
          quantity: "",
          price: "",
          low_stock_threshold: "",
          sku: "",
          location: "",
          vendor: "",
        });
        onOpenChange(false);
      }
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategoryMutation.mutate(newCategory.trim(), {
        onSuccess: () => {
          setFormData({ ...formData, category: newCategory.trim() });
          setNewCategory("");
          setIsAddingCategory(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Item</DialogTitle>
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
              {isAddingCategory ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button type="button" onClick={handleAddCategory} size="sm">
                    Add
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingCategory(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="flex-1">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingCategory(true)}
                    size="sm"
                  >
                    New
                  </Button>
                </div>
              )}
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
                placeholder="Auto-generated"
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
              disabled={addItemMutation.isPending}
            >
              {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
