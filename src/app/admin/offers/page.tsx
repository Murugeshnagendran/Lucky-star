'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Select, Textarea, Modal, Spinner, Badge, ConfirmDialog, useToast } from '@/components/ui';

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [appliesTo, setAppliesTo] = useState('store');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);

  const loadData = async () => {
    try {
      const { data, error } = await supabase.from('offers').select('*');
      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setName(''); setDescription(''); setType('percentage'); setValue(''); setAppliesTo('store'); 
    setStartDate(''); setEndDate(''); setActive(true);
    setModalOpen(true);
  };

  const openEdit = (off: any) => {
    setEditing(off);
    setName(off.name); setDescription(off.description || ''); setType(off.type); setValue(off.value?.toString() || '');
    setAppliesTo(off.appliesTo); setStartDate(off.startDate || ''); setEndDate(off.endDate || ''); setActive(off.active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !value) return;
    setSaving(true);
    try {
      const data = { name, description, type, value: Number(value), appliesTo, startDate, endDate, active };
      if (editing?.id) {
        const { error } = await supabase.from('offers').update(data).eq('id', editing.id);
        if (error) throw error;
        toast.success('Offer updated');
      } else {
        const { error } = await supabase.from('offers').insert([data]);
        if (error) throw error;
        toast.success('Offer added');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Offer deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete offer');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Offers & Promotions</h1>
          <p className="text-sm text-neutral-500">Manage store-wide or product-specific discounts</p>
        </div>
        <Button onClick={openAdd} variant="primary">Add Offer</Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Offer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {offers.map(off => (
                <tr key={off.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-charcoal">{off.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {off.type === 'percentage' ? `${off.value}%` : `₹${off.value}`} ({off.appliesTo})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {off.startDate} to {off.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={off.active ? 'success' : 'default'}>{off.active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEdit(off)} className="text-brand-red hover:text-red-dark mr-4">Edit</button>
                    <button onClick={() => setDeleteId(off.id)} className="text-neutral-500 hover:text-brand-charcoal">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Offer" : "Add Offer"}>
        <div className="space-y-4">
          <Input label="Offer Name *" value={name} onChange={e => setName(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Discount Type" value={type} onChange={e => setType(e.target.value)} options={[{label:'Percentage',value:'percentage'},{label:'Flat Amount',value:'flat'}]} />
            <Input label="Value *" type="number" value={value} onChange={e => setValue(e.target.value)} required />
          </div>
          <Select label="Applies To" value={appliesTo} onChange={e => setAppliesTo(e.target.value)} options={[{label:'Entire Store',value:'store'},{label:'Specific Product',value:'product'},{label:'Category',value:'category'}]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Active
          </label>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !name || !value}>
              {saving ? <Spinner size="sm" className="mr-2" /> : null} Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Offer" message="Are you sure you want to delete this offer?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmLabel="Delete" variant="danger" />
    </div>
  );
}
