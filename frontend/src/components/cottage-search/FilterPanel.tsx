'use client';

import React from 'react';
import { FilterPanelProps, PROPERTY_TYPES, PRICE_RANGES } from '@/types/cottage-search';

/**
 * Advanced filters panel for cottage search
 * Includes property type and price range filters
 */
export default function FilterPanel({
  filters,
  onChange,
  isExpanded = false,
  onToggle,
  className = ''
}: FilterPanelProps) {
  const handlePropertyTypeChange = (value: string) => {
    onChange({ ...filters, propertyType: value });
  };

  const handlePriceRangeChange = (value: string) => {
    onChange({ ...filters, priceRange: value });
  };

  return (
    <div className={`filters-container ${className}`}>
      {/* Filter Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="toggle-filters w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 mb-4"
      >
        <span>Advanced Filters</span>
        <span className={`filter-arrow transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expandable Filter Controls */}
      <div className={`filter-controls transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-700/50">
          {/* Property Type Filter */}
          <div className="filter-group">
            <label 
              htmlFor="property-type" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Property Type
            </label>
            <select
              id="property-type"
              value={filters.propertyType}
              onChange={(e) => handlePropertyTypeChange(e.target.value)}
              className="filter-select w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:outline-none transition-all duration-300"
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_TYPES).map(([value, label]) => 
                value !== 'all' && (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label 
              htmlFor="price-range" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Price Range
            </label>
            <select
              id="price-range"
              value={filters.priceRange}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
              className="filter-select w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border border-purple-200 dark:border-purple-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:outline-none transition-all duration-300"
            >
              <option value="">Any Price</option>
              {Object.entries(PRICE_RANGES).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}