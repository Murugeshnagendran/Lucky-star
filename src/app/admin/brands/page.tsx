'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Brand } from '@/lib/types';
import { Button, Input, Textarea, Modal, Spinner, EmptyState, ConfirmDialog } from '@/components/ui';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching brands:', error);
    } else {
      setBrands(data.map(d => ({
        ...d,
        logo: d.image_url,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      })) as unknown as Brand[]);
    }
    setLoading(false);
  };
  
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setName(''); setDescription(''); setEnabled(true); setLogoFile(null); setModalOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setName(b.name); setDescription(b.description || ''); setEnabled(b.enabled); setModalOpen(true); };

  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSave = async () => {
    if (!name.trim()) return; 
    setSaving(true);
    
    try {
      let logo = editing?.logo || '';
      
      if (logoFile) {
        const uniqueName = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('brand-images')
          .upload(uniqueName, logoFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('brand-images')
          .getPublicUrl(uniqueName);
          
        logo = publicUrl;
      }
      
      const slug = generateSlug(name);
      const data = { 
        name, 
        slug, 
        description, 
        image_url: logo, 
        enabled, 
        updated_at: new Date().toISOString() 
      };
      
      if (editing) {
        const { error } = await supabase
          .from('brands')
          .update(data)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brands')
          .insert([{ ...data, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      
      setModalOpen(false); 
      await load();
    } catch (e) { 
      console.error(e); 
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => { 
    if (deleteId) { 
      await supabase.from('brands').update({ enabled: false }).eq('id', deleteId); 
      setDeleteId(null); 
      await load(); 
    } 
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-charcoal">Brands</h1>
        <Button variant="primary" onClick={openAdd}>➕ Add Brand</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {brands.length === 0 ? <EmptyState title="No brands yet" description="Add your first brand." /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b"><tr><th className="text-left p-3">Logo</th><th className="text-left p-3">Name</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th></tr></thead>
            <tbody className="divide-y">{brands.map(b => (
              <tr key={b.id} className="hover:bg-neutral-50">
                <td className="p-3">{b.logo ? <img src={b.logo} alt="" className="w-10 h-10 rounded object-contain" /> : <div className="w-10 h-10 rounded bg-neutral-100" />}</td>
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${b.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.enabled ? 'Active' : 'Disabled'}</span></td>
                <td className="p-3 text-center"><button onClick={() => openEdit(b)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded mr-1">Edit</button><button onClick={() => setDeleteId(b.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">Delete</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <div className="space-y-4">
          <Input label="Name *" value={name} onChange={e => setName(e.target.value)} />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          <div><label className="block text-sm font-medium mb-1">Logo</label><input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="text-sm" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="accent-brand-red" /><span className="text-sm">Enabled</span></label>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save'}</Button></div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} title="Disable Brand" message="This will hide the brand." confirmLabel="Disable" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
