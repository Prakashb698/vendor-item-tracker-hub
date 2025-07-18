import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedFilters, AdvancedFilterOptions } from "./AdvancedFilters";

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  advancedFilters?: AdvancedFilterOptions;
  onAdvancedFiltersChange?: (filters: AdvancedFilterOptions) => void;
}

export function InventoryFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  advancedFilters,
  onAdvancedFiltersChange,
}: InventoryFiltersProps) {
  const availableTags = ['Electronics', 'Fragile', 'Bulk', 'Premium', 'Sale'];

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, SKU, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="sm:w-48">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </div>
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

      {advancedFilters && onAdvancedFiltersChange && (
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={onAdvancedFiltersChange}
          categories={categories}
          availableTags={availableTags}
        />
      )}
    </div>
  );
}