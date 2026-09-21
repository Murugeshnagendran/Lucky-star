'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button, Modal, Spinner, Badge, useToast, StarRating } from '@/components/ui';
import { format } from 'date-fns';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any | null>(null);
  const toast = useToast();

  const loadData = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*');
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Review ${status}`);
      loadData();
      if (viewing?.id === id) setViewing({...viewing, status});
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-charcoal">Customer Reviews</h1>
        <p className="text-sm text-neutral-500">Moderate product reviews</p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {reviews.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-charcoal">{r.userName || 'Anonymous'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StarRating rating={r.rating} /></td>
                  <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs truncate">{r.text}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>{r.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setViewing(r)} className="text-brand-red hover:text-red-dark">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Review Details">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{viewing.userName}</p>
                <p className="text-xs text-neutral-500">{viewing.createdAt ? format(viewing.createdAt.toDate(), 'PP') : ''}</p>
              </div>
              <StarRating rating={viewing.rating} />
            </div>
            <div className="bg-neutral-50 p-4 rounded text-sm">{viewing.text}</div>
            <div className="pt-4 flex gap-2 justify-end">
              {viewing.status !== 'rejected' && <Button variant="outline" onClick={() => handleStatus(viewing.id, 'rejected')}>Reject</Button>}
              {viewing.status !== 'approved' && <Button variant="primary" onClick={() => handleStatus(viewing.id, 'approved')}>Approve</Button>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
