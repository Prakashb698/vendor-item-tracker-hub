import { useState, useMemo, useCallback } from 'react';
import { InventoryItem } from '@/store/inventoryStore';

interface SearchFilters {
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  vendor: string;
  location: string;
}

interface UseAdvancedSearchReturn {
  searchTerm: string;
  filters: SearchFilters;
  filteredItems: InventoryItem[];
  suggestions: string[];
  searchHistory: string[];
  setSearchTerm: (term: string) => void;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
  clearFilters: () => void;
  addToHistory: (term: string) => void;
  clearHistory: () => void;
}

const defaultFilters: SearchFilters = {
  category: 'all',
  minPrice: null,
  maxPrice: null,
  stockStatus: 'all',
  vendor: 'all',
  location: 'all',
};

export const useAdvancedSearch = (items: InventoryItem[]): UseAdvancedSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate search suggestions based on item names and categories
  const suggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const suggestionSet = new Set<string>();
    
    items.forEach(item => {
      // Name suggestions
      if (item.name.toLowerCase().includes(searchLower)) {
        suggestionSet.add(item.name);
      }
      // Category suggestions
      if (item.category.toLowerCase().includes(searchLower)) {
        suggestionSet.add(item.category);
      }
      // Vendor suggestions
      if (item.vendor?.toLowerCase().includes(searchLower)) {
        suggestionSet.add(item.vendor);
      }
      // SKU suggestions
      if (item.sku.toLowerCase().includes(searchLower)) {
        suggestionSet.add(item.sku);
      }
    });
    
    return Array.from(suggestionSet).slice(0, 5);
  }, [searchTerm, items]);

  // Advanced filtering logic
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Text search across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableText = [
          item.name,
          item.description || '',
          item.category,
          item.sku,
          item.vendor || '',
          item.location || '',
          item.barcode || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Price range filter
    if (filters.minPrice !== null) {
      filtered = filtered.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice!);
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter(item => {
        switch (filters.stockStatus) {
          case 'in-stock':
            return item.quantity > item.lowStockThreshold;
          case 'low-stock':
            return item.quantity <= item.lowStockThreshold && item.quantity > 0;
          case 'out-of-stock':
            return item.quantity === 0;
          default:
            return true;
        }
      });
    }

    // Vendor filter
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(item => item.vendor === filters.vendor);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    return filtered;
  }, [items, searchTerm, filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm('');
  }, []);

  const addToHistory = useCallback((term: string) => {
    if (!term.trim() || searchHistory.includes(term)) return;
    
    const newHistory = [term, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return {
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
  };
};