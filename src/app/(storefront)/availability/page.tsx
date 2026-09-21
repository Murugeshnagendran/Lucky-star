'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, Package, XCircle, Info } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';
import { supabase } from '@/lib/supabase/client';
import { Brand } from '@/lib/types';

interface AvailabilityProduct {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  modelNumber?: string;
  sku?: string;
  sellingPrice?: number;
  mrp?: number;
  stockQuantity: number;
  minimumStock: number;
  availabilityStatus: string;
  status: string;
  primaryImage: any;
  images: any[];
}

// Map availabilityStatus values to filter tab IDs
function getFilterId(availabilityStatus: string): string {
  switch (availabilityStatus) {
    case 'in_stock':
      return 'in_stock';
    case 'limited_stock':
      return 'limited';
    case 'out_of_stock':
    case 'currently_unavailable':
    case 'discontinued':
      return 'out_of_stock';
    case 'available_on_order':
      return 'on_order';
    default:
      return 'in_stock';
  }
}

// Map availabilityStatus to display label and colors
function getStatusDisplay(availabilityStatus: string) {
  switch (availabilityStatus) {
    case 'in_stock':
      return { label: 'IN STOCK', bg: 'bg-green-100 text-green-700' };
    case 'limited_stock':
      return { label: 'LIMITED STOCK', bg: 'bg-amber-100 text-amber-700' };
    case 'available_on_order':
      return { label: 'AVAILABLE ON ORDER', bg: 'bg-blue-100 text-blue-700' };
    case 'out_of_stock':
    case 'currently_unavailable':
      return { label: 'OUT OF STOCK', bg: 'bg-red-100 text-red-700' };
    case 'discontinued':
      return { label: 'DISCONTINUED', bg: 'bg-gray-100 text-gray-700' };
    default:
      return { label: availabilityStatus.toUpperCase().replace(/_/g, ' '), bg: 'bg-gray-100 text-gray-700' };
  }
}

export default function AvailabilityPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState<AvailabilityProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch active products from MongoDB
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) {
          const errText = await res.text();
          let errMsg = 'Failed to load products';
          try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
          throw new Error(errMsg);
        }
        const data: AvailabilityProduct[] = await res.json();
        setProducts(data);

        // Fetch brands from Firestore for name resolution
        const brs = await supabase.from('brands').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug, order: 0, enabled: true, createdAt: '', updatedAt: ''})) || []);
        setBrands(brs);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getBrandName = (brandId: string) =>
    brands.find((b) => b.id === brandId)?.name || '';

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => getFilterId(p.availabilityStatus) === activeFilter);

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'in_stock', label: 'In Stock', icon: CheckCircle, color: 'text-green-600' },
    { id: 'limited', label: 'Limited Stock', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'on_order', label: 'Available on Order', icon: Package, color: 'text-blue-600' },
    { id: 'out_of_stock', label: 'Out of Stock', icon: XCircle, color: 'text-red-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-poppins font-bold text-[#2D2D2D] mb-3">Current Availability</h1>
        <p className="text-gray-600">Check what&apos;s available at our store right now.</p>
        <div className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full mt-4">
          <Info size={14} className="mr-1.5 text-blue-500" />
          Availability is based on the latest information from our store team
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar border-b border-gray-200">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => setActiveFilter(status.id)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-t-lg font-medium text-sm transition-colors border-b-2 ${
              activeFilter === status.id
                ? 'border-[#C41E24] text-[#C41E24] bg-red-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {status.icon && <status.icon size={16} className={`inline mr-2 ${status.color}`} />}
            {status.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded w-full mt-3" />
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
            {activeFilter === 'all'
              ? 'No products are currently available.'
              : 'No products match this filter.'}
          </h2>
          <p className="text-gray-500">
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-[#C41E24] hover:underline"
              >
                View all products
              </button>
            )}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => {
            const imageUrl = getImageUrl(p.primaryImage);
            const statusDisplay = getStatusDisplay(p.availabilityStatus);
            const brandName = getBrandName(p.brandId);

            return (
              <Link
                href={`/products/${p.slug}`}
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-square bg-gray-50 relative p-4 flex items-center justify-center">
                  <div
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded ${statusDisplay.bg}`}
                  >
                    {statusDisplay.label}
                  </div>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-2xl">
                      📷
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {brandName && (
                    <span className="text-xs text-gray-500 font-medium mb-1 block">{brandName}</span>
                  )}
                  <h3 className="font-medium text-[#2D2D2D] text-sm leading-tight mb-1 line-clamp-2">
                    {p.name}
                  </h3>
                  {p.sellingPrice != null && (
                    <p className="text-sm font-semibold text-[#2D2D2D] mb-3">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                      {p.mrp != null && p.mrp > p.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          ₹{p.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  )}
                  <span className="text-[#C41E24] text-xs font-semibold hover:underline block text-center border border-gray-200 rounded py-1.5">
                    View Details
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

