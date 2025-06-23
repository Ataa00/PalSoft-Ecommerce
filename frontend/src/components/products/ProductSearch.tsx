"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';

interface ProductSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
}

export default function ProductSearch({
  onSearch,
  placeholder = "Search products...",
  className = "",
  showClearButton = true
}: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    const searchFunction = debounce((q: string) => {
      if (onSearch) {
        onSearch(q);
      } else {
        // Update URL with search parameter
        const params = new URLSearchParams(searchParams.toString());
        if (q.trim()) {
          params.set('search', q.trim());
        } else {
          params.delete('search');
        }
        router.push(`/products?${params.toString()}`);
      }
    }, 300);

    searchFunction(query);
  }, [onSearch, router, searchParams]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    debouncedSearch('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };

  // Update search query when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams, searchQuery]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-black ring-opacity-20' : ''
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch className="text-sm" />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
        />

        {/* Clear Button */}
        {showClearButton && searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>

      {/* Search Suggestions (if needed) */}
      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-3 text-sm text-gray-600">
            Press Enter to search for &quot;{searchQuery}&quot;
          </div>
        </div>
      )}
    </form>
  );
}

// Compact search component for headers
export function CompactProductSearch({ onSearch }: { onSearch?: (query: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useCallback((query: string) => {
    const searchFunction = debounce((q: string) => {
      if (onSearch) {
        onSearch(q);
      }
    }, 300);

    searchFunction(query);
  }, [onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setSearchQuery('');
      debouncedSearch('');
    }
  };

  return (
    <div className="relative">
      {!isExpanded ? (
        <button
          onClick={handleToggle}
          className="p-2 text-gray-600 hover:text-black transition-colors"
          aria-label="Search products"
        >
          <FaSearch className="text-lg" />
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={handleToggle}
            className="p-2 text-gray-600 hover:text-black transition-colors"
            aria-label="Close search"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
}

// Search results summary component
export function SearchResultsSummary({ 
  query, 
  totalResults, 
  onClearSearch 
}: { 
  query: string; 
  totalResults: number; 
  onClearSearch: () => void; 
}) {
  if (!query) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-800">
            <span className="font-medium">{totalResults}</span> results found for{' '}
            <span className="font-semibold">&quot;{query}&quot;</span>
          </p>
        </div>
        <button
          onClick={onClearSearch}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <FaTimes className="text-xs" />
          <span>Clear search</span>
        </button>
      </div>
    </div>
  );
}
