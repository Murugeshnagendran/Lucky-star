'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Category, Brand, AvailabilityStatus, ProductStatus } from '@/lib/types';
import { Button, Input, Select, Textarea, Spinner } from '@/components/ui';

const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: productId } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstInfo, setGstInfo] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('in_stock');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [installationAvailable, setInstallationAvailable] = useState(false);
  const [storePickupAvailable, setStorePickupAvailable] = useState(true);
  
  const [existingImages, setExistingImages] = useState<{id: string, url: string}[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState('');
  
  const [specs, setSpecs] = useState<{name: string; value: string}[]>([]);
  const [brandWarranty, setBrandWarranty] = useState('');
  const [productWarranty, setProductWarranty] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [featured, setFeatured] = useState(false);
  const [productStatus, setProductStatus] = useState<ProductStatus>('active');

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, brsRes, prodRes, imgsRes, specsRes] = await Promise.all([
          supabase.from('categories').select('*').order('display_order', { ascending: true }),
          supabase.from('brands').select('*').order('name', { ascending: true }),
          supabase.from('products').select('*').eq('id', productId).single(),
          supabase.from('product_images').select('*').eq('product_id', productId).order('display_order', { ascending: true }),
          supabase.from('product_specifications').select('*').eq('product_id', productId),
        ]);

        if (prodRes.error) throw prodRes.error;

        setCategories(catsRes.data as unknown as Category[] || []);
        setBrands(brsRes.data as unknown as Brand[] || []);

        const product = prodRes.data;
        setName(product.name); 
        setSlug(product.slug); 
        setDescription(product.description || '');
        setCategoryId(product.category_id || ''); 
        setBrandId(product.brand_id || ''); 
        setModelNumber(product.model_number || ''); 
        setSku(product.sku || '');
        setMrp(String(product.mrp || '')); 
        setSellingPrice(String(product.selling_price || ''));
        setGstInfo(product.gst_info || '');
        setStockQuantity(String(product.stock_quantity ?? '')); 
        setMinimumStock(String(product.minimum_stock_level ?? ''));
        setAvailabilityStatus(product.availability_status);
        setDeliveryAvailable(product.delivery_available ?? true);
        setInstallationAvailable(product.installation_available ?? false);
        setStorePickupAvailable(product.store_pickup_available ?? true);
        
        const imgs = imgsRes.data || [];
        setExistingImages(imgs.map((i: any) => ({ id: i.id, url: i.image_url })));
        setPrimaryImage(product.primary_image || '');

        const sps = specsRes.data || [];
        setSpecs(sps.map((s: any) => ({ name: s.name, value: s.value })));

        setBrandWarranty(product.brand_warranty || '');
        setProductWarranty(product.product_warranty || '');
        setWarrantyInfo(product.warranty_additional_info || '');
        setSeoTitle(product.seo_title || ''); 
        setSeoDescription(product.seo_description || '');
        setSeoKeywords(product.seo_keywords || '');
        setFeatured(product.featured); 
        setProductStatus(product.status);
      } catch (e) {
        console.error('Error loading product:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const discount = mrp && sellingPrice && Number(mrp) > 0 ? Math.round(((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100) : 0;
  const allImages = [...existingImages.map(img => img.url), ...newPreviews];

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setNewPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (index: number) => {
    const img = existingImages[index];
    try {
      const parts = img.url.split('/');
      const filename = parts[parts.length - 1];
      await supabase.storage.from('product-images').remove([filename]);
      await supabase.from('product_images').delete().eq('id', img.id);
    } catch (e) { 
      console.error(e); 
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    if (primaryImage === img.url) {
      setPrimaryImage(existingImages[0]?.url || '');
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => setSpecs(prev => [...prev, { name: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: 'name' | 'value', val: string) => {
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSave = async () => {
    if (!name || !mrp || !sellingPrice) { alert('Fill required fields.'); return; }
    setSaving(true);
    try {
      let uploadedImageUrls: string[] = [];
      
      // Upload new images
      for (const file of newImageFiles) {
        const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(uniqueName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(uniqueName);
        uploadedImageUrls.push(publicUrl);
      }

      const allImageUrls = [...existingImages.map(img => img.url), ...uploadedImageUrls];

      // Update product record
      const updateData = {
        name, 
        slug: generateSlug(name), 
        description, 
        category_id: categoryId, 
        brand_id: brandId, 
        model_number: modelNumber, 
        sku,
        primary_image: primaryImage || allImageUrls[0] || null,
        mrp: Number(mrp), 
        selling_price: Number(sellingPrice), 
        discount, 
        gst_info: gstInfo,
        brand_warranty: brandWarranty, 
        product_warranty: productWarranty, 
        warranty_additional_info: warrantyInfo,
        stock_quantity: Number(stockQuantity), 
        minimum_stock_level: Number(minimumStock), 
        availability_status: availabilityStatus,
        delivery_available: deliveryAvailable, 
        installation_available: installationAvailable, 
        store_pickup_available: storePickupAvailable, 
        featured, 
        status: productStatus,
        seo_title: seoTitle, 
        seo_description: seoDescription, 
        seo_keywords: seoKeywords,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);
        
      if (updateError) throw updateError;

      // Add new images to product_images
      if (uploadedImageUrls.length > 0) {
        const nextOrder = existingImages.length;
        const newImgsData = uploadedImageUrls.map((url, idx) => ({
          product_id: productId,
          image_url: url,
          display_order: nextOrder + idx
        }));
        await supabase.from('product_images').insert(newImgsData);
      }

      // Sync specs
      await supabase.from('product_specifications').delete().eq('product_id', productId);
      const validSpecs = specs.filter(s => s.name && s.value);
      if (validSpecs.length > 0) {
        await supabase.from('product_specifications').insert(
          validSpecs.map(s => ({
            product_id: productId,
            name: s.name,
            value: s.value
          }))
        );
      }

      alert('Product updated!');
      router.push('/admin/products');
    } catch (err: any) { 
      console.error(err); 
      alert('Error saving: ' + err.message); 
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-charcoal">Edit Product</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/products')}>← Back</Button>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Product Name *" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <Select label="Brand" value={brandId} onChange={e => setBrandId(e.target.value)} options={[{value:'',label:'Select'}, ...brands.map(b=>({value:b.id,label:b.name}))]} />
          <Select label="Category" value={categoryId} onChange={e => setCategoryId(e.target.value)} options={[{value:'',label:'Select'}, ...categories.map(c=>({value:c.id,label:c.name}))]} />
          <Input label="Model Number" value={modelNumber} onChange={e => setModelNumber(e.target.value)} />
          <Input label="SKU" value={sku} onChange={e => setSku(e.target.value)} />
          <div className="md:col-span-2"><Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} /></div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="MRP (₹)" type="number" value={mrp} onChange={e => setMrp(e.target.value)} />
          <Input label="Selling Price (₹)" type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
          <div><label className="block text-sm font-medium mb-1">Discount</label><div className="h-10 flex items-center px-3 bg-neutral-50 rounded-lg border text-lg font-bold text-green-600">{discount > 0 ? `${discount}% OFF` : '—'}</div></div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Inventory & Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Stock Quantity" type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
          <Input label="Minimum Stock" type="number" value={minimumStock} onChange={e => setMinimumStock(e.target.value)} />
          <Select label="Availability" value={availabilityStatus} onChange={e => setAvailabilityStatus(e.target.value as AvailabilityStatus)} options={[{value:'in_stock',label:'In Stock'},{value:'limited_stock',label:'Limited Stock'},{value:'out_of_stock',label:'Out of Stock'},{value:'available_on_order',label:'Available on Order'},{value:'currently_unavailable',label:'Currently Unavailable'}]} />
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" checked={deliveryAvailable} onChange={e => setDeliveryAvailable(e.target.checked)} className="accent-brand-red" /><span className="text-sm">🚚 Delivery</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={installationAvailable} onChange={e => setInstallationAvailable(e.target.checked)} className="accent-brand-red" /><span className="text-sm">🔧 Installation</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={storePickupAvailable} onChange={e => setStorePickupAvailable(e.target.checked)} className="accent-brand-red" /><span className="text-sm">🏪 Pickup</span></label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        {allImages.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {existingImages.map((img, i) => (
              <div key={`e-${i}`} className={`relative group rounded-lg overflow-hidden border-2 ${img.url === primaryImage ? 'border-brand-red' : 'border-neutral-200'}`}>
                <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button onClick={() => setPrimaryImage(img.url)} className="text-[10px] bg-white text-brand-red px-1.5 py-0.5 rounded">⭐</button>
                  <button onClick={() => removeExistingImage(i)} className="text-[10px] bg-white text-red-600 px-1.5 py-0.5 rounded">✕</button>
                </div>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={`n-${i}`} className="relative group rounded-lg overflow-hidden border-2 border-neutral-200">
                <img src={src} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => removeNewImage(i)} className="text-[10px] bg-white text-red-600 px-1.5 py-0.5 rounded">✕</button>
                </div>
                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">New</span>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" id="edit-images" />
        <label htmlFor="edit-images" className="cursor-pointer inline-block px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-brand-red">+ Add Images</label>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Specifications</h2>
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2 items-end mb-2">
            <Input value={s.name} onChange={e => updateSpec(i, 'name', e.target.value)} placeholder="Name" />
            <Input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Value" />
            <button onClick={() => removeSpec(i)} className="text-red-500 pb-2">✕</button>
          </div>
        ))}
        <button onClick={addSpec} className="text-sm text-brand-red hover:underline">+ Add Spec</button>
      </div>

      {/* Warranty */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Warranty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Brand Warranty" value={brandWarranty} onChange={e => setBrandWarranty(e.target.value)} />
          <Input label="Product Warranty" value={productWarranty} onChange={e => setProductWarranty(e.target.value)} />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-brand-red" /><span className="text-sm">⭐ Featured</span></label>
          <Select label="Status" value={productStatus} onChange={e => setProductStatus(e.target.value as ProductStatus)} options={[{value:'draft',label:'Draft'},{value:'active',label:'Active'},{value:'hidden',label:'Hidden'}]} />
        </div>
      </div>

      {/* Save */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t py-4 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push('/admin/products')}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner size="sm" /> : '💾 Update Product'}</Button>
      </div>
    </div>
  );
}
