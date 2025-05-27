export interface Property {
  id: number;
  title: string;
  description: string;
  type: 'cottage' | 'house' | 'estate' | 'cabin';
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  location: string;
  features: string[];
  image_url?: string;
  images?: string[];
  amenities?: string[];
  created_at: string;
  updated_at?: string;
}

export interface PropertySearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  type?: string;
  price_min?: number;
  price_max?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SemanticSearchResult {
  property_id: number;
  title: string;
  similarity_score: number;
  excerpt: string;
  price: number;
  type: string;
  image_url?: string;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchResult[];
  total_results: number;
  search_time: number;
}

export interface SiteConfig {
  site_name: string;
  site_description: string;
  site_url: string;
  api_version: string;
  features: {
    semantic_search: boolean;
    property_filters: boolean;
    image_galleries: boolean;
    contact_forms: boolean;
  };
  property_types: string[];
  search_api_url: string;
}