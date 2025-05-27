'use client';

import React, { useEffect } from 'react';
import { PropertyModalProps } from '@/types/cottage-search';

/**
 * Modal component for displaying detailed property information
 */
export default function PropertyModal({
  property,
  isOpen,
  onClose,
  className = ''
}: PropertyModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) {
    return null;
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`property-modal fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Modal Overlay */}
      <div 
        className="modal-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="modal-content relative bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          ×
        </button>

        {/* Modal Body */}
        <div className="modal-body p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Image */}
            <div className="property-image">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-64 lg:h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-96 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center text-6xl">
                  🏠
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="property-details space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {property.title}
                </h2>
                {property.location && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    📍 {property.location}
                  </p>
                )}
              </div>

              <div className="price text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(property.price)}
              </div>

              {property.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Property Features */}
              <div className="features grid grid-cols-2 gap-4">
                {property.bedrooms && (
                  <div className="feature-item">
                    <span className="text-2xl">🛏️</span>
                    <div>
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-500">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="feature-item">
                    <span className="text-2xl">🚿</span>
                    <div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-500">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}
                {property.squareFootage && (
                  <div className="feature-item">
                    <span className="text-2xl">📐</span>
                    <div>
                      <div className="font-semibold">{property.squareFootage.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Square Feet</div>
                    </div>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="feature-item">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="font-semibold">{property.yearBuilt}</div>
                      <div className="text-sm text-gray-500">Year Built</div>
                    </div>
                  </div>
                )}
              </div>

              {property.features && property.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.similarity && (
                <div className="similarity-score">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold">Search Match</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm inline-block">
                    {Math.round(property.similarity * 100)}% match
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}