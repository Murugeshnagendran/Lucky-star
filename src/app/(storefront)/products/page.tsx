'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, XCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils/image';
import { supabase } from '@/lib/supabase/client';
import { Brand, Category, AVAILABILITY_LABELS } from '@/lib/types';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  modelNumber?: string;
  sku?: string;
  sellingPrice?: number;
  mrp?: number;
  discount?: number;
  stockQuantity: number;
  minimumStock: number;
  availabilityStatus: string;
  status: string;
  primaryImage: any;
  images: any[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, catRes, brandRes] = await Promise.all([fetch('/api/products', { cache: 'no-store' }), supabase.from('categories').select('*').eq('enabled', true), supabase.from('brands').select('*').eq('enabled', true)]);
        const cats = catRes.data || [];
        const brs = brandRes.data || [];

        if (!productsRes.ok) {
          const errText = await productsRes.text();
          let errMsg = 'Failed to load products';
          try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
          throw new Error(errMsg);
        }

        const data: ProductItem[] = await productsRes.json();
        setProducts(data);
        setCategories(cats.filter(c => c.enabled));
        setBrands(brs.filter(b => b.enabled));
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getBrandName = (brandId: string) =>
    brands.find(b => b.id === brandId)?.name || '';

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  // Apply client-side filters
  const filtered = products
    .filter(p => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId)) return false;
      if (selectedAvailability.length > 0 && !selectedAvailability.includes(p.availabilityStatus)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case 'price_high': return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        case 'name_az': return a.name.localeCompare(b.name);
        default: return 0; // newest — already sorted by API
      }
    });

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700';
      case 'limited_stock': return 'bg-amber-100 text-amber-700';
      case 'out_of_stock': return 'bg-red-100 text-red-700';
      case 'available_on_order': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filterSidebar = (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-lg border-b pb-3 mb-4">Filters</h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-[#2D2D2D] mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleFilter(selectedCategories, cat.id, setSelectedCategories)}
                className="rounded text-[#C41E24] focus:ring-[#C41E24]"
              />
              <span>{cat.name}</span>
            </label>
          ))}
          {categories.length === 0 && !loading && (
            <p className="text-xs text-gray-400">No categories available</p>
          )}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-[#2D2D2D] mb-3">Brands</h4>
        <div className="space-y-2">
          {brands.map(brand => (
            <label key={brand.id} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.id)}
                onChange={() => toggleFilter(selectedBrands, brand.id, setSelectedBrands)}
                className="rounded text-[#C41E24] focus:ring-[#C41E24]"
              />
              <span>{brand.name}</span>
            </label>
          ))}
          {brands.length === 0 && !loading && (
            <p className="text-xs text-gray-400">No brands available</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-[#2D2D2D] mb-3">Availability</h4>
        <div className="space-y-2">
          {[
            { value: 'in_stock', label: 'In Stock', color: 'text-green-600' },
            { value: 'limited_stock', label: 'Limited Stock', color: 'text-amber-500' },
            { value: 'available_on_order', label: 'On Order', color: 'text-blue-600' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAvailability.includes(opt.value)}
                onChange={() => toggleFilter(selectedAvailability, opt.value, setSelectedAvailability)}
                className="rounded text-[#C41E24] focus:ring-[#C41E24]"
              />
              <span className={opt.color}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-poppins font-bold text-[#2D2D2D]">All Products</h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-2 border px-3 py-1.5 rounded-lg text-sm bg-white"
          >
            <Filter size={16} /> <span>Filters</span>
          </button>

          <div className="relative hidden md:block">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#C41E24]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_az">Name: A to Z</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      {showMobileFilters && (
        <div className="md:hidden mb-6">{filterSidebar}</div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start">
          {filterSidebar}
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          {!loading && error && (
            <div className="text-center py-16">
              <XCircle className="mx-auto mb-4 text-red-400" size={48} />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Unable to load products</h2>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#C41E24] text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto mb-4 text-gray-300" size={48} />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {products.length === 0
                  ? 'No products are currently available.'
                  : 'No products match your filters.'}
              </h2>
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedAvailability.length > 0) && (
                <button
                  onClick={() => { setSelectedCategories([]); setSelectedBrands([]); setSelectedAvailability([]); }}
                  className="text-[#C41E24] hover:underline text-sm mt-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map(p => {
                  const imageUrl = getImageUrl(p.primaryImage);
                  const brandName = getBrandName(p.brandId);
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
                        {brandName && <span className="text-xs text-gray-500 font-medium mb-1">{brandName}</span>}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

