'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getImageUrl } from '@/lib/utils/image';
import { AVAILABILITY_LABELS } from '@/lib/types';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  modelNumber?: string;
  sku?: string;
  sellingPrice?: number;
  mrp?: number;
  discount?: number;
  availabilityStatus: string;
  primaryImage: any;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);
      try {

        // Fetch brands and categories for name matching
        const [brandsRes, catsRes] = await Promise.all([
          supabase.from('brands').select('id, name').eq('enabled', true),
          supabase.from('categories').select('id, name').eq('enabled', true),
        ]);

        const brands = brandsRes.data || [];
        const categories = catsRes.data || [];

        // Find brand/category IDs whose names match the search query
        const lowerQuery = query.trim().toLowerCase();
        const isShortQuery = lowerQuery.length <= 2;
        const shortQueryRegex = new RegExp(`\\b${lowerQuery}\\b`, 'i');

        const matchingBrandIds = brands
          .filter(b => isShortQuery ? shortQueryRegex.test(b.name) : b.name.toLowerCase().includes(lowerQuery))
          .map(b => b.id);
        const matchingCatIds = categories
          .filter(c => isShortQuery ? shortQueryRegex.test(c.name) : c.name.toLowerCase().includes(lowerQuery))
          .map(c => c.id);

        // Build an OR filter for products
        const orFilters: string[] = [];
        
        if (isShortQuery) {
          // Whole-word matching for short queries using Postgres word boundaries (\y)
          const pattern = `\\y${lowerQuery}\\y`;
          orFilters.push(`name.imatch.${pattern}`);
          orFilters.push(`model_number.imatch.${pattern}`);
          orFilters.push(`sku.imatch.${pattern}`);
        } else {
          // Normal partial match for longer queries
          const searchTerm = `%${lowerQuery}%`;
          orFilters.push(`name.ilike.${searchTerm}`);
          orFilters.push(`model_number.ilike.${searchTerm}`);
          orFilters.push(`sku.ilike.${searchTerm}`);
        }

        if (matchingBrandIds.length > 0) {
          orFilters.push(`brand_id.in.(${matchingBrandIds.join(',')})`);
        }
        if (matchingCatIds.length > 0) {
          orFilters.push(`category_id.in.(${matchingCatIds.join(',')})`);
        }

        const { data, error: queryError } = await supabase
          .from('products')
          .select('id, name, slug, brand_id, category_id, model_number, sku, selling_price, mrp, discount, availability_status, primary_image')
          .eq('status', 'active')
          .or(orFilters.join(','));

        if (queryError) throw queryError;

        const mapped: SearchProduct[] = (data || []).map(p => {
          const brand = brands.find(b => b.id === p.brand_id);
          const cat = categories.find(c => c.id === p.category_id);
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            brandId: p.brand_id,
            brandName: brand?.name || '',
            categoryId: p.category_id,
            categoryName: cat?.name || '',
            modelNumber: p.model_number,
            sku: p.sku,
            sellingPrice: p.selling_price,
            mrp: p.mrp,
            discount: p.discount,
            availabilityStatus: p.availability_status,
            primaryImage: p.primary_image,
          };
        });

        setResults(mapped);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700';
      case 'limited_stock': return 'bg-amber-100 text-amber-700';
      case 'out_of_stock': return 'bg-red-100 text-red-700';
      case 'available_on_order': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-poppins font-bold text-[#2D2D2D]">
          Search Results for &quot;{query}&quot;
        </h1>
        {!loading && query && (
          <p className="text-gray-500 mt-2">
            {results.length} {results.length === 1 ? 'product' : 'products'} found.
          </p>
        )}
      </div>

      {/* No query entered */}
      {!query && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Please enter a search term.</p>
        </div>
      )}

      {/* Loading skeleton */}
      {query && loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse flex flex-col">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-100 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {query && !loading && error && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#C41E24] text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* No results */}
      {query && !loading && !error && results.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="mx-auto mb-4 text-gray-300" size={48} />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No products found</h2>
          <p className="text-gray-500 mb-6">Try a different search term or browse our products.</p>
          <Link href="/products" className="text-[#C41E24] font-medium hover:underline">
            Browse All Products
          </Link>
        </div>
      )}

      {/* Results grid */}
      {query && !loading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map(p => {
            const imageUrl = getImageUrl(p.primaryImage);
            const availLabel = (AVAILABILITY_LABELS as Record<string, string>)[p.availabilityStatus] || p.availabilityStatus;

            return (
              <Link
                href={`/products/${p.slug}`}
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden p-4 flex items-center justify-center">
                  <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded ${getAvailabilityColor(p.availabilityStatus)}`}>
                    {availLabel}
                  </div>
                  {p.discount != null && p.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-[#C41E24] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {p.discount}% OFF
                    </span>
                  )}
                  {imageUrl ? (
                    <img src={imageUrl} alt={p.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-3xl">📷</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {p.brandName && <span className="text-xs text-gray-500 font-medium mb-1">{p.brandName}</span>}
                  <h3 className="font-medium text-[#2D2D2D] text-sm md:text-base leading-tight mb-2 line-clamp-2 group-hover:text-[#C41E24] transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                    <div>
                      {p.sellingPrice != null && (
                        <span className="text-base font-bold text-[#2D2D2D]">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {p.mrp != null && p.sellingPrice != null && p.mrp > p.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          ₹{p.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[#C41E24] text-xs font-semibold hover:underline">View Details</span>
                  </div>
                </div>
              </Link>
            );
          })}
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
