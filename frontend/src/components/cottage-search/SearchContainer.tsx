'use client';

import React, { useState, useEffect } from 'react';
import { SearchContainerProps, SearchState, DEFAULT_SEARCH_STATE } from '@/types/cottage-search';
import SearchInput from './SearchInput';
import FilterPanel from './FilterPanel';
import PropertyGrid from './PropertyGrid';
import PropertyModal from './PropertyModal';
import LoadingStates from './LoadingStates';
import ErrorBoundary from './ErrorBoundary';
import { useSearch } from '@/hooks/cottage-search/useSearch';
import { useModal } from '@/hooks/cottage-search/useModal';

/**
 * Main container component for Merlin's Cottage Search
 * Orchestrates all search functionality and state management
 */
export default function SearchContainer({
  initialQuery = '',
  initialFilters = {},
  onSearchComplete,
  className = ''
}: SearchContainerProps) {
  // Custom hooks for search and modal state
  const {
    searchState,
    performSearch,
    updateQuery,
    updateFilters,
    clearSearch,
    retrySearch
  } = useSearch({ 
    initialQuery, 
    initialFilters: { ...DEFAULT_SEARCH_STATE.filters, ...initialFilters } 
  });

  const { modalState, openModal, closeModal } = useModal();

  // Filter panel expanded state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Handle search completion callback
  useEffect(() => {
    if (onSearchComplete && searchState.hasSearched) {
      onSearchComplete(searchState.results);
    }
  }, [searchState.results, searchState.hasSearched, onSearchComplete]);

  const handlePropertyClick = (property: any) => {
    openModal(property);
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <ErrorBoundary>
      <div className={`cottage-search-container ${className}`}>
        {/* Magical Header */}
        <div className="cottage-header relative overflow-hidden">
          <div className="magic-sparkles absolute inset-0 pointer-events-none">
            {/* Sparkle animations will be added via CSS */}
          </div>
          <h1 className="cottage-title text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🧙‍♂️ Merlin's Cottage Search
          </h1>
          <p className="cottage-subtitle text-lg text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find your magical Nevada County retreat with the power of enchanted search
          </p>
        </div>

        {/* Search Form */}
        <div className="search-form-wrapper mt-8 mb-6">
          <SearchInput
            value={searchState.query}
            onChange={updateQuery}
            onSubmit={performSearch}
            isLoading={searchState.isLoading}
            placeholder="Describe your dream cottage... (e.g., 'cozy cabin by the creek' or 'rustic mountain retreat')"
            className="mb-4"
          />

          <FilterPanel
            filters={searchState.filters}
            onChange={updateFilters}
            isExpanded={filtersExpanded}
            onToggle={toggleFilters}
          />
        </div>

        {/* Loading State */}
        <LoadingStates 
          isLoading={searchState.isLoading}
          message="Consulting the crystal ball..."
        />

        {/* Search Results */}
        {searchState.hasSearched && !searchState.isLoading && (
          <div className="search-results">
            {/* Results Header */}
            {searchState.results.length > 0 && (
              <div className="results-header mb-6">
                <h2 className="results-title text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  ✨ Enchanted Properties Found
                </h2>
                <div className="results-count text-gray-600 dark:text-gray-400">
                  Found {searchState.total} magical properties
                  {searchState.apiStatus === 'fallback' && (
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      (Using demo data - API unavailable)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Property Grid */}
            <PropertyGrid
              properties={searchState.results}
              onPropertyClick={handlePropertyClick}
              isLoading={searchState.isLoading}
            />

            {/* No Results State */}
            {searchState.results.length === 0 && !searchState.error && (
              <div className="no-results text-center py-12">
                <div className="no-results-icon text-6xl mb-4">🏚️</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No Magical Properties Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try a different search spell or check your magical filters
                </p>
                <button 
                  onClick={clearSearch}
                  className="magical-button bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Error State */}
            {searchState.error && (
              <div className="error-state text-center py-12">
                <div className="error-icon text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Magic Temporarily Unavailable
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchState.error}
                </p>
                <button 
                  onClick={retrySearch}
                  className="magical-button bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Property Detail Modal */}
        <PropertyModal
          property={modalState.property}
          isOpen={modalState.isOpen}
          onClose={closeModal}
        />
      </div>
    </ErrorBoundary>
  );
}