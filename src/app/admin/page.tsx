'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, ProductEnquiry, FurnitureRequest, AVAILABILITY_LABELS } from '@/lib/types';
import { Spinner, AvailabilityBadge, Badge } from '@/components/ui';
import Link from 'next/link';

import { getImageUrl } from '@/lib/utils/image';
import { mapEnquiryToCamelCase, mapFurnitureRequestToCamelCase, mapProductToCamelCase } from '@/lib/utils/mapper';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<ProductEnquiry[]>([]);
  const [furnitureRequests, setFurnitureRequests] = useState<FurnitureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: prodsData },
          { data: enqsData },
          { data: frsData }
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('furniture_requests').select('*').order('created_at', { ascending: false }),
        ]);

        const prods = (prodsData || []).map(mapProductToCamelCase) as any;
        const enqs = (enqsData || []).map(mapEnquiryToCamelCase) as any;
        const frs = (frsData || []).map(mapFurnitureRequestToCamelCase) as any;

        let mongoProds: Product[] = [];
        try {
          const res = await fetch('/api/admin/products');
          if (res.ok) mongoProds = await res.json();
        } catch (e) {}

        setProducts([...mongoProds, ...prods]);
        setEnquiries(enqs);
        setFurnitureRequests(frs);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  const activeProducts = products.filter(p => p.status === 'active');
  const inStock = products.filter(p => p.availabilityStatus === 'in_stock').length;
  const limitedStock = products.filter(p => p.availabilityStatus === 'limited_stock').length;
  const outOfStock = products.filter(p => p.availabilityStatus === 'out_of_stock').length;
  const onOrder = products.filter(p => p.availabilityStatus === 'available_on_order').length;
  const pendingEnquiries = enquiries.filter(e => e.status === 'new').length;
  const pendingFR = furnitureRequests.filter(f => f.status === 'new').length;
  const lowStockProducts = products.filter(p => p.status === 'active' && p.stockQuantity <= p.minimumStock && p.stockQuantity > 0);
  const outOfStockProducts = products.filter(p => p.status === 'active' && p.stockQuantity === 0);

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Active Products', value: activeProducts.length, icon: '✅', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'In Stock', value: inStock, icon: '🟢', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Limited Stock', value: limitedStock, icon: '🟡', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Out of Stock', value: outOfStock, icon: '🔴', bg: 'bg-red-50', text: 'text-red-600' },
    { label: 'On Order', value: onOrder, icon: '🔵', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Enquiries', value: enquiries.length, icon: '💬', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Pending Enquiries', value: pendingEnquiries, icon: '⏳', bg: 'bg-orange-50', text: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
          Dashboard
        </h1>
        <span className="text-sm text-neutral-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center text-lg`}>{s.icon}</div>
              <div>
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-charcoal">⚠️ Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-sm text-brand-red hover:underline">View All</Link>
          </div>
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">All products are well stocked!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...outOfStockProducts, ...lowStockProducts].slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {getImageUrl(p.primaryImage) ? (
                      <img src={getImageUrl(p.primaryImage)} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-neutral-100" />
                    )}
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${p.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stockQuantity}
                    </span>
                    <AvailabilityBadge status={p.availabilityStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-charcoal">💬 Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm text-brand-red hover:underline">View All</Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No enquiries yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {enquiries.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.customerName}</p>
                    <p className="text-xs text-neutral-400 truncate">{e.productName}</p>
                  </div>
                  <Badge variant={e.status === 'new' ? 'warning' : e.status === 'contacted' ? 'info' : e.status === 'quoted' ? 'success' : 'neutral'}>
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Furniture Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-charcoal">🪑 Furniture Requests</h2>
            <Link href="/admin/furniture-requests" className="text-sm text-brand-red hover:underline">View All</Link>
          </div>
          {furnitureRequests.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No furniture requests yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {furnitureRequests.slice(0, 5).map(f => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{f.customerName}</p>
                    <p className="text-xs text-neutral-400 truncate">{f.furnitureType} • {f.budget || 'No budget specified'}</p>
                  </div>
                  <Badge variant={f.status === 'new' ? 'warning' : f.status === 'completed' ? 'success' : 'info'}>
                    {f.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <h2 className="font-semibold text-brand-charcoal mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/products/add" className="flex items-center gap-2 p-3 rounded-lg bg-brand-red text-white hover:bg-brand-red-dark transition-colors text-sm font-medium">
              ➕ Add Product
            </Link>
            <Link href="/admin/inventory" className="flex items-center gap-2 p-3 rounded-lg bg-brand-charcoal text-white hover:bg-brand-charcoal-light transition-colors text-sm font-medium">
              📋 Inventory
            </Link>
            <Link href="/admin/enquiries" className="flex items-center gap-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
              💬 Enquiries ({pendingEnquiries})
            </Link>
            <Link href="/admin/furniture-requests" className="flex items-center gap-2 p-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm font-medium">
              🪑 Furniture ({pendingFR})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
