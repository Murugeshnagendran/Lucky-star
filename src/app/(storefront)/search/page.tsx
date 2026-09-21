'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-[#2D2D2D]">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-500 mt-2">Showing results matching your query.</p>
      </div>

      {query ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Dummy Results */}
          {[1,2,3].map(i => (
             <Link href={`/products/demo`} key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all p-4 flex flex-col group">
                <div className="aspect-square bg-gray-50 rounded-md mb-4"></div>
                <h3 className="font-medium text-sm group-hover:text-[#C41E24]">Matching Product {i}</h3>
             </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Please enter a search term.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}

