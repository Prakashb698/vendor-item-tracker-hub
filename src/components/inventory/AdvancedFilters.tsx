import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, X } from "lucide-react";

export interface AdvancedFilterOptions {
  searchTerm: string;
  category: string;
  priceRange: [number, number];
  quantityRange: [number, number];
  lowStockOnly: boolean;
  outOfStockOnly: boolean;
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  categories: string[];
  availableTags: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories,
  availableTags 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<AdvancedFilterOptions>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: AdvancedFilterOptions = {
      searchTerm: "",
      category: "",
      priceRange: [0, 1000],
      quantityRange: [0, 100],
      lowStockOnly: false,
      outOfStockOnly: false,
      tags: [],
      dateRange: {}
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const addTag = (tag: string) => {
    if (!tempFilters.tags.includes(tag)) {
      setTempFilters({
        ...tempFilters,
        tags: [...tempFilters.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    setTempFilters({
      ...tempFilters,
      tags: tempFilters.tags.filter(t => t !== tag)
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'searchTerm' && value) return count + 1;
    if (key === 'category' && value) return count + 1;
    if (key === 'lowStockOnly' && value) return count + 1;
    if (key === 'outOfStockOnly' && value) return count + 1;
    if (key === 'tags' && Array.isArray(value) && value.length > 0) return count + 1;
    return count;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your inventory search with detailed filters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, SKU, description..."
              value={tempFilters.searchTerm}
              onChange={(e) => setTempFilters({ ...tempFilters, searchTerm: e.target.value })}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={tempFilters.category} 
              onValueChange={(value) => setTempFilters({ ...tempFilters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label>Price Range: ${tempFilters.priceRange[0]} - ${tempFilters.priceRange[1]}</Label>
            <Slider
              value={tempFilters.priceRange}
              onValueChange={(value) => setTempFilters({ ...tempFilters, priceRange: value as [number, number] })}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Quantity Range */}
          <div className="space-y-3">
            <Label>Quantity Range: {tempFilters.quantityRange[0]} - {tempFilters.quantityRange[1]}</Label>
            <Slider
              value={tempFilters.quantityRange}
              onValueChange={(value) => setTempFilters({ ...tempFilters, quantityRange: value as [number, number] })}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Stock Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="low-stock">Low Stock Only</Label>
              <Switch
                id="low-stock"
                checked={tempFilters.lowStockOnly}
                onCheckedChange={(checked) => setTempFilters({ ...tempFilters, lowStockOnly: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="out-of-stock">Out of Stock Only</Label>
              <Switch
                id="out-of-stock"
                checked={tempFilters.outOfStockOnly}
                onCheckedChange={(checked) => setTempFilters({ ...tempFilters, outOfStockOnly: checked })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <Select onValueChange={addTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tag filter" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {tempFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tempFilters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleResetFilters} variant="outline" className="flex-1">
            Reset All
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}