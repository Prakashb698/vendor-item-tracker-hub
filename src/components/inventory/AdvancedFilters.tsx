import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFilters {
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  vendor: string;
  location: string;
}

interface AdvancedFiltersProps {
  filters: SearchFilters;
  categories: string[];
  vendors: string[];
  locations: string[];
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedFilters = ({
  filters,
  categories,
  vendors,
  locations,
  onFilterChange,
  onClearFilters,
  isOpen,
  onOpenChange,
}: AdvancedFiltersProps) => {
  const { t } = useTranslation();

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== null && value !== ''
  ).length;

  const stockStatusOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Advanced Filters
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {filters.category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange('category', 'all')}
                    />
                  </Badge>
                )}
                {filters.stockStatus !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {stockStatusOptions.find(opt => opt.value === filters.stockStatus)?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange('stockStatus', 'all')}
                    />
                  </Badge>
                )}
                {(filters.minPrice !== null || filters.maxPrice !== null) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        onFilterChange('minPrice', null);
                        onFilterChange('maxPrice', null);
                      }}
                    />
                  </Badge>
                )}
                {filters.vendor !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Vendor: {filters.vendor}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange('vendor', 'all')}
                    />
                  </Badge>
                )}
                {filters.location !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {filters.location}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange('location', 'all')}
                    />
                  </Badge>
                )}
              </div>
              <Separator />
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          {/* Stock Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="stockStatus">Stock Status</Label>
            <Select value={filters.stockStatus} onValueChange={(value) => onFilterChange('stockStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {stockStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                className="flex-1"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Vendor Filter */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select value={filters.vendor} onValueChange={(value) => onFilterChange('vendor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={filters.location} onValueChange={(value) => onFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;