'use client';

import React from 'react';
import Link from 'next/link';
import { useCategories } from '@/lib/hooks/useCategories';
import { getImageUrl } from '@/lib/utils/image';
import { Spinner } from '@/components/ui';

export default function HomePageCategories() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center py-10 text-red-500">
        Error loading categories: {error}
      </div>
    );
  }

  const activeCategories = categories.slice(0, 6);

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No categories available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {activeCategories.map((cat) => {
        const imageUrl = getImageUrl(cat.imageUrl || cat.image);
        return (
          <Link 
            key={cat.id}
            href={`/categories/${cat.slug}`} 
            className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors overflow-hidden relative">
              {imageUrl ? (
                <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-[#C41E24] rounded-md opacity-20"></div>
              )}
            </div>
            <span className="text-sm font-medium text-center text-[#2D2D2D] line-clamp-1">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

