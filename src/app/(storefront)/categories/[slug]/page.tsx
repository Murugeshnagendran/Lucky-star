'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';
import { Product, Category, Brand, AVAILABILITY_LABELS } from '@/lib/types';
import { Spinner } from '@/components/ui';
import { getImageUrl } from '@/lib/utils/image';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const categoryName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFound, setCategoryFound] = useState(true);
  const [resolvedCategoryName, setResolvedCategoryName] = useState(categoryName);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Look up the category by slug in Firestore to get its ID
        const { data: catSnapshot } = await supabase.from('categories').select('*').eq('slug', slug.toLowerCase());

        if (!catSnapshot || catSnapshot.length === 0) {
          setCategoryFound(false);
          setLoading(false);
          return;
        }

        const categoryId = catSnapshot[0].id;
        const catData = catSnapshot[0];
        if (catData.name) {
          setResolvedCategoryName(catData.name);
        }

        // Step 2: Fetch active products for this category from MongoDB
        const res = await fetch(`/api/products?categoryId=${encodeURIComponent(categoryId)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          const errText = await res.text();
          let errMsg = 'Failed to load products';
          try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
          throw new Error(errMsg);
        }

        const mongoProducts: Product[] = await res.json();
        setProducts(mongoProducts);

        // Step 3: Load brands for name resolution
        const brs = await supabase.from('brands').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug, order: 0, enabled: true, createdAt: '', updatedAt: ''})) || []);
        setBrands(brs);
      } catch (err: any) {
        console.error('Error fetching category products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const getBrandName = (brandId: string) =>
    brands.find(b => b.id === brandId)?.name || '';

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700';
      case 'limited_stock': return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock': return 'bg-red-100 text-red-700';
      case 'available_on_order': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-poppins font-bold text-[#2D2D2D]">{resolvedCategoryName}</h1>
        <p className="text-gray-500 mt-2">Explore our collection of high-quality {resolvedCategoryName.toLowerCase()}.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">Unable to load products</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-2.5 bg-[#C41E24] text-white font-medium rounded-full hover:bg-[#9B1B20] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">No products available in this category.</h2>
          <p className="text-gray-500 mb-6">
            {categoryFound
              ? 'Check back later for new arrivals or browse other categories.'
              : 'This category may not exist yet. Browse our available categories.'}
          </p>
          <Link
            href="/categories"
            className="inline-block px-6 py-2.5 bg-[#C41E24] text-white font-medium rounded-full hover:bg-[#9B1B20] transition-colors"
          >
            Browse Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => {
            const imageUrl = getImageUrl(product.primaryImage);
            const brandName = getBrandName(product.brandId);

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>
                  )}
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-[#C41E24] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  {brandName && (
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{brandName}</span>
                  )}
                  <h3 className="font-medium text-sm mt-1 text-[#2D2D2D] line-clamp-2 group-hover:text-[#C41E24] transition-colors">
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="mt-auto pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#2D2D2D]">
                        ₹{product.sellingPrice?.toLocaleString('en-IN')}
                      </span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.mrp?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mt-2">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${getAvailabilityColor(product.availabilityStatus)}`}>
                      {AVAILABILITY_LABELS[product.availabilityStatus] || product.availabilityStatus}
                    </span>
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

