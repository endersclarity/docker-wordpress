import useSWR from 'swr';
import { getProperties, getProperty } from '@/lib/api';
import type { PropertySearchParams } from '@/types/property';

export function useProperties(params: PropertySearchParams = {}) {
  const key = ['properties', params];
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getProperties(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    properties: data?.properties || [],
    total: data?.total || 0,
    hasMore: data?.has_more || false,
    isLoading,
    error,
    mutate,
  };
}

export function useProperty(id: number) {
  const { data, error, isLoading } = useSWR(
    id ? `property-${id}` : null,
    () => getProperty(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    property: data,
    isLoading,
    error,
  };
}