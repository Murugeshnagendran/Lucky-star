'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, AvailabilityStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Select, Modal, Spinner, AvailabilityBadge, EmptyState } from '@/components/ui';
import { getImageUrl } from '@/lib/utils/image';

export default function AdminInventoryPage() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'low' | 'out'>('all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'remove' | 'set'>('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [reason, setReason] = useState('');
  const [newAvailability, setNewAvailability] = useState<AvailabilityStatus>('in_stock');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: prods, error } = await supabase.from('products').select('*');
    
    let mongoProds: Product[] = [];
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) mongoProds = await res.json();
    } catch (e) {}
    
    const all = [...mongoProds, ...(prods || [])];
    setProducts(all.filter(p => p.status !== 'discontinued'));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const inStock = products.filter(p => p.availabilityStatus === 'in_stock').length;
  const limited = products.filter(p => p.availabilityStatus === 'limited_stock').length;
  const outOfStock = products.filter(p => p.stockQuantity === 0).length;
  const onOrder = products.filter(p => p.availabilityStatus === 'available_on_order').length;

  const filtered = tab === 'low' ? products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minimumStock)
    : tab === 'out' ? products.filter(p => p.stockQuantity === 0) : products;

  const openAdjust = (p: Product) => {
    setModalProduct(p); setAdjustType('add'); setAdjustQty(''); setReason('');
    const suggestAvail = p.stockQuantity > p.minimumStock ? 'in_stock' : p.stockQuantity > 0 ? 'limited_stock' : 'out_of_stock';
    setNewAvailability(suggestAvail as AvailabilityStatus);
  };

  const handleAdjust = async () => {
    if (!modalProduct || !adjustQty || !reason) { alert('Fill quantity and reason.'); return; }
    setSaving(true);
    const prev = modalProduct.stockQuantity;
    let newQty = prev;
    const qty = Number(adjustQty);
    if (adjustType === 'add') newQty = prev + qty;
    else if (adjustType === 'remove') newQty = Math.max(0, prev - qty);
    else newQty = qty;

    // Auto-suggest availability based on new quantity
    let finalAvail = newAvailability;
    if (newQty > modalProduct.minimumStock && finalAvail !== 'available_on_order') finalAvail = 'in_stock';
    else if (newQty > 0 && newQty <= modalProduct.minimumStock) finalAvail = 'limited_stock';
    else if (newQty === 0 && finalAvail !== 'available_on_order') finalAvail = 'out_of_stock';

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stockQuantity: newQty, availabilityStatus: finalAvail, updatedAt: new Date().toISOString() })
        .eq('id', modalProduct.id);
      if (updateError) throw updateError;
      
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert([{ productId: modalProduct.id, productName: modalProduct.name, previousQty: prev, newQty, change: newQty - prev, reason, adminId: userProfile?.id || '', adminName: userProfile?.name || '', timestamp: new Date().toISOString() }]);
      if (logError) throw logError;
      
      setModalProduct(null); await load();
    } catch (e) { console.error(e); alert('Error adjusting stock.'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-charcoal">Inventory</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: products.length, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'In Stock', value: inStock, bg: 'bg-green-50', text: 'text-green-600' },
          { label: 'Limited', value: limited, bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Out of Stock', value: outOfStock, bg: 'bg-red-50', text: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4`}><p className="text-xs text-neutral-500">{s.label}</p><p className={`text-2xl font-bold ${s.text}`}>{s.value}</p></div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['all', 'low', 'out'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-brand-red text-white' : 'bg-white border text-neutral-600 hover:bg-neutral-50'}`}>
            {t === 'all' ? 'All Products' : t === 'low' ? '⚠️ Low Stock' : '🔴 Out of Stock'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {filtered.length === 0 ? <EmptyState title="No products" description="No products match this filter." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b"><tr>
              <th className="text-left p-3">Product</th><th className="text-center p-3">Stock</th><th className="text-center p-3">Min</th><th className="text-center p-3">Availability</th><th className="text-center p-3">Action</th>
            </tr></thead>
            <tbody className="divide-y">{filtered.map(p => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="p-3"><div className="flex items-center gap-2">{getImageUrl(p.primaryImage) ? <img src={getImageUrl(p.primaryImage)} alt="" className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-neutral-100" />}<span className="font-medium truncate max-w-[200px]">{p.name}</span></div></td>
                <td className="p-3 text-center"><span className={`font-bold ${p.stockQuantity === 0 ? 'text-red-600' : p.stockQuantity <= p.minimumStock ? 'text-amber-600' : 'text-green-600'}`}>{p.stockQuantity}</span></td>
                <td className="p-3 text-center text-neutral-400">{p.minimumStock}</td>
                <td className="p-3 text-center"><AvailabilityBadge status={p.availabilityStatus} /></td>
                <td className="p-3 text-center"><button onClick={() => openAdjust(p)} className="text-xs px-3 py-1 bg-brand-red text-white rounded hover:bg-brand-red-dark">Update</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      <Modal isOpen={!!modalProduct} onClose={() => setModalProduct(null)} title="Update Stock">
        {modalProduct && (
          <div className="space-y-4">
            <p className="font-medium">{modalProduct.name}</p>
            <p className="text-sm text-neutral-500">Current stock: <strong>{modalProduct.stockQuantity}</strong></p>
            <div className="flex gap-2">
              {(['add', 'remove', 'set'] as const).map(t => (
                <button key={t} onClick={() => setAdjustType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${adjustType === t ? 'bg-brand-red text-white' : 'bg-neutral-100'}`}>
                  {t === 'add' ? '➕ Add' : t === 'remove' ? '➖ Remove' : '🔢 Set'}
                </button>
              ))}
            </div>
            <Input label="Quantity *" type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Enter quantity" />
            <Input label="Reason *" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. New stock arrived" />
            <Select label="New Availability" value={newAvailability} onChange={e => setNewAvailability(e.target.value as AvailabilityStatus)} options={[{value:'in_stock',label:'In Stock'},{value:'limited_stock',label:'Limited Stock'},{value:'out_of_stock',label:'Out of Stock'},{value:'available_on_order',label:'Available on Order'},{value:'currently_unavailable',label:'Currently Unavailable'}]} />
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setModalProduct(null)}>Cancel</Button><Button variant="primary" onClick={handleAdjust} disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save'}</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
