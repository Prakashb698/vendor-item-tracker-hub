import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Upload } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore";
import InventoryItemCard from "@/components/InventoryItemCard";
import AddItemDialog from "@/components/AddItemDialog";
import ImportItemsDialog from "@/components/ImportItemsDialog";

const Inventory = () => {
  const { items, categories } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsImportDialogOpen(true)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Items
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <InventoryItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first inventory item"
            }
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <div className="flex justify-center gap-2">
              <Button 
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from Excel/CSV
              </Button>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          )}
        </div>
      )}

      <AddItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <ImportItemsDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
    </div>
  );
};

export default Inventory;
