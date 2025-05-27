'use client';

import { useState, useCallback, useRef } from 'react';
import { SearchState, SearchFilters, DEFAULT_SEARCH_STATE } from '@/types/cottage-search';

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  debounceMs?: number;
}

/**
 * Custom hook for managing cottage search state and API calls
 * Handles debounced search, filters, and error states
 */
export function useSearch({
  initialQuery = '',
  initialFilters = DEFAULT_SEARCH_STATE.filters,
  debounceMs = 500
}: UseSearchOptions = {}) {
  const [searchState, setSearchState] = useState<SearchState>({
    ...DEFAULT_SEARCH_STATE,
    query: initialQuery,
    filters: initialFilters,
  });

  const debounceRef = useRef<NodeJS.Timeout>();

  // Update query with debounced search
  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
    
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new timeout for debounced search
    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        performSearch(query, searchState.filters);
      }, debounceMs);
    }
  }, [debounceMs, searchState.filters]);

  // Update filters and trigger search if query exists
  const updateFilters = useCallback((filters: SearchFilters) => {
    setSearchState(prev => ({ ...prev, filters }));
    
    if (searchState.query.trim()) {
      performSearch(searchState.query, filters);
    }
  }, [searchState.query]);

  // Perform search API call
  const performSearch = useCallback(async (query?: string, filters?: SearchFilters) => {
    const searchQuery = query || searchState.query;
    const searchFilters = filters || searchState.filters;
    
    if (!searchQuery.trim()) return;

    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual API call
      const mockResults = await mockSearchAPI(searchQuery, searchFilters);
      
      setSearchState(prev => ({
        ...prev,
        results: mockResults.properties,
        total: mockResults.total,
        isLoading: false,
        hasSearched: true,
        apiStatus: mockResults.apiStatus,
      }));
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
        apiStatus: 'error',
      }));
    }
  }, [searchState.query, searchState.filters]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchState({
      ...DEFAULT_SEARCH_STATE,
      query: '',
      filters: initialFilters,
    });
  }, [initialFilters]);

  // Retry last search
  const retrySearch = useCallback(() => {
    performSearch();
  }, [performSearch]);

  return {
    searchState,
    performSearch,
    updateQuery,
    updateFilters,
    clearSearch,
    retrySearch,
  };
}

// Mock API function - replace with actual implementation
async function mockSearchAPI(query: string, filters: SearchFilters) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    properties: [
      {
        id: '1',
        title: 'Magical Forest Cabin',
        description: 'A cozy cabin nestled in the enchanted woods',
        price: 450000,
        propertyType: 'cabin',
        location: 'Nevada City, CA',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1200,
        similarity: 0.85,
        images: []
      }
    ],
    total: 1,
    apiStatus: 'connected' as const
  };
}