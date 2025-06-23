"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  categories?: FilterOption[];
  priceRanges?: FilterOption[];
  brands?: FilterOption[];
  ratings?: FilterOption[];
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  categories: string[];
  priceRange: string[];
  brands: string[];
  ratings: string[];
  sortBy: string;
}

export default function ProductFilters({
  categories = [],
  priceRanges = [],
  brands = [],
  ratings = [],
  onFiltersChange,
  className = ""
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    priceRange: searchParams.get('priceRange')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    ratings: searchParams.get('ratings')?.split(',').filter(Boolean) || [],
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    brands: true,
    ratings: true
  });

  // Update URL and notify parent when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update URL parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (typeof value === 'string' && value && value !== 'relevance') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Update URL without page reload
    router.push(`/products?${params.toString()}`, { scroll: false });

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, router, searchParams, onFiltersChange]);

  // Handle checkbox filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as string[];
      let newValues: string[];
      
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [],
      brands: [],
      ratings: [],
      sortBy: 'relevance'
    });
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : (value && value !== 'relevance')
  );

  const FilterSection = ({ 
    title, 
    options, 
    filterType, 
    sectionKey 
  }: { 
    title: string; 
    options: FilterOption[]; 
    filterType: keyof FilterState;
    sectionKey: keyof typeof expandedSections;
  }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? (
          <FaChevronUp className="text-sm text-gray-500" />
        ) : (
          <FaChevronDown className="text-sm text-gray-500" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters[filterType] as string[]).includes(option.value)}
                onChange={(e) => handleFilterChange(filterType, option.value, e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700 flex-1">{option.label}</span>
              {option.count && (
                <span className="text-xs text-gray-500">({option.count})</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <FaTimes className="text-xs" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="relevance">Relevance</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Filter Sections */}
      {categories.length > 0 && (
        <FilterSection
          title="Categories"
          options={categories}
          filterType="categories"
          sectionKey="categories"
        />
      )}

      {priceRanges.length > 0 && (
        <FilterSection
          title="Price Range"
          options={priceRanges}
          filterType="priceRange"
          sectionKey="priceRange"
        />
      )}

      {brands.length > 0 && (
        <FilterSection
          title="Brands"
          options={brands}
          filterType="brands"
          sectionKey="brands"
        />
      )}

      {ratings.length > 0 && (
        <FilterSection
          title="Customer Rating"
          options={ratings}
          filterType="ratings"
          sectionKey="ratings"
        />
      )}
    </div>
  );
}

// Mobile filter modal component
export function MobileFilters({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-full pb-20">
          {children}
        </div>
      </div>
    </div>
  );
}
