'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, Category, Brand } from '@/lib/types';
import { Spinner, AvailabilityBadge, Badge, Button, ConfirmDialog, EmptyState } from '@/components/ui';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const res = await fetch('/api/admin/products', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        
        let mongoProds: Product[] = [];
        if (res.ok) {
          mongoProds = await res.json();
        } else {
          console.error('Failed to fetch products');
        }

        const [catsRes, brsRes] = await Promise.all([
          supabase.from('categories').select('*').order('display_order', { ascending: true }),
          supabase.from('brands').select('*').order('name', { ascending: true }),
        ]);

        setProducts(mongoProds);
        setCategories(catsRes.data as unknown as Category[] || []);
        setBrands(brsRes.data as unknown as Brand[] || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '—';
  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || '—';

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && p.categoryId !== filterCategory) return false;
    if (filterBrand && p.brandId !== filterBrand) return false;
    if (filterAvailability && p.availabilityStatus !== filterAvailability) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: deleteId }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'Failed to delete product';
        try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      setProducts(prev => prev.map(p => p.id === deleteId ? { ...p, status: 'discontinued' as const } : p));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>Products</h1>
        <Link href="/admin/products/add">
          <Button variant="primary">➕ Add Product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="">All Availability</option>
            <option value="in_stock">In Stock</option>
            <option value="limited_stock">Limited Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="available_on_order">On Order</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No products found" description={products.length === 0 ? 'Add your first product to get started.' : 'Try adjusting your filters.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-3 font-medium text-neutral-500">Product</th>
                  <th className="text-left p-3 font-medium text-neutral-500 hidden md:table-cell">SKU</th>
                  <th className="text-left p-3 font-medium text-neutral-500 hidden lg:table-cell">Category</th>
                  <th className="text-left p-3 font-medium text-neutral-500 hidden lg:table-cell">Brand</th>
                  <th className="text-right p-3 font-medium text-neutral-500">Price</th>
                  <th className="text-center p-3 font-medium text-neutral-500">Stock</th>
                  <th className="text-center p-3 font-medium text-neutral-500">Availability</th>
                  <th className="text-center p-3 font-medium text-neutral-500 hidden md:table-cell">Status</th>
                  <th className="text-center p-3 font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {getImageUrl(p.primaryImage) ? (
                          <img src={getImageUrl(p.primaryImage)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-300">📷</div>
                        )}
                        <span className="font-medium text-brand-charcoal truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-500 hidden md:table-cell">{p.sku || '—'}</td>
                    <td className="p-3 text-neutral-500 hidden lg:table-cell">{getCategoryName(p.categoryId)}</td>
                    <td className="p-3 text-neutral-500 hidden lg:table-cell">{getBrandName(p.brandId)}</td>
                    <td className="p-3 text-right font-semibold text-brand-charcoal">₹{p.sellingPrice?.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${p.stockQuantity === 0 ? 'text-red-600' : p.stockQuantity <= p.minimumStock ? 'text-amber-600' : 'text-green-600'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-3 text-center"><AvailabilityBadge status={p.availabilityStatus} /></td>
                    <td className="p-3 text-center hidden md:table-cell">
                      <Badge variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Edit</Link>
                        <button onClick={() => setDeleteId(p.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Product"
        message="This will mark the product as discontinued. It will no longer appear on the customer website."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
