
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InventoryFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  translatedCategories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const InventoryFilters = ({
  searchTerm,
  selectedCategory,
  categories,
  translatedCategories,
  onSearchChange,
  onCategoryChange,
}: InventoryFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('inventory.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
      </div>
      <div className="sm:w-48">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
            {translatedCategories.map((category, index) => (
              <SelectItem key={categories[index]} value={categories[index]}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InventoryFilters;
