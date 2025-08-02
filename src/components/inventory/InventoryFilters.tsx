
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import AdvancedSearchBar from "./AdvancedSearchBar";
import AdvancedFilters from "./AdvancedFilters";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { InventoryItem } from "@/store/inventoryStore";

interface InventoryFiltersProps {
  items: InventoryItem[];
  onFilteredItemsChange: (items: InventoryItem[]) => void;
}

const InventoryFilters = ({
  items,
  onFilteredItemsChange,
}: InventoryFiltersProps) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    searchTerm,
    filters,
    filteredItems,
    suggestions,
    searchHistory,
    setSearchTerm,
    updateFilter,
    clearFilters,
    addToHistory,
    clearHistory,
  } = useAdvancedSearch(items);

  // Extract unique values for filter options
  const categories = [...new Set(items.map(item => item.category))];
  const vendors = [...new Set(items.map(item => item.vendor).filter(Boolean))];
  const locations = [...new Set(items.map(item => item.location).filter(Boolean))];

  // Update parent component with filtered items
  useEffect(() => {
    onFilteredItemsChange(filteredItems);
  }, [filteredItems, onFilteredItemsChange]);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== null && value !== ''
  );

  const handleSearch = (term: string) => {
    if (term.trim()) {
      addToHistory(term);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 bg-background p-4 rounded-lg border">
        <AdvancedSearchBar
          searchTerm={searchTerm}
          suggestions={suggestions}
          searchHistory={searchHistory}
          onSearchChange={setSearchTerm}
          onSuggestionSelect={setSearchTerm}
          onHistorySelect={setSearchTerm}
          onSearch={handleSearch}
          onClearHistory={clearHistory}
          onShowFilters={() => setShowFilters(true)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AdvancedFilters
        filters={filters}
        categories={categories}
        vendors={vendors}
        locations={locations}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        isOpen={showFilters}
        onOpenChange={setShowFilters}
      />
    </div>
  );
};

export default InventoryFilters;
