'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FurnitureRequest, FurnitureRequestStatus, FURNITURE_STATUS_LABELS } from '@/lib/types';
import { Button, Select, Textarea, Modal, Spinner, Badge, useToast, Input } from '@/components/ui';
import { mapFurnitureRequestToCamelCase } from '@/lib/utils/mapper';

export default function AdminFurnitureRequests() {
  const [requests, setRequests] = useState<FurnitureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<FurnitureRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [quotation, setQuotation] = useState('');
  const toast = useToast();

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('furniture_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests((data || []).map(mapFurnitureRequestToCamelCase) as unknown as FurnitureRequest[]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load furniture requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openView = (req: FurnitureRequest) => {
    setViewing(req);
    setAdminNotes(req.adminNotes || '');
    setQuotation(req.quotation || '');
  };

  const handleUpdate = async () => {
    if (!viewing) return;
    setUpdating(true);
    try {
      const updates = { 
        status: viewing.status,
        adminNotes,
        quotation,
      };
      const payload: any = { status: updates.status, quotation: updates.quotation };
      if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;

      const { error } = await supabase
        .from('furniture_requests')
        .update(payload)
        .eq('id', viewing.id);
      if (error) throw error;
      toast.success('Request updated');
      setRequests(prev => prev.map(r => r.id === viewing.id ? { ...r, ...updates } : r));
      setViewing(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request');
    } finally {
      setUpdating(false);
    }
  };

  const getBadgeVariant = (status: FurnitureRequestStatus) => {
    switch (status) {
      case 'new': return 'warning';
      case 'contacted': return 'info';
      case 'quoted': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
          Custom Furniture Requests
        </h1>
        <p className="text-sm text-neutral-500">Manage bespoke furniture inquiries and customization requests</p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Furniture Type</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Budget</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-charcoal">{r.customerName}</div>
                    <div className="text-xs text-neutral-500">{r.mobile}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-charcoal">{r.furnitureType}</div>
                    {r.material && <div className="text-xs text-neutral-400">Material: {r.material}</div>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 font-medium">
                    {r.budget || 'Open Budget'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Badge variant={getBadgeVariant(r.status)}>
                      {FURNITURE_STATUS_LABELS[r.status] || r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => openView(r)}>View & Action</Button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-400">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Furniture Request Details">
        {viewing && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Customer</p>
                <p className="font-semibold text-brand-charcoal">{viewing.customerName}</p>
                <p className="text-sm text-neutral-600">{viewing.mobile}</p>
                {viewing.email && <p className="text-xs text-neutral-500">{viewing.email}</p>}
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Furniture Details</p>
                <p className="font-semibold text-brand-charcoal">{viewing.furnitureType}</p>
                <p className="text-sm text-neutral-600">Budget: {viewing.budget || 'Not specified'}</p>
                {viewing.dimensions && <p className="text-xs text-neutral-500">Dimensions: {viewing.dimensions}</p>}
                {viewing.material && <p className="text-xs text-neutral-500">Material: {viewing.material}</p>}
                {viewing.color && <p className="text-xs text-neutral-500">Color: {viewing.color}</p>}
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="flex gap-2">
              <a href={`tel:${viewing.mobile}`} className="flex-1">
                <Button variant="secondary" className="w-full">📞 Call Customer</Button>
              </a>
              <a 
                href={`https://wa.me/91${viewing.mobile.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${viewing.customerName}, this is Lucky Star Home Appliances & Furnitures following up on your custom ${viewing.furnitureType} request.`)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1"
              >
                <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700">💬 WhatsApp</Button>
              </a>
            </div>
            
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-400 font-semibold mb-1">Customer Requirements</p>
              <p className="text-sm text-neutral-700">{viewing.requirements || 'No additional requirements specified.'}</p>
            </div>

            {viewing.referenceImages && viewing.referenceImages.length > 0 && (
              <div>
                <p className="text-xs text-neutral-400 font-semibold mb-2">Reference Images</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {viewing.referenceImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="relative h-24 w-24 flex-shrink-0 border rounded-lg overflow-hidden group">
                      <img src={img} alt={`Reference ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Input
                label="Quotation Amount / Details"
                value={quotation}
                onChange={e => setQuotation(e.target.value)}
                placeholder="e.g. ₹25,000 (Incl. Teak Wood + Polish)"
              />
              <Textarea 
                label="Admin Internal Notes" 
                value={adminNotes} 
                onChange={e => setAdminNotes(e.target.value)} 
                rows={2} 
                placeholder="Notes about carpenter, wood stock, delivery..."
              />
            </div>

            <div className="pt-3 border-t space-y-3">
              <Select 
                label="Status"
                value={viewing.status}
                onChange={e => setViewing({...viewing, status: e.target.value as FurnitureRequestStatus})}
                options={[
                  { label: 'New', value: 'new' },
                  { label: 'Contacted', value: 'contacted' },
                  { label: 'Quoted', value: 'quoted' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setViewing(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdate} disabled={updating}>
                  {updating ? <Spinner size="sm" /> : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
