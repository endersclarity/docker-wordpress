'use client';

import React from 'react';
import { PropertyGridProps } from '@/types/cottage-search';
import PropertyCard from './PropertyCard';

/**
 * Grid layout for displaying property search results
 */
export default function PropertyGrid({
  properties,
  onPropertyClick,
  isLoading = false,
  className = ''
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className={`results-grid ${className}`}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-xl"></div>
              <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-b-xl space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`results-grid ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={onPropertyClick}
            showSimilarity={true}
          />
        ))}
      </div>
    </div>
  );
}