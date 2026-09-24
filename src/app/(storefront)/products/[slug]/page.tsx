'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Truck, Wrench, Store, Heart, Info, CheckCircle, XCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';
import { Spinner } from '@/components/ui';
import { AVAILABILITY_LABELS, Product, Brand, Category } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEnquireModal, setShowEnquireModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const [enquireForm, setEnquireForm] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productRes, brs, cats] = await Promise.all([
          fetch(`/api/products/${slug}`, { cache: 'no-store' }),
          supabase.from('brands').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug, order: 0, enabled: true, createdAt: '', updatedAt: ''})) || []),
          supabase.from('categories').select('*').eq('enabled', true).then(res => res.data?.map(d => ({id: d.id, name: d.name, slug: d.slug, order: 0, enabled: true, createdAt: '', updatedAt: ''})) || [])
        ]);

        if (!productRes.ok) {
          if (productRes.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to load product details');
        }

        const data: Product = await productRes.json();
        setProduct(data);
        setBrands(brs);
        setCategories(cats);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">📭</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-6">{error || 'This product does not exist or has been removed.'}</p>
        <Link href="/products" className="px-6 py-3 bg-[#C41E24] text-white font-medium rounded-full hover:bg-[#9B1B20] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const brandName = brands.find(b => b.id === product.brandId)?.name || 'Brand';
  const categoryName = categories.find(c => c.id === product.categoryId)?.name || 'Category';
  const primaryImageUrl = getImageUrl(product.primaryImage);
  const secondaryImages = product.images?.map(img => getImageUrl(img)).filter(Boolean) || [];

  const encodedMessage = encodeURIComponent(`Hi Lucky Star, I want to know more about: ${product.name} (Model: ${product.modelNumber || 'N/A'}). Is it available?`);

  const inStock = product.availabilityStatus === 'in_stock' || product.availabilityStatus === 'limited_stock';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 text-xs text-gray-500">
        <Link href="/" className="hover:text-[#C41E24]">Home</Link> <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-[#C41E24]">Categories</Link> <span className="mx-2">/</span>
        {product.categoryId && (
           <>
             <Link href={`/categories/${categories.find(c => c.id === product.categoryId)?.slug}`} className="hover:text-[#C41E24]">
               {categoryName}
             </Link>
             <span className="mx-2">/</span>
           </>
        )}
        <span className="text-gray-800 font-medium line-clamp-1 inline">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-16">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Images */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative group">
              {primaryImageUrl ? (
                <img src={primaryImageUrl} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-300 text-6xl">📷</div>
              )}
            </div>
            {secondaryImages.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[primaryImageUrl, ...secondaryImages].map((img, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 border-2 rounded-lg cursor-pointer bg-gray-50 border-gray-200 overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt={`${product.name} preview ${i+1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full w-max mb-4 flex items-center ${
              inStock ? 'bg-green-100 text-green-700' : 
              product.availabilityStatus === 'out_of_stock' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {inStock ? <CheckCircle size={14} className="mr-1.5" /> : <Info size={14} className="mr-1.5" />}
              {AVAILABILITY_LABELS[product.availabilityStatus as keyof typeof AVAILABILITY_LABELS] || product.availabilityStatus}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-poppins font-bold text-[#2D2D2D] leading-tight mb-2">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-y-2">
              <span className="font-semibold text-gray-700 mr-4 border-r pr-4 uppercase tracking-wide">{brandName}</span>
              {product.modelNumber && <span className="mr-4 border-r pr-4">Model: {product.modelNumber}</span>}
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#2D2D2D]">₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                {product.mrp && product.mrp > product.sellingPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
                )}
                {product.discount > 0 && (
                  <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">-{product.discount}%</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 py-4 border-y border-gray-100">
              <div className="flex flex-col items-center text-center p-2 rounded-lg text-[#2D2D2D]">
                <Truck size={24} className="mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg text-[#2D2D2D]">
                <Wrench size={24} className="mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Installation</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg text-[#2D2D2D]">
                <Store size={24} className="mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Store Pickup</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <button 
                onClick={() => setShowEnquireModal(true)}
                className="w-full py-4 bg-[#C41E24] hover:bg-[#9B1B20] text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center text-lg"
              >
                Enquire Now
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <a href={`https://wa.me/919629599265?text=${encodedMessage}`} target="_blank" rel="noopener noreferrer" className="py-3 bg-[#25D366] hover:bg-[#20b858] text-white font-medium rounded-xl transition-colors flex items-center justify-center">
                  WhatsApp
                </a>
                <a href="tel:9629599265" className="py-3 bg-[#2D2D2D] hover:bg-black text-white font-medium rounded-xl transition-colors flex items-center justify-center">
                  Call Store
                </a>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-start space-x-3">
              <Info size={20} className="text-[#C41E24] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p><strong>Warranty & Support:</strong> Standard manufacturer warranty applies to all genuine products.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-16 border-t border-gray-200">
          <div className="flex space-x-8 overflow-x-auto">
            {['Description', 'Specifications'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase() ? 'border-[#C41E24] text-[#C41E24]' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="py-8 prose max-w-none text-gray-600">
             {activeTab === 'description' && (
               <div dangerouslySetInnerHTML={{ __html: product.description || '<p>No description provided.</p>' }} />
             )}
             {activeTab === 'specifications' && (
               <div>
                 {product.specifications && product.specifications.length > 0 ? (
                   <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                     <table className="w-full text-sm text-left text-gray-600">
                       <tbody>
                         {product.specifications.map((spec, i) => (
                           <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                             <td className="px-6 py-4 font-medium text-gray-900 border-b border-gray-100 w-1/3 md:w-1/4">
                               {spec.name}
                             </td>
                             <td className="px-6 py-4 border-b border-gray-100">
                               {spec.value}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                   <p>No specifications provided.</p>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Enquire Modal */}
      {showEnquireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="bg-[#2D2D2D] text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold font-poppins">Enquire About Product</h3>
              <button onClick={() => setShowEnquireModal(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <form 
              className="p-6 space-y-4" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                alert('Enquiry submitted successfully! We will contact you soon.'); 
                setShowEnquireModal(false); 
              }}
            >
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                 <input type="text" readOnly value={product.name} className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-500" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                   <input type="text" required value={enquireForm.name} onChange={e => setEnquireForm({...enquireForm, name: e.target.value})} className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">Mobile *</label>
                   <input type="tel" required value={enquireForm.phone} onChange={e => setEnquireForm({...enquireForm, phone: e.target.value})} className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">Message (Optional)</label>
                 <textarea rows={3} value={enquireForm.message} onChange={e => setEnquireForm({...enquireForm, message: e.target.value})} className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#C41E24] focus:border-[#C41E24]" placeholder="I'd like to know the best price for this..."></textarea>
               </div>
               <div className="pt-2">
                 <button type="submit" className="w-full py-3 bg-[#C41E24] hover:bg-[#9B1B20] text-white font-bold rounded-lg transition-colors">
                   Send Enquiry
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

