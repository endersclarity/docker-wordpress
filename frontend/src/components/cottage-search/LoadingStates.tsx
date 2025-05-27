'use client';

import React from 'react';
import { LoadingStateProps } from '@/types/cottage-search';

/**
 * Magical loading states component with crystal ball animation
 */
export default function LoadingStates({
  isLoading,
  message = "Consulting the crystal ball...",
  className = ''
}: LoadingStateProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className={`search-status ${className}`}>
      <div className="loading-spinner flex flex-col items-center justify-center py-12">
        {/* Magical Orb */}
        <div className="magical-orb relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-spin">
            <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
          </div>
          {/* Sparkles */}
          <div className="absolute -inset-4">
            <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-2 right-0 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-150"></div>
            <div className="absolute bottom-0 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
            <div className="absolute bottom-2 left-0 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-450"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <span className="loading-text text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
}