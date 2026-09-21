'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { ProductEnquiry, EnquiryStatus, ENQUIRY_STATUS_LABELS } from '@/lib/types';
import { Button, Select, Modal, Spinner, Badge, useToast, Textarea } from '@/components/ui';
import { mapEnquiryToCamelCase } from '@/lib/utils/mapper';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<ProductEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('all');
  const [viewing, setViewing] = useState<ProductEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEnquiries((data || []).map(mapEnquiryToCamelCase) as unknown as ProductEnquiry[]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openView = (e: ProductEnquiry) => {
    setViewing(e);
    setAdminNotes(e.adminNotes || '');
  };

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!viewing) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('enquiries').update({ 
        status: newStatus,
        admin_notes: adminNotes,
      }).eq('id', viewing.id);
      if (error) throw error;
      toast.success('Enquiry updated');
      setViewing({ ...viewing, status: newStatus, adminNotes });
      setEnquiries(prev => prev.map(item => item.id === viewing.id ? { ...item, status: newStatus, adminNotes } : item));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!viewing) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('enquiries').update({ admin_notes: adminNotes }).eq('id', viewing.id);
      if (error) throw error;
      toast.success('Notes saved');
      setViewing({ ...viewing, adminNotes });
      setEnquiries(prev => prev.map(item => item.id === viewing.id ? { ...item, adminNotes } : item));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = enquiries.filter(e => tab === 'all' || e.status === tab);

  const getBadgeVariant = (status: EnquiryStatus) => {
    switch (status) {
      case 'new': return 'warning';
      case 'contacted': return 'info';
      case 'quoted': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
          Product Enquiries
        </h1>
        <p className="text-sm text-neutral-500">Track and respond to customer product enquiries</p>
      </div>

      <div className="flex border-b border-neutral-200 overflow-x-auto gap-2">
        {(['all', 'new', 'contacted', 'quoted', 'closed'] as const).map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap capitalize transition-colors ${
              tab === t ? 'border-brand-red text-brand-red' : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t === 'all' ? `All (${enquiries.length})` : `${ENQUIRY_STATUS_LABELS[t as EnquiryStatus] || t} (${enquiries.filter(e => e.status === t).length})`}
          </button>
        ))}
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
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Product</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-500">Preferred</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500 text-xs">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-charcoal">{e.customerName}</div>
                    <div className="text-xs text-neutral-500">{e.mobile}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-brand-charcoal font-medium">{e.productName}</div>
                    <div className="text-xs text-neutral-400">Qty: {e.quantity} {e.productModel ? `• Model: ${e.productModel}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center capitalize text-xs text-neutral-600">
                    {e.preferredContact || 'WhatsApp'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Badge variant={getBadgeVariant(e.status)}>
                      {ENQUIRY_STATUS_LABELS[e.status] || e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => openView(e)}>View & Action</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-400">No enquiries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Enquiry Details">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Customer</p>
                <p className="font-semibold text-brand-charcoal">{viewing.customerName}</p>
                <p className="text-sm text-neutral-600">{viewing.mobile}</p>
                {viewing.email && <p className="text-xs text-neutral-500">{viewing.email}</p>}
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase font-semibold">Product</p>
                <p className="font-semibold text-brand-charcoal">{viewing.productName}</p>
                {viewing.productModel && <p className="text-xs text-neutral-500">Model: {viewing.productModel}</p>}
                <p className="text-sm font-medium text-brand-red">Quantity: {viewing.quantity}</p>
              </div>
            </div>
            
            {viewing.message && (
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <p className="text-xs text-neutral-400 font-semibold mb-1">Customer Message</p>
                <p className="text-sm text-neutral-700 italic">"{viewing.message}"</p>
              </div>
            )}

            {/* Direct Contact Actions */}
            <div className="flex gap-2">
              <a href={`tel:${viewing.mobile}`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  📞 Call Customer
                </Button>
              </a>
              <a 
                href={`https://wa.me/91${viewing.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${viewing.customerName}, this is Lucky Star Home Appliances & Furnitures following up on your enquiry for ${viewing.productName}.`)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1"
              >
                <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  💬 WhatsApp
                </Button>
              </a>
            </div>

            {/* Admin Notes */}
            <div>
              <Textarea
                label="Admin Internal Notes"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add quotation info, follow-up remarks..."
                rows={3}
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updating}
                  className="text-xs text-brand-red hover:underline font-medium"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Status Update */}
            <div className="pt-3 border-t border-neutral-200">
              <Select 
                label="Update Status"
                value={viewing.status}
                onChange={e => handleStatusChange(e.target.value as EnquiryStatus)}
                options={[
                  { label: 'New', value: 'new' },
                  { label: 'Contacted', value: 'contacted' },
                  { label: 'Quoted', value: 'quoted' },
                  { label: 'Closed', value: 'closed' },
                ]}
                disabled={updating}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
