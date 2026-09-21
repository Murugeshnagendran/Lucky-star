'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Textarea, Modal, Spinner, Badge, ConfirmDialog, useToast } from '@/components/ui';

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [name, setName] = useState('');
  const [areas, setAreas] = useState('');
  const [charge, setCharge] = useState('');
  const [days, setDays] = useState('');
  const [active, setActive] = useState(true);

  const loadData = async () => {
    try {
      const { data, error } = await supabase.from('delivery_zones').select('*');
      if (error) throw error;
      setZones(data || []);
    } catch (err) {
      toast.error('Failed to load delivery zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setName(''); setAreas(''); setCharge(''); setDays(''); setActive(true);
    setModalOpen(true);
  };

  const openEdit = (zone: any) => {
    setEditing(zone);
    setName(zone.name); setAreas((zone.areas || []).join(', ')); setCharge(zone.charge?.toString() || '0');
    setDays(zone.estimatedDays || ''); setActive(zone.active !== false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const data = { 
        name, 
        areas: areas.split(',').map(a => a.trim()).filter(a => a), 
        charge: Number(charge), 
        estimatedDays: days, 
        active 
      };
      if (editing?.id) {
        const { error } = await supabase.from('delivery_zones').update(data).eq('id', editing.id);
        if (error) throw error;
        toast.success('Zone updated');
      } else {
        const { error } = await supabase.from('delivery_zones').insert(data);
        if (error) throw error;
        toast.success('Zone added');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('delivery_zones').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Zone deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete zone');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Delivery Zones</h1>
          <p className="text-sm text-neutral-500">Manage delivery areas and charges</p>
        </div>
        <Button onClick={openAdd} variant="primary">Add Zone</Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Zone Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Charge (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Est. Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {zones.map(z => (
                <tr key={z.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-charcoal">{z.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{z.charge === 0 ? 'Free' : z.charge}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{z.estimatedDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={z.active !== false ? 'success' : 'default'}>{z.active !== false ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEdit(z)} className="text-brand-red hover:text-red-dark mr-4">Edit</button>
                    <button onClick={() => setDeleteId(z.id)} className="text-neutral-500 hover:text-brand-charcoal">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Zone" : "Add Zone"}>
        <div className="space-y-4">
          <Input label="Zone Name *" value={name} onChange={e => setName(e.target.value)} required />
          <Textarea label="Areas (comma separated)" value={areas} onChange={e => setAreas(e.target.value)} placeholder="e.g. Madurai North, Anna Nagar" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Delivery Charge (₹) *" type="number" value={charge} onChange={e => setCharge(e.target.value)} required />
            <Input label="Estimated Days" value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 1-2 Days" />
          </div>
          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Active
          </label>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving || !name}>
              {saving ? <Spinner size="sm" className="mr-2" /> : null} Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Zone" message="Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmLabel="Delete" variant="danger" />
    </div>
  );
}
