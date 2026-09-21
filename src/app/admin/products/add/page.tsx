'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

import { Category, Brand, AvailabilityStatus, ProductStatus } from '@/lib/types';
import { Button, Input, Select, Textarea, Spinner } from '@/components/ui';

const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function AddProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Product info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [sku, setSku] = useState('');

  // Pricing
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstInfo, setGstInfo] = useState('');

  // Inventory
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minimumStock, setMinimumStock] = useState('5');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('in_stock');

  // Delivery
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [installationAvailable, setInstallationAvailable] = useState(false);
  const [storePickupAvailable, setStorePickupAvailable] = useState(true);

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Specs
  const [specs, setSpecs] = useState<{name: string; value: string}[]>([{ name: '', value: '' }]);

  // Warranty
  const [brandWarranty, setBrandWarranty] = useState('');
  const [productWarranty, setProductWarranty] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  
  const [featured, setFeatured] = useState(false);
  const [productStatus, setProductStatus] = useState<ProductStatus>('draft');

  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        setDataError('');
        
        const [catRes, brandRes] = await Promise.all([
          supabase.from('categories').select('*').eq('enabled', true).order('display_order', { ascending: true }),
          supabase.from('brands').select('*').eq('enabled', true).order('name', { ascending: true }),
        ]);
        
        if (catRes.error) throw catRes.error;
        if (brandRes.error) throw brandRes.error;
        
        setCategories(catRes.data as unknown as Category[]);
        setBrands(brandRes.data as unknown as Brand[]);
      } catch (err: any) {
        console.error('Error loading categories and brands:', err);
        setDataError(`Supabase Error: ${err.message || 'Unknown error'}`);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setSlug(generateSlug(name));
  }, [name]);

  useEffect(() => {
    const qty = Number(stockQuantity);
    const min = Number(minimumStock);
    if (qty > min) setAvailabilityStatus('in_stock');
    else if (qty > 0 && qty <= min) setAvailabilityStatus('limited_stock');
    else if (qty === 0) setAvailabilityStatus('out_of_stock');
  }, [stockQuantity, minimumStock]);

  const discount = mrp && sellingPrice && Number(mrp) > 0
    ? Math.round(((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100)
    : 0;

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryIndex === index) setPrimaryIndex(0);
    else if (primaryIndex > index) setPrimaryIndex(prev => prev - 1);
  };

  const addSpec = () => setSpecs(prev => [...prev, { name: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: 'name' | 'value', val: string) => {
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const autoSku = () => {
    const brand = brands.find(b => b.id === brandId);
    const cat = categories.find(c => c.id === categoryId);
    const prefix = (brand?.name?.substring(0, 3) || 'XXX').toUpperCase();
    const catPre = (cat?.name?.substring(0, 3) || 'XXX').toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setSku(`${prefix}-${catPre}-${rand}`);
  };

  const missingFields: string[] = [];
  if (!name.trim()) missingFields.push('Product Name');
  if (!brandId) missingFields.push('Brand');
  if (!categoryId) missingFields.push('Category');
  if (!modelNumber.trim()) missingFields.push('Model Number');
  if (!sku.trim()) missingFields.push('SKU');
  if (!description.trim()) missingFields.push('Description');
  if (!mrp || Number(mrp) <= 0) missingFields.push('Valid MRP');
  if (!sellingPrice || Number(sellingPrice) <= 0) missingFields.push('Valid Selling Price');
  if (stockQuantity === '' || Number(stockQuantity) < 0) missingFields.push('Valid Stock Quantity');

  const isValid = missingFields.length === 0;

  const handleSave = async () => {
    if (!isValid) return;

    setSaving(true);
    let uploadedImages: any[] = [];
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/products/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData,
        });

        const resText = await res.text();
        let data;
        try { data = JSON.parse(resText); } catch (e) { data = { error: resText }; }

        if (!res.ok) throw new Error(data.error || `Upload failed. HTTP ${res.status}`);
        
        uploadedImages.push({
          url: data.url,
          publicId: data.publicId,
        });
      }

      const productData = {
        name,
        slug,
        description,
        categoryId,
        subcategoryId: subcategoryId || '',
        brandId,
        modelNumber,
        sku,
        primaryImage: uploadedImages[primaryIndex]?.url || null,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        discount,
        gstInfo,
        stockQuantity: Number(stockQuantity),
        minimumStockLevel: Number(minimumStock),
        availabilityStatus,
        deliveryAvailable,
        installationAvailable,
        storePickupAvailable,
        featured,
        status: productStatus,
        brandWarranty,
        productWarranty,
        warrantyAdditionalInfo: warrantyInfo,
        seoTitle: seoTitle || name,
        seoKeywords: seoKeywords,
        seoDescription: seoDescription || description?.substring(0, 160),
      };

      const saveRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(productData),
      });

      const saveResText = await saveRes.text();
      let saveData;
      try { saveData = JSON.parse(saveResText); } catch (e) { saveData = { error: saveResText }; }

      if (!saveRes.ok) throw new Error(saveData.error || `Save failed. HTTP ${saveRes.status}`);

      const productId = saveData.id;

      // Save images in product_images
      if (uploadedImages.length > 0) {
        await supabase.from('product_images').insert(
          uploadedImages.map((img, idx) => ({
            product_id: productId,
            image_url: img.url,
            display_order: idx
          }))
        );
      }

      // Save specs in product_specifications
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

      alert('Product saved successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Failed to save product: ${err?.message || 'Unknown error'}`);

      if (uploadedImages.length > 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await Promise.all(
              uploadedImages.map(img => 
                fetch('/api/admin/products/images', {
                  method: 'DELETE',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({ publicId: img.publicId })
                })
              )
            );
          }
        } catch (cleanupErr) {
          console.error('Cleanup failed:', cleanupErr);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-charcoal" style={{ fontFamily: 'var(--font-heading)' }}>
          Add Product
        </h1>
        <Button variant="secondary" onClick={() => router.push('/admin/products')}>
          ← Back to Products
        </Button>
      </div>

      {/* Section 1: Product Information */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Product Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Samsung 1.5 Ton Split AC" />
            {slug && <p className="text-xs text-neutral-400 mt-1">Slug: {slug}</p>}
          </div>
          <div className="md:col-span-2">
            {dataError && <p className="text-sm text-red-500 mb-2">{dataError}</p>}
          </div>
          <Select 
            label="Brand *" 
            value={brandId} 
            onChange={e => setBrandId(e.target.value)}
            options={
              loadingData 
                ? [{ value: '', label: 'Loading brands...' }] 
                : brands.length === 0 
                  ? [{ value: '', label: 'No brands available' }]
                  : [{ value: '', label: 'Select Brand' }, ...brands.map(b => ({ value: b.id, label: b.name }))]
            } 
            disabled={loadingData || brands.length === 0}
          />
          <Select 
            label="Category *" 
            value={categoryId} 
            onChange={e => setCategoryId(e.target.value)}
            options={
              loadingData 
                ? [{ value: '', label: 'Loading categories...' }] 
                : categories.length === 0 
                  ? [{ value: '', label: 'No categories available' }]
                  : [{ value: '', label: 'Select Category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]
            } 
            disabled={loadingData || categories.length === 0}
          />
          <Input label="Subcategory" value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} placeholder="Optional" />
          <Input label="Model Number *" value={modelNumber} onChange={e => setModelNumber(e.target.value)} placeholder="e.g. AR18CY5ARWK" />
          <div>
            <Input label="SKU *" value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. SAM-AC-X1A2" />
            <button type="button" onClick={autoSku} className="text-xs text-brand-red hover:underline mt-1">Auto-generate SKU</button>
          </div>
          <div className="md:col-span-2">
            <Textarea label="Description *" value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." rows={4} />
          </div>
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="MRP (₹) *" type="number" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="0" />
          <Input label="Selling Price (₹) *" type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Discount</label>
            <div className="h-10 flex items-center px-3 bg-neutral-50 rounded-lg border border-neutral-200 text-lg font-bold text-green-600">
              {discount > 0 ? `${discount}% OFF` : '—'}
            </div>
          </div>
          <Input label="GST Info" value={gstInfo} onChange={e => setGstInfo(e.target.value)} placeholder="e.g. 18% GST included" />
        </div>
      </div>

      {/* Section 3: Inventory & Availability */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Inventory & Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Stock Quantity *" type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} />
          <Input label="Minimum Stock Level" type="number" value={minimumStock} onChange={e => setMinimumStock(e.target.value)} />
          <Select label="Availability Status *" value={availabilityStatus} onChange={e => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
            options={[
              { value: 'in_stock', label: 'In Stock' },
              { value: 'limited_stock', label: 'Limited Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
              { value: 'available_on_order', label: 'Available on Order' },
              { value: 'currently_unavailable', label: 'Currently Unavailable' },
            ]} />
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Auto-suggested based on stock: {Number(stockQuantity) > Number(minimumStock) ? 'In Stock' : Number(stockQuantity) > 0 ? 'Limited Stock' : 'Out of Stock'}. You can override.
        </p>
      </div>

      {/* Section 4: Delivery */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Delivery Options</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={deliveryAvailable} onChange={e => setDeliveryAvailable(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm">🚚 Delivery Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={installationAvailable} onChange={e => setInstallationAvailable(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm">🔧 Installation Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={storePickupAvailable} onChange={e => setStorePickupAvailable(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm">🏪 Store Pickup Available</span>
          </label>
        </div>
      </div>

      {/* Section 5: Images */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Product Images</h2>
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" id="product-images" />
          <label htmlFor="product-images" className="cursor-pointer">
            <p className="text-neutral-500">📷 Click to upload images</p>
            <p className="text-xs text-neutral-400 mt-1">Supports JPEG, PNG, WebP</p>
          </label>
        </div>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className={`relative group rounded-lg overflow-hidden border-2 ${i === primaryIndex ? 'border-brand-red' : 'border-neutral-200'}`}>
                <img src={src} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => setPrimaryIndex(i)} className="text-xs bg-white text-brand-red px-2 py-1 rounded">
                    ⭐ Primary
                  </button>
                  <button onClick={() => removeImage(i)} className="text-xs bg-white text-red-600 px-2 py-1 rounded">
                    ✕
                  </button>
                </div>
                {i === primaryIndex && (
                  <span className="absolute top-1 left-1 bg-brand-red text-white text-[10px] px-1.5 py-0.5 rounded">Primary</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 6: Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Specifications</h2>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Input label={i === 0 ? 'Name' : undefined} value={spec.name} onChange={e => updateSpec(i, 'name', e.target.value)} placeholder="e.g. Capacity" />
              <Input label={i === 0 ? 'Value' : undefined} value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="e.g. 1.5 Ton" />
              <button onClick={() => removeSpec(i)} className="shrink-0 text-red-500 hover:text-red-700 pb-2 text-lg">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addSpec} className="text-sm text-brand-red hover:underline mt-2">+ Add Specification</button>
      </div>

      {/* Section 7: Warranty */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">Warranty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Brand Warranty" value={brandWarranty} onChange={e => setBrandWarranty(e.target.value)} placeholder="e.g. 2 Years" />
          <Input label="Product Warranty" value={productWarranty} onChange={e => setProductWarranty(e.target.value)} placeholder="e.g. 1 Year" />
          <div className="md:col-span-2">
            <Textarea label="Additional Info" value={warrantyInfo} onChange={e => setWarrantyInfo(e.target.value)} placeholder="Warranty details..." rows={2} />
          </div>
        </div>
      </div>

      {/* Section 8: SEO & Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-brand-charcoal mb-4">SEO & Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="SEO Title" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Product title for search engines" />
          <Input label="Keywords" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
          <div className="md:col-span-2">
            <Textarea label="SEO Description" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Brief description for search engines" rows={2} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm font-medium">⭐ Featured Product</span>
          </label>
          <Select label="Status" value={productStatus} onChange={e => setProductStatus(e.target.value as ProductStatus)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active — Publish Now' },
            ]} />
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-neutral-200 py-4 px-6 -mx-4 md:-mx-6 rounded-t-xl flex justify-between items-center gap-3">
        <div className="text-sm text-red-600 font-medium">
          {!isValid && (
            <p>Missing: {missingFields.join(', ')}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push('/admin/products')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !isValid} className="min-w-[160px]">
            {saving ? <Spinner size="sm" /> : '💾 Save Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
