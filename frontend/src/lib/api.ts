import axios from 'axios';
import type { 
  Property, 
  PropertySearchParams, 
  PropertySearchResponse, 
  SemanticSearchResponse,
  SiteConfig 
} from '@/types/property';

// API client configuration
const wordpressApi = axios.create({
  baseURL: 'http://localhost:8090/wp-json',
  headers: {
    'Content-Type': 'application/json',
  },
});

const searchApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// WordPress API functions
export async function getProperties(params: PropertySearchParams = {}): Promise<PropertySearchResponse> {
  try {
    const response = await wordpressApi.get('/mcp/v1/properties', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw new Error('Failed to fetch properties');
  }
}

export async function getProperty(id: number): Promise<Property> {
  try {
    const response = await wordpressApi.get(`/mcp/v1/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw new Error('Failed to fetch property');
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await wordpressApi.get('/mcp/v1/config');
    return response.data;
  } catch (error) {
    console.error('Error fetching site config:', error);
    throw new Error('Failed to fetch site configuration');
  }
}

// Semantic search functions
export async function semanticSearch(query: string, limit: number = 10): Promise<SemanticSearchResponse> {
  try {
    // First try the WordPress endpoint (which may proxy to external API)
    const response = await wordpressApi.post('/mcp/v1/search', { query, limit });
    return response.data;
  } catch (wpError) {
    console.warn('WordPress semantic search failed, trying direct API:', wpError);
    
    try {
      // Fallback to direct search API
      const response = await searchApi.post('/search', { query, limit });
      return {
        query,
        results: response.data.results || [],
        total_results: response.data.total_results || 0,
        search_time: response.data.search_time || 0,
      };
    } catch (directError) {
      console.error('Direct semantic search failed:', directError);
      throw new Error('Semantic search is currently unavailable');
    }
  }
}

// Authentication functions for future use
export async function authenticate(username: string, password: string) {
  try {
    const credentials = btoa(`${username}:${password}`);
    const response = await wordpressApi.get('/wp/v2/users/me', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw new Error('Authentication failed');
  }
}

// Utility function to handle API errors
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}