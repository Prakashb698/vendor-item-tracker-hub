
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import { useUserInventory } from "@/hooks/useUserInventory";
import { toast } from "@/hooks/use-toast";

const Categories = () => {
  const { categories, items, addCategory, deleteCategory } = useUserInventory();
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      toast({
        title: "Category Added",
        description: `${newCategory} has been added to your categories.`,
      });
      setNewCategory("");
    }
  };

  const handleDeleteCategory = (category: string) => {
    const itemsInCategory = items.filter(item => item.category === category).length;
    
    if (itemsInCategory > 0) {
      const confirmed = window.confirm(
        `This category contains ${itemsInCategory} items. They will be moved to "Uncategorized". Continue?`
      );
      if (!confirmed) return;
    }

    deleteCategory(category);
    toast({
      title: "Category Deleted",
      description: `${category} has been deleted.`,
    });
  };

  const getCategoryItemCount = (category: string) => {
    return items.filter(item => item.category === category).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Organize your inventory with custom categories</p>
      </div>

      {/* Add Category Form */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const itemCount = getCategoryItemCount(category);
          
          return (
            <Card key={category} className="bg-white border transition-all duration-200 hover:shadow-lg hover:border-gray-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category}</h3>
                      <p className="text-sm text-gray-500">{itemCount} items</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Items in category</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {itemCount}
                    </Badge>
                  </div>
                  
                  {itemCount > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Total value: ${items
                          .filter(item => item.category === category)
                          .reduce((sum, item) => sum + (item.quantity * item.price), 0)
                          .toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first category to organize your inventory items
          </p>
        </div>
      )}
    </div>
  );
};

export default Categories;
