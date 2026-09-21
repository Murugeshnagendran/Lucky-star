'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';
import { Category } from '@/lib/types';
import { getImageUrl } from '@/lib/utils/image';
import { Spinner } from '@/components/ui';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
       const { data } = await supabase.from('categories').select('*').order('name');
       if (data) {
          const mapped = data.map(d => ({
             id: d.id, name: d.name, slug: d.slug, description: d.description,
             imageUrl: d.image_url, enabled: d.enabled
          }));
          setCategories(mapped as any);
       }
       setLoading(false);
    };
    fetchCategories();

    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/products?active=true', { cache: 'no-store' });
        if (res.ok) {
          const products = await res.json();
          const counts: Record<string, number> = {};
          products.forEach((p: any) => {
            if (p.categoryId) {
              counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
            }
          });
          setProductCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching product counts:', err);
      }
    };
    
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-poppins font-bold text-[#2D2D2D] mb-4">
          All Categories
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore our wide range of high-quality electronics and home appliances.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 mb-4">No categories found.</p>
          <Link href="/products" className="text-[#C41E24] font-medium hover:underline">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
                {category.imageUrl ? (
                  <img
                    src={getImageUrl(category.imageUrl)}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                )}
                
                {/* Product Count Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-sm">
                  {productCounts[category.id] || 0} Products
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-poppins font-semibold text-lg text-[#2D2D2D] mb-1 group-hover:text-[#C41E24] transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
