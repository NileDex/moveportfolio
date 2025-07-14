import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaHistory,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaCoins,
  FaExchangeAlt,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

import { cn } from '../lib/utils';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';


export interface SearchFilter {
  transactionTypes: string[];
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  addressCategories: string[];
  status: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  timestamp: Date;
  favorite: boolean;
}

export interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  onSaveSearch?: (search: SavedSearch) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

/**
 * AdvancedSearch Component
 * Comprehensive search interface with filters, history, and saved searches
 * Supports transaction types, date ranges, amounts, and address categories
 */
const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSaveSearch,
  className,
  placeholder = "Search addresses, transactions, blocks, tokens...",
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({
    transactionTypes: [],
    dateRange: { from: '', to: '' },
    amountRange: { min: '', max: '' },
    addressCategories: [],
    status: []
  });

  const transactionTypes = [
    'Transfer', 'Swap', 'Stake', 'Unstake', 'Mint', 'Burn', 'Contract Call'
  ];

  const addressCategories = [
    'Wallet', 'Contract', 'Exchange', 'DeFi Protocol', 'NFT Collection'
  ];

  const statusOptions = ['Success', 'Failed', 'Pending'];

  useEffect(() => {
    // Load search history and saved searches from localStorage
    const history = localStorage.getItem('search-history');
    const saved = localStorage.getItem('saved-searches');
    
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      
      // Perform search
      onSearch(query, filters);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleTransactionType = (type: string) => {
    const current = filters.transactionTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleFilterChange('transactionTypes', updated);
  };

  const toggleAddressCategory = (category: string) => {
    const current = filters.addressCategories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    handleFilterChange('addressCategories', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    handleFilterChange('status', updated);
  };

  const clearFilters = () => {
    setFilters({
      transactionTypes: [],
      dateRange: { from: '', to: '' },
      amountRange: { min: '', max: '' },
      addressCategories: [],
      status: []
    });
  };

  const saveCurrentSearch = () => {
    if (query.trim()) {
      const searchName = prompt('Enter a name for this search:');
      if (searchName) {
        const newSearch: SavedSearch = {
          id: Date.now().toString(),
          name: searchName,
          query,
          filters: { ...filters },
          timestamp: new Date(),
          favorite: false
        };
        
        const updated = [newSearch, ...savedSearches];
        setSavedSearches(updated);
        localStorage.setItem('saved-searches', JSON.stringify(updated));
        onSaveSearch?.(newSearch);
      }
    }
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setQuery(search.query);
    setFilters(search.filters);
    onSearch(search.query, search.filters);
  };

  const toggleFavorite = (searchId: string) => {
    const updated = savedSearches.map(search =>
      search.id === searchId ? { ...search, favorite: !search.favorite } : search
    );
    setSavedSearches(updated);
    localStorage.setItem('saved-searches', JSON.stringify(updated));
  };

  const deleteSavedSearch = (searchId: string) => {
    const updated = savedSearches.filter(search => search.id !== searchId);
    setSavedSearches(updated);
    localStorage.setItem('saved-searches', JSON.stringify(updated));
  };

  const hasActiveFilters = 
    filters.transactionTypes.length > 0 ||
    filters.dateRange.from || filters.dateRange.to ||
    filters.amountRange.min || filters.amountRange.max ||
    filters.addressCategories.length > 0 ||
    filters.status.length > 0;

  return (
    <div className={cn('advanced-search', className)}>
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="advanced-search__main">
              <div className="advanced-search__input-container">
                <FaSearch className="advanced-search__search-icon" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="advanced-search__input"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery('')}
                    className="advanced-search__clear"
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
              
              <div className="advanced-search__actions">
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={!query.trim()}
                >
                  Search
                </Button>
                
                {showFilters && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn('inline-flex items-center gap-2 advanced-search__filter-toggle', {
                      'advanced-search__filter-toggle--active': hasActiveFilters
                    })}
                  >
                    Filters
                    {hasActiveFilters && (
                      <span className="advanced-search__filter-count">
                        {filters.transactionTypes.length + 
                         filters.addressCategories.length + 
                         filters.status.length +
                         (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
                         (filters.amountRange.min || filters.amountRange.max ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && showFilters && (
              <div className="advanced-search__filters">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Transaction Types */}
                  <div>
                    <div className="advanced-search__filter-group">
                      <h4 className="advanced-search__filter-title">
                        <FaExchangeAlt /> Transaction Types
                      </h4>
                      <div className="advanced-search__filter-options">
                        {transactionTypes.map(type => (
                          <Button
                            key={type}
                            variant={filters.transactionTypes.includes(type) ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => toggleTransactionType(type)}
                            className="advanced-search__filter-option"
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <div className="advanced-search__filter-group">
                      <h4 className="advanced-search__filter-title">
                        <FaCalendarAlt /> Date Range
                      </h4>
                      <div className="advanced-search__date-inputs">
                        <input
                          type="date"
                          value={filters.dateRange.from}
                          onChange={(e) => handleFilterChange('dateRange', {
                            ...filters.dateRange,
                            from: e.target.value
                          })}
                          className="advanced-search__date-input"
                        />
                        <span>to</span>
                        <input
                          type="date"
                          value={filters.dateRange.to}
                          onChange={(e) => handleFilterChange('dateRange', {
                            ...filters.dateRange,
                            to: e.target.value
                          })}
                          className="advanced-search__date-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Range */}
                  <div>
                    <div className="advanced-search__filter-group">
                      <h4 className="advanced-search__filter-title">
                        <FaCoins /> Amount Range (MOVE)
                      </h4>
                      <div className="advanced-search__amount-inputs">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.amountRange.min}
                          onChange={(e) => handleFilterChange('amountRange', {
                            ...filters.amountRange,
                            min: e.target.value
                          })}
                          className="advanced-search__amount-input"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.amountRange.max}
                          onChange={(e) => handleFilterChange('amountRange', {
                            ...filters.amountRange,
                            max: e.target.value
                          })}
                          className="advanced-search__amount-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear Filters
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={saveCurrentSearch}
                    disabled={!query.trim()}
                  >
                    Save Search
                  </Button>
                </div>
              </div>
            )}

            {/* Search History & Saved Searches */}
            {(searchHistory.length > 0 || savedSearches.length > 0) && (
              <div className="advanced-search__history">
                <div className="grid gap-4">
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="advanced-search__history-section">
                        <h4 className="advanced-search__history-title">
                          <FaHistory /> Recent Searches
                        </h4>
                        <div className="advanced-search__history-list">
                          {searchHistory.slice(0, 5).map((historyQuery, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setQuery(historyQuery);
                                onSearch(historyQuery, filters);
                              }}
                              className="advanced-search__history-item"
                            >
                              {historyQuery}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Saved Searches */}
                  {savedSearches.length > 0 && (
                    <div>
                      <div className="advanced-search__history-section">
                        <h4 className="advanced-search__history-title">
                          <FaStar /> Saved Searches
                        </h4>
                        <div className="advanced-search__saved-list">
                          {savedSearches.slice(0, 5).map((search) => (
                            <div key={search.id} className="advanced-search__saved-item">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadSavedSearch(search)}
                                className="advanced-search__saved-button"
                              >
                                {search.name}
                              </Button>
                              <div className="advanced-search__saved-actions">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(search.id)}
                                  className="advanced-search__favorite-button"
                                >
                                  {search.favorite ? <FaStar /> : <FaRegStar />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSavedSearch(search.id)}
                                  className="advanced-search__delete-button"
                                >
                                  <FaTimes />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearch;
export type { SearchFilter, SavedSearch, AdvancedSearchProps };
