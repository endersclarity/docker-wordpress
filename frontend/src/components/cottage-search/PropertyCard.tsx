'use client';

import React from 'react';
import { PropertyCardProps } from '@/types/cottage-search';

/**
 * Individual property card component with magical theming
 * Displays property information with similarity scoring
 */
export default function PropertyCard({
  property,
  onClick,
  showSimilarity = true,
  className = ''
}: PropertyCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSimilarity = (similarity?: number) => {
    if (!similarity) return null;
    return `${Math.round(similarity * 100)}% match`;
  };

  return (
    <div 
      onClick={handleClick}
      className={`property-card group cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ${className}`}
    >
      {/* Property Image */}
      <div className="property-image relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🏠
          </div>
        )}
        
        {/* Similarity Badge */}
        {showSimilarity && property.similarity && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {formatSimilarity(property.similarity)}
          </div>
        )}

        {/* Property Type Badge */}
        {property.propertyType && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium capitalize">
            {property.propertyType}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="property-details p-4">
        <h3 className="property-title text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
          {property.title}
        </h3>

        {property.location && (
          <p className="property-location text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            📍 {property.location}
          </p>
        )}

        {property.description && (
          <p className="property-description text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Property Features */}
        <div className="property-features flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              🛏️ {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              🚿 {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          {property.squareFootage && (
            <span className="flex items-center gap-1">
              📐 {property.squareFootage.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Price */}
        <div className="property-price text-lg font-bold text-purple-600 dark:text-purple-400">
          {formatPrice(property.price)}
        </div>
      </div>
    </div>
  );
}