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
      // Use real semantic search API
      const response = await fetch('http://172.22.206.209:5002/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API results to match frontend format
      const transformedResults = data.results.map((result: any) => ({
        id: result.id.toString(),
        title: result.address,
        description: result.description,
        price: result.price,
        propertyType: result.architectural_style || 'residential',
        location: `${result.city}, CA`,
        bedrooms: result.bedrooms,
        bathrooms: result.bathrooms,
        squareFootage: result.sqft,
        similarity: result.similarity_score,
        images: [], // TODO: Add image support
        expandedQuery: data.expanded_query,
        searchTime: data.search_time
      }));
      
      setSearchState(prev => ({
        ...prev,
        results: transformedResults,
        total: data.total_results,
        isLoading: false,
        hasSearched: true,
        apiStatus: 'connected',
        expandedQuery: data.expanded_query,
        searchTime: data.search_time
      }));
    } catch (error) {
      console.error('Semantic search error:', error);
      // Fallback to mock data if API fails
      try {
        const mockResults = await mockSearchAPI(searchQuery, searchFilters);
        setSearchState(prev => ({
          ...prev,
          results: mockResults.properties,
          total: mockResults.total,
          isLoading: false,
          hasSearched: true,
          apiStatus: 'fallback',
        }));
      } catch (fallbackError) {
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Search failed',
          apiStatus: 'error',
        }));
      }
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