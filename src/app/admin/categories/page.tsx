'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Category } from '@/lib/types';
import { Button, Input, Textarea, Modal, Spinner, EmptyState, ConfirmDialog } from '@/components/ui';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  const [enabled, setEnabled] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data.map(d => ({
        ...d,
        order: d.display_order,
        imageUrl: d.image_url,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      })) as unknown as Category[]);
    }
    setLoading(false);
  };
  
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setName(''); setDescription(''); setOrder('0'); setEnabled(true); setImageFile(null); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setDescription(c.description || ''); setOrder(String(c.order)); setEnabled(c.enabled); setImageFile(null); setModalOpen(true); };

  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    if (isNaN(Number(order))) {
      alert('Display Order must be a valid number');
      return;
    }

    if (imageFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        alert('Image must be JPG, PNG, or WEBP');
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5 MB');
        return;
      }
    }

    setSaving(true);
    try {
      let imageUrl = editing?.image || '';
      let newImageUploaded = false;

      if (imageFile) {
        const uniqueName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(uniqueName, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('category-images')
          .getPublicUrl(uniqueName);
          
        imageUrl = publicUrl;
        newImageUploaded = true;
      }

      const slug = generateSlug(name);
      const data = { 
        name, 
        slug, 
        description, 
        image_url: imageUrl, 
        display_order: Number(order), 
        enabled, 
        updated_at: new Date().toISOString()
      };

      if (editing) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editing.id);
          
        if (error) throw error;
        
        // Delete old image only if a new one was successfully uploaded
        if (newImageUploaded && editing.image && editing.image !== imageUrl) {
          try {
            // naive check to grab filename from URL if it's from supabase
            const parts = editing.image.split('/');
            const oldFilename = parts[parts.length - 1];
            if (oldFilename) {
              await supabase.storage.from('category-images').remove([oldFilename]);
            }
          } catch (deleteErr) {
            console.error('Failed to delete old image:', deleteErr);
          }
        }
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...data, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      setModalOpen(false);
      await load();
    } catch (e: any) {
      console.error('Error saving category:', e);
      alert(e.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('categories').update({ enabled: false }).eq('id', deleteId);
    setDeleteId(null); await load();
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-charcoal">Categories</h1>
        <Button variant="primary" onClick={openAdd}>➕ Add Category</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {categories.length === 0 ? <EmptyState title="No categories yet" description="Add your first category." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b"><tr>
                <th className="text-left p-3">Image</th><th className="text-left p-3">Name</th>
                <th className="text-center p-3">Order</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="p-3">{c.imageUrl || c.image ? <img src={c.imageUrl || c.image} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-neutral-100" />}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-center">{c.order}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${c.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.enabled ? 'Active' : 'Disabled'}</span></td>
                    <td className="p-3 text-center">
                      <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded mr-1">Edit</button>
                      <button onClick={() => setDeleteId(c.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Name *" value={name} onChange={e => setName(e.target.value)} />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          <Input label="Display Order" type="number" value={order} onChange={e => setOrder(e.target.value)} />
          <div><label className="block text-sm font-medium mb-1">Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm" /></div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="accent-brand-red" />
            <span className="text-sm">Enabled</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Saving...
                </span>
              ) : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Disable Category" message="This will hide the category." confirmLabel="Disable" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
