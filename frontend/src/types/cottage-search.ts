/**
 * TypeScript interfaces for Cottage Search components
 * Based on the existing Merlin's Cottage Search implementation
 */

export interface Property {
  id: string | number;
  title: string;
  description?: string;
  price?: number;
  propertyType?: 'cabin' | 'cottage' | 'house' | 'land' | string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  features?: string[];
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  similarity?: number; // For semantic search results
}

export interface SearchFilters {
  propertyType: string;
  priceRange: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchTime?: number;
  apiStatus: 'connected' | 'fallback' | 'error';
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Property[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  total: number;
  apiStatus: 'connected' | 'fallback' | 'error';
  expandedQuery?: string;
  searchTime?: number;
}

export interface ModalState {
  isOpen: boolean;
  property: Property | null;
}

// Component Props Interfaces
export interface SearchContainerProps {
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  onSearchComplete?: (results: Property[]) => void;
  className?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  showSimilarity?: boolean;
  className?: string;
}

export interface PropertyGridProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  isLoading?: boolean;
  className?: string;
}

export interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  searchEndpoint: string;
  propertiesEndpoint: string;
  timeout: number;
  retryAttempts: number;
}

// Disney Theme Configuration
export interface DisneyTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
  };
  gradients: {
    magical: string;
    sparkle: string;
    enchanted: string;
  };
  animations: {
    sparkle: string;
    glow: string;
    float: string;
  };
}

// Utility Types
export type SearchStatus = 'idle' | 'searching' | 'success' | 'error';
export type PropertyType = 'cabin' | 'cottage' | 'house' | 'land' | 'all';
export type PriceRange = '0-300000' | '300000-500000' | '500000-750000' | '750000-1000000' | '1000000+' | '';

// Constants
export const PRICE_RANGES = {
  '0-300000': { min: 0, max: 300000, label: 'Under $300k' },
  '300000-500000': { min: 300000, max: 500000, label: '$300k - $500k' },
  '500000-750000': { min: 500000, max: 750000, label: '$500k - $750k' },
  '750000-1000000': { min: 750000, max: 1000000, label: '$750k - $1M' },
  '1000000+': { min: 1000000, max: Infinity, label: '$1M+' },
} as const;

export const PROPERTY_TYPES = {
  cabin: 'Cabin',
  cottage: 'Cottage', 
  house: 'House',
  land: 'Land',
  all: 'All Types',
} as const;

export const DEFAULT_FILTERS: SearchFilters = {
  propertyType: '',
  priceRange: '',
};

export const DEFAULT_SEARCH_STATE: SearchState = {
  query: '',
  filters: DEFAULT_FILTERS,
  results: [],
  isLoading: false,
  error: null,
  hasSearched: false,
  total: 0,
  apiStatus: 'connected',
};

export const API_CONFIG: ApiConfig = {
  baseUrl: '/merlins_search',
  searchEndpoint: '/search',
  propertiesEndpoint: '/properties',
  timeout: 10000,
  retryAttempts: 3,
};