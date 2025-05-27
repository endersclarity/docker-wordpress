'use client';

import React, { useRef, useEffect } from 'react';
import { SearchInputProps } from '@/types/cottage-search';

/**
 * Magical search input component with Disney theming
 * Features debounced input and crystal ball search button
 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe your dream cottage...",
  isLoading = false,
  className = ''
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`cottage-search-form ${className}`}>
      <div className="search-input-container relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="search-input magical-input w-full px-6 py-4 pr-16 text-lg border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:outline-none transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          autoComplete="off"
        />
        
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="search-button magical-button absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
        >
          <span className="button-text hidden sm:inline">Search</span>
          <span className="button-icon text-xl">
            {isLoading ? '⏳' : '🔮'}
          </span>
        </button>
      </div>
    </form>
  );
}