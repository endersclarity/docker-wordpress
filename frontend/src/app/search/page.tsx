'use client';

import { Suspense } from 'react';
import { SearchContainer } from '@/components/cottage-search';
import { useSearchParams } from 'next/navigation';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchContainer 
        initialQuery={initialQuery}
        className="w-full"
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}