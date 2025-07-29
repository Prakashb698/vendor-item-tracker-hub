import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Clock, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdvancedSearchBarProps {
  searchTerm: string;
  suggestions: string[];
  searchHistory: string[];
  onSearchChange: (value: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
  onHistorySelect: (term: string) => void;
  onSearch: (term: string) => void;
  onClearHistory: () => void;
  onShowFilters: () => void;
  hasActiveFilters: boolean;
}

const AdvancedSearchBar = ({
  searchTerm,
  suggestions,
  searchHistory,
  onSearchChange,
  onSuggestionSelect,
  onHistorySelect,
  onSearch,
  onClearHistory,
  onShowFilters,
  hasActiveFilters,
}: AdvancedSearchBarProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (term: string) => {
    onHistorySelect(term);
    onSearch(term);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1" ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('inventory.advancedSearchPlaceholder')}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(searchTerm.length > 0 || searchHistory.length > 0)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSearchChange('');
                setShowSuggestions(false);
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={onShowFilters}
            className="h-8 px-2"
          >
            <Filter className="h-3 w-3" />
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions and History Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {searchHistory.slice(0, 3).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <span className="text-sm font-medium text-muted-foreground mb-2 block">
                Suggestions
              </span>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                >
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;